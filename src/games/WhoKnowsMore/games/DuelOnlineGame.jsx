/**
 * DuelOnlineGame — interface real de jogo para o modo duelo humano vs humano.
 *
 * Recebe `duel` (o hook useDuelSocket) e renderiza a mesma UI que DuelBotGame,
 * mas com:
 *  - Timer baseado em duel.roundDeadline (servidor) em vez de timer local
 *  - Submissão via duel.submitAnswer() em vez de callback onRoundEnd
 *  - Resultado via duel.roundResult (quando o servidor envia round:result)
 *  - Memory online: ao completar todos os pares, emite duel.submitAnswer('completed')
 *  - Hangman online: ao acertar ou errar, emite duel.submitAnswer(word)
 */
import { useState, useEffect, useRef } from 'react';
import useSpeech from '../../../hooks/useSpeech';
import useSound from '../../../hooks/useSound';
import { useProgress } from '../../../hooks/useProgress';
import { getCurrentLevel, getUserTitle } from '../../../utils/levelSystem';
import OnlineHangman from './OnlineHangman';
import WildcardPanel from './WildcardPanel';
import AvatarDisplay from '../../../components/Avatar/AvatarDisplay';
import '../../../games/WordBuilder/WordBuilder.css';
import '../../../games/MemoryGame/MemoryGame.css';

// Cria tiles com IDs únicos para lidar com letras repetidas
const makeTiles = (word) =>
  word.toUpperCase().split('').map((ch, i) => ({ id: `${i}-${ch}`, letter: ch, used: false }));

