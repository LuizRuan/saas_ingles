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
import OnlineHangman from './OnlineHangman';
import '../../../games/WordBuilder/WordBuilder.css';
import '../../../games/MemoryGame/MemoryGame.css';

// Cria tiles com IDs únicos para lidar com letras repetidas
const makeTiles = (word) =>
  word.toUpperCase().split('').map((ch, i) => ({ id: `${i}-${ch}`, letter: ch, used: false }));

// ─── Componente de Memória Online ───────────────────────────────────────────
const OnlineMemoryBoard = ({ wordGroup, onCompleted }) => {
  // wordGroup: [{ en, pt, pronunciation }]
  const cards = wordGroup.flatMap((w, i) => [
    { id: `en-${i}`, text: w.en, pairKey: i, type: 'en' },
    { id: `pt-${i}`, text: w.pt, pairKey: i, type: 'pt' },
  ]).sort(() => Math.random() - 0.5);

  const [deck, setDeck] = useState(cards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const completedRef = useRef(false);

  const handleCardClick = (card) => {
    if (matched.has(card.pairKey) || card.id === flipped[0]?.id) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card];
    setFlipped(next);

    if (next.length === 2) {
      if (next[0].pairKey === next[1].pairKey && next[0].type !== next[1].type) {
        // Par correto
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
  const { speakText: speakNormal } = useSpeech({ rate: 1.0 });
  const { speakText: speakSlow }   = useSpeech({ rate: 0.6 });
  const { playCorrect, playWrong } = useSound();

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

  const timerRef = useRef(null);
  const submittedRef = useRef(false);

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
    ? Math.max(0, Math.min(100, ((duel.roundDeadline - Date.now()) / (duel.roundMs ?? 20000)) * 100))
    : 0;

  return (
    <div className="duel-match-container animate-fade-in-up">

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
      <div className="duel-scoreboard glass-card">
        <div className="player-profile player-profile--you">
          <div className="avatar" aria-hidden="true">{playerAvatar}</div>
          <div className="profile-info">
            <span className="profile-name">Você</span>
            <span className="profile-score">{duel.scores?.[duel.myId] ?? 0} pts</span>
          </div>
        </div>
        <div className="vs-badge">
          <span>VS</span>
          <small>Rodada {duel.roundIndex + 1}/{duel.totalRounds}</small>
        </div>
        <div className="player-profile player-profile--opponent">
          <div className="avatar" aria-hidden="true">🧑</div>
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
              <button className="btn btn-primary" onClick={() => speakNormal(question.prompt?.en)}>
                🔊 Ouvir
              </button>
              <button className="btn btn-secondary" onClick={() => speakSlow(question.prompt?.en)}>
                🐌 Devagar
              </button>
            </div>
          </div>
          <div className="options-grid">
            {(question.options || []).map((opt, i) => (
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
            {(question.options || []).map((opt, i) => (
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
            <span className="duel-hint">Tradução: {question.prompt?.examplePt}</span>
          </div>
          <div className="options-grid">
            {(question.options || []).map((opt, i) => (
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
            {(question.options || []).map((opt, i) => (
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