// ─── Componente de Memória Online ───────────────────────────────────────────
const OnlineMemoryBoard = ({ wordGroup, onCompleted }) => {
  const { speakNormal } = useSpeech();
  // wordGroup: [{ en, pt, pronunciation }]
  const createDeck = (group) =>
    (group || []).flatMap((w, i) => [
      { id: `en-${i}`, text: w.en, pairKey: i, type: 'en' },
      { id: `pt-${i}`, text: w.pt, pairKey: i, type: 'pt' },
    ]).sort(() => Math.random() - 0.5);

  const [deck, setDeck] = useState(() => createDeck(wordGroup));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const completedRef = useRef(false);

  useEffect(() => {
    setDeck(createDeck(wordGroup));
    setFlipped([]);
    setMatched(new Set());
    completedRef.current = false;
  }, [wordGroup]);

  const handleCardClick = (card) => {
    if (matched.has(card.pairKey) || card.id === flipped[0]?.id) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card];
    setFlipped(next);

    if (next.length === 2) {
      if (next[0].pairKey === next[1].pairKey && next[0].type !== next[1].type) {
        // Par correto
        const wordObj = wordGroup[card.pairKey];
        if (wordObj?.en) speakNormal(wordObj.en);

        const newMatched = new Set([...matched, card.pairKey]);
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.size === wordGroup.length && !completedRef.current) {
          completedRef.current = true;
          onCompleted();
        }
      } else {
        // Errado — vira de volta após 900ms
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="memory-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: 'var(--space-md)' }}>
      {deck.map(card => {
        const isFlipped = flipped.some(f => f.id === card.id) || matched.has(card.pairKey);
        return (
          <button
            key={card.id}
            className={`memory-card ${isFlipped ? 'flipped' : ''} ${matched.has(card.pairKey) ? 'matched' : ''}`}
            onClick={() => !isFlipped && handleCardClick(card)}
            disabled={isFlipped && !matched.has(card.pairKey) && flipped.length === 2}
          >
            <div className="memory-card-inner">
              <div className="memory-card-front"><span>?</span></div>
              <div className="memory-card-back">
                <span className={`card-text ${card.type === 'en' ? 'en' : 'pt'}`}>{card.text}</span>
                <span className="card-lang">{card.type === 'en' ? '🇺🇸' : '🇧🇷'}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────
const DuelOnlineGame = ({
  question,
  duel,
  playerAvatar = '👤',
  confirmExit,
  onRequestExit,
  onConfirmExit,
  onCancelExit,
}) => {
  const { speakNormal, speakSlow } = useSpeech();
  const { playCorrect, playWrong } = useSound();
  const { progress } = useProgress();

  // Título do jogador com base no nível real (localStorage) — o oponente não
  // tem essa informação: o servidor de duelo nunca recebe wordsStudied de
  // ninguém (progresso é 100% client-side), então não há level real para
  // exibir do outro lado. Mostrar um título inventado seria enganoso.
  const userLevelObj = getCurrentLevel(progress.wordsStudied || 0);
  const userTitle = getUserTitle(userLevelObj?.level || 1);

  // Timer baseado no roundDeadline do servidor
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!duel.roundDeadline) return 20;
    return Math.max(0, Math.round((duel.roundDeadline - Date.now() + duel.clockOffsetRef.current) / 1000));
  });
  const [playerAnswer, setPlayerAnswer]   = useState(null);
  const [playerDone,   setPlayerDone]     = useState(false);

  // WordBuilder state
  const [tiles,  setTiles]  = useState(() => question.type === 'wordBuilder' ? makeTiles(question.prompt?.scrambledText?.replace(/ /g, '') || '') : []);
  const [slots,  setSlots]  = useState([]);

  // ── Estados de Coringa (Wildcard) & Emotes ───────────────────────────────
  const [activeEffect, setActiveEffect]   = useState(null); // 'flip' | 'blur' | 'shuffle' | 'mute' | null
  const [alertBanner, setActiveBanner]    = useState(null); // texto de aviso
  const [shuffledOptions, setShuffledOptions] = useState(null);
  const [isMuted, setIsMuted]               = useState(false);
  const [activeMyEmote, setActiveMyEmote]   = useState(null);
  const [activeOppEmote, setActiveOppEmote] = useState(null);

  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  // Efeito de escuta respeita o mute do coringa
  const safeSpeak = (fn, text) => {
    if (isMuted) return;
    fn(text);
  };

  // Re-inicializa estado por rodada
  useEffect(() => {
    setShuffledOptions(null);
  }, [question]);

  // Escuta efeitos de Coringa enviados pelo oponente
  useEffect(() => {
    if (!duel.wildcardEffect) return;
    const { wildcardValue } = duel.wildcardEffect;

    const opName = duel.opponent?.nickname || 'Oponente';

    if (wildcardValue === 'flip') {
      setActiveEffect('flip');
      setActiveBanner(`🙃 ${opName} usou Mundo ao Contrário!`);
      const t = setTimeout(() => {
        setActiveEffect(null);
        setActiveBanner(null);
      }, 8000);
      return () => clearTimeout(t);
    }

    if (wildcardValue === 'blur') {
      setActiveEffect('blur');
      setActiveBanner(`🌫️ ${opName} usou Névoa Mental!`);
      const t = setTimeout(() => {
        setActiveEffect(null);
        setActiveBanner(null);
      }, 6000);
      return () => clearTimeout(t);
    }

    if (wildcardValue === 'shuffle') {
      setActiveEffect('shuffle');
      setActiveBanner(`🔀 ${opName} embaralhou suas opções!`);
      if (question.options) {
        setShuffledOptions([...question.options].sort(() => Math.random() - 0.5));
      }
      if (tiles.length > 0) {
        setTiles([...tiles].sort(() => Math.random() - 0.5));
      }
      const t = setTimeout(() => {
        setActiveEffect(null);
        setActiveBanner(null);
      }, 2000);
      return () => clearTimeout(t);
    }

    if (wildcardValue === 'mute') {
      setIsMuted(true);
      setActiveBanner(`🤫 ${opName} silenciou seu áudio!`);
      const t = setTimeout(() => {
        setIsMuted(false);
        setActiveBanner(null);
      }, 10000);
      return () => clearTimeout(t);
    }
  }, [duel.wildcardEffect]);

  // Escuta emotes recebidos em tempo real
  useEffect(() => {
    if (!duel.receivedEmote) return;
    const { emoji, senderId, id } = duel.receivedEmote;
    if (senderId === duel.myId) {
      setActiveMyEmote({ emoji, key: id });
    } else {
      setActiveOppEmote({ emoji, key: id });
    }
  }, [duel.receivedEmote, duel.myId]);

  const handleSendEmote = (emoji) => {
    duel.sendEmote(emoji);
    setActiveMyEmote({ emoji, key: Date.now() });
  };

  // ── Fala a palavra no Listening ──────────────────────────────────────────
  useEffect(() => {
    if (question.type === 'listening' && question.prompt?.en) {
      speakNormal(question.prompt.en);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer descendente baseado no servidor ────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const remaining = duel.roundDeadline
        ? Math.max(0, Math.round((duel.roundDeadline - Date.now() + (duel.clockOffsetRef?.current ?? 0)) / 1000))
        : 0;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        if (!submittedRef.current) {
          submittedRef.current = true;
          setPlayerDone(true);
          duel.submitAnswer(''); // tempo esgotado → resposta em branco
        }
      }
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [duel.roundDeadline]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (choice) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    // Só fillBlanks tem opções em inglês (listening/translation/trueFalse/
    // sentenceBuilder mostram a tradução em português, e memory manda
    // 'completed' — não é uma palavra) — a voz é sempre en-US, não faz
    // sentido nos outros tipos.
    if (question.type === 'fillBlanks') speakNormal(choice);
    setPlayerAnswer(choice);
    setPlayerDone(true);
    duel.submitAnswer(choice);
  };

  // Determina se a opção está correta após o round:result chegar
  const roundResult = duel.roundResult;
  const myResult    = roundResult?.answers?.find(a => a.id === duel.myId);
  const oppResult   = roundResult?.answers?.find(a => a.id !== duel.myId);
  const opName      = duel.opponent?.nickname || 'Oponente';

  const optionClass = (opt) => {
    if (!roundResult) {
      if (opt === playerAnswer) return 'pending';
      return '';
    }
    if (opt === roundResult.correctAnswer) return 'correct';
    if (opt === playerAnswer && !myResult?.correct) return 'incorrect';
    return '';
  };

  const timerPct = duel.roundDeadline
    ? Math.max(0, Math.min(100, ((duel.roundDeadline - Date.now()) / (duel.roundMs ?? 60000)) * 100))
    : 0;

  const currentOptions = shuffledOptions || question.options || [];
  const containerClass = `duel-match-container animate-fade-in-up ${
    activeEffect === 'flip' ? 'wildcard-flipped' : ''
  } ${activeEffect === 'blur' ? 'wildcard-blurred' : ''} ${
    activeEffect === 'shuffle' ? 'wildcard-shuffling' : ''
  }`;

  return (
    <div className={containerClass}>

      {/* Banner de alerta de Coringa recebido */}
      {alertBanner && (
        <div className="wildcard-alert-banner">
          {alertBanner}
        </div>
      )}

      {/* ── Topbar com saída ─────────────────────────────────────────────── */}
      <div className="duel-topbar">
        {confirmExit ? (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>
              Sair? A partida será perdida.
            </span>
            <button className="btn btn-danger btn-sm" onClick={onConfirmExit}>Sair</button>
            <button className="btn btn-ghost btn-sm" onClick={onCancelExit}>Ficar</button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onRequestExit}>✕ Sair da partida</button>
        )}
      </div>

      {/* ── Placar ───────────────────────────────────────────────────────── */}
      <div className="duel-scoreboard glass-card" style={{ position: 'relative' }}>
        <div className="player-profile player-profile--you" style={{ position: 'relative' }}>
          {activeMyEmote && (
            <div key={activeMyEmote.key} className="floating-emote-bubble">
              {activeMyEmote.emoji}
            </div>
          )}
          <AvatarDisplay avatar={playerAvatar || '👤'} size="sm" />
          <div className="profile-info">
            <span className="profile-name">Você</span>
            <span className="profile-title" style={{ fontSize: '11px', color: 'var(--accent-purple-light)', fontWeight: 600 }}>{userTitle.tag}</span>
            <span className="profile-score">{duel.scores?.[duel.myId] ?? 0} pts</span>
          </div>
        </div>
        <div className="vs-badge">
          <span>VS</span>
          <small>Rodada {duel.roundIndex + 1}/{duel.totalRounds}</small>
        </div>
        <div className="player-profile player-profile--opponent" style={{ position: 'relative' }}>
          {activeOppEmote && (
            <div key={activeOppEmote.key} className="floating-emote-bubble">
              {activeOppEmote.emoji}
            </div>
          )}
          <AvatarDisplay avatar={duel.opponent?.avatar || '🧑'} size="sm" />
          <div className="profile-info">
            <span className="profile-name">{opName}</span>
            <span className="profile-score">{duel.scores?.[duel.opponent?.id] ?? 0} pts</span>
          </div>
        </div>
      </div>

      {/* ── Timer ────────────────────────────────────────────────────────── */}
      <div className="timer-bar-container">
        <div
          className={`timer-bar-fill ${timeLeft <= 5 ? 'urgent' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
        <span className="timer-text">⏱️ {timeLeft}s</span>
      </div>

      {/* ── Painel de Ativação de Coringas e Reações ─────────────────────── */}
      {!playerDone && (
        <WildcardPanel
          onUseWildcard={(wcValue) => duel.useWildcard(wcValue)}
          onSendEmote={handleSendEmote}
          isRoundActive={!playerDone && timeLeft > 0}
        />
      )}

      {/* ═══════════ CONTEÚDO POR TIPO DE JOGO ═══════════════════════════ */}

      {/* Memória */}
      {question.type === 'memory' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">🃏 Encontre os 4 pares inglês ↔ português</span>
            <small className="text-secondary">Quem completar primeiro ganha!</small>
          </div>
          {!playerDone && (
            <OnlineMemoryBoard
              wordGroup={question.wordGroup || []}
              onCompleted={() => handleAnswer('completed')}
            />
          )}
          {playerDone && (
            <div className="question-card glass-card" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-2xl)' }}>✅</span>
              <p>Você completou todos os pares!</p>
            </div>
          )}
        </>
      )}

      {/* Forca */}
      {question.type === 'hangman' && !playerDone && (
        <OnlineHangman
          tip={question.prompt?.tip || ''}
          wordTemplate={question.prompt?.wordTemplate || ''}
          duel={duel}
          onAnswer={handleAnswer}
        />
      )}
      {question.type === 'hangman' && playerDone && (
        <div className="question-card glass-card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 'var(--fs-2xl)' }}>📤</span>
          <p>Resposta enviada: <strong>"{playerAnswer}"</strong></p>
        </div>
      )}

      {/* Escuta */}
      {question.type === 'listening' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">🎧 Ouça e escolha a tradução correta</span>
            <div className="listening-controls">
              <button className="btn btn-primary" onClick={() => safeSpeak(speakNormal, question.prompt?.en)} disabled={isMuted}>
                {isMuted ? '🔇 Silenciado' : '🔊 Ouvir'}
              </button>
              <button className="btn btn-secondary" onClick={() => safeSpeak(speakSlow, question.prompt?.en)} disabled={isMuted}>
                🐌 Devagar
              </button>
            </div>
          </div>
          <div className="options-grid">
            {currentOptions.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleAnswer(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Tradução */}
      {question.type === 'translation' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">🎯 Qual é a tradução de:</span>
            <h2 className="target-word">{question.prompt?.en}</h2>
            <span className="pronunciation">{question.prompt?.pronunciation}</span>
          </div>
          <div className="options-grid">
            {currentOptions.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleAnswer(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Verdadeiro ou Falso */}
      {question.type === 'trueFalse' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">✅ Esta tradução está correta?</span>
            <h2 className="target-word">{question.prompt?.en}</h2>
            <span className="duel-hint">= "{question.prompt?.displayedPt}"</span>
          </div>
          <div className="options-grid tf-grid">
            {['Verdadeiro', 'Falso'].map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${i === 0 ? 'tf-true' : 'tf-false'} ${optionClass(opt)}`}
                onClick={() => handleAnswer(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{opt === 'Verdadeiro' ? '✅' : '❌'}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Complete a Frase */}
      {question.type === 'fillBlanks' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">✏️ Que palavra preenche a lacuna?</span>
            <h3 className="target-word" style={{ fontSize: 'var(--fs-xl)' }}>
              "{question.prompt?.blankedSentence}"
            </h3>
          </div>
          <div className="options-grid">
            {currentOptions.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleAnswer(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Montar Palavra */}
      {question.type === 'wordBuilder' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">🔡 Monte a palavra:</span>
            <p className="duel-hint">Dica: {question.prompt?.ptHint}</p>
            <div className="wb-answer">
              {slots.map((s, i) => (
                <button
                  key={i}
                  className="wb-slot filled"
                  disabled={playerDone}
                  onClick={() => {
                    if (playerDone) return;
                    speakNormal(s.letter);
                    const newSlots = slots.filter((_, si) => si !== i);
                    const tile = tiles.find(t => t.id === s.id);
                    if (tile) setTiles(tiles.map(t => t.id === s.id ? { ...t, used: false } : t));
                    setSlots(newSlots);
                  }}
                >
                  {s.letter}
                </button>
              ))}
              {Array.from({ length: Math.max(0, (question.prompt?.scrambledText?.replace(/ /g, '').length || 0) - slots.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="wb-slot" />
              ))}
            </div>
            <div className="wb-letters">
              {tiles.filter(t => !t.used).map(tile => (
                <button
                  key={tile.id}
                  className="wb-letter-btn"
                  disabled={playerDone}
                  onClick={() => {
                    speakNormal(tile.letter);
                    const newSlots = [...slots, tile];
                    setTiles(tiles.map(t => t.id === tile.id ? { ...t, used: true } : t));
                    setSlots(newSlots);
                    const word = newSlots.map(s => s.letter).join('');
                    const total = question.prompt?.scrambledText?.replace(/ /g, '').length || 0;
                    if (newSlots.length === total) handleAnswer(word);
                  }}
                >
                  {tile.letter}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Montar Frase */}
      {question.type === 'sentenceBuilder' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">📝 Escolha a tradução da frase:</span>
            <h3 className="target-word" style={{ fontSize: 'var(--fs-xl)' }}>
              "{question.prompt?.exampleEn}"
            </h3>
          </div>
          <div className="options-grid">
            {currentOptions.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleAnswer(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ═══════════════ RESULTADO COMBINADO ════════════════════════════ */}
      {roundResult ? (
        <div className="duel-status-bar glass-card animate-bounce-in" style={{
          marginTop: 'var(--space-md)',
          background: myResult?.correct ? 'var(--bg-green-subtle)' : 'var(--bg-red-subtle)',
          border: `1px solid ${myResult?.correct ? 'var(--accent-green)' : 'var(--accent-red)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Você</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: myResult?.correct ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {myResult?.correct ? '✅' : '❌'} {myResult?.pointsEarned ?? 0} pts
              </div>
            </div>
            <div style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-muted)', fontWeight: 700 }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>{opName}</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: oppResult?.correct ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {oppResult?.correct ? '✅' : '❌'} {oppResult?.pointsEarned ?? 0} pts
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="duel-status-bar glass-card" style={{ marginTop: 'var(--space-md)' }}>
          {playerDone ? (
            <div className="opponent-thinking">
              <span className="spinner" />
              <span>Aguardando {opName}…</span>
            </div>
          ) : (
            <div className="opponent-thinking">
              <span className="spinner" />
              <span>{opName} está jogando…</span>
            </div>
          )}
        </div>
      )}

      {duel.answerError && (
        <p className="text-red" style={{ textAlign: 'center', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-sm)' }}>
          {duel.answerError}
        </p>
      )}
    </div>
  );
};

export default DuelOnlineGame;
