/**
 * DuelBotGame — interface real de cada tipo de jogo no modo duelo contra o bot.
 *
 * Cobre: translation, trueFalse, listening, fillBlanks, wordBuilder, sentenceBuilder.
 * Hangman e Memory têm componentes próprios (DuelHangman, DuelMemory).
 *
 * Fluxo por rodada:
 *  1. Componente monta com a questão corrente e a config do bot.
 *  2. Um timer de bot (botConfig.minDelay–maxDelay) simula a resposta da IA.
 *  3. Quando o jogador responde (ou o tempo esgota), aguardamos o bot (max 3s extra).
 *  4. Ambos prontos → chama onRoundEnd({ playerScoreDelta, botScoreDelta }).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import useSpeech from '../../../hooks/useSpeech';
import useSound from '../../../hooks/useSound';
import { useProgress } from '../../../hooks/useProgress';
import { getCurrentLevel, getUserTitle } from '../../../utils/levelSystem';
import '../../../games/WordBuilder/WordBuilder.css';

// Tempo máximo por rodada — uniforme para todos os tipos
const TIME_LIMIT = 20;

// Delays do bot escalados para o timer de 20s
// Easy: responde perto do final; Hard: responde rapidamente
const BOT_DELAYS = {
  easy:   { min: 14000, max: 19500 },
  medium: { min:  8000, max: 14000 },
  hard:   { min:  3000, max:  7500 },
};

// Cria os tiles de letra com IDs únicos (para lidar com letras repetidas)
const makeLetterTiles = (scrambledText) =>
  scrambledText.split(' ').map((letter, i) => ({ letter, id: i, used: false }));

const DuelBotGame = ({
  question,       // { type, word, options, correctAnswer, scrambledText, blankedSentence, displayedPt }
  botConfig,      // { id, accuracy, name, minDelay, maxDelay }
  roundIndex,
  totalRounds,
  playerScore,
  botScore,
  playerAvatar,
  onRoundEnd,
  confirmExit,
  onRequestExit,
  onConfirmExit,
  onCancelExit,
}) => {
  const timeLimit = TIME_LIMIT;

  const [playerAnswer, setPlayerAnswer]   = useState(null);   // opção escolhida
  const [playerDone,   setPlayerDone]     = useState(false);
  const [botDone,      setBotDone]        = useState(false);
  const [botWon,       setBotWon]         = useState(false);
  const [timeLeft,     setTimeLeft]       = useState(TIME_LIMIT);
  const [roundSummary, setRoundSummary]   = useState(null);  // { playerDelta, botDelta } após resultado

  // WordBuilder: tiles com estado (usado / disponível) e slots de resposta
  const [tiles,        setTiles]          = useState(() =>
    question.type === 'wordBuilder' ? makeLetterTiles(question.scrambledText) : []
  );
  const [slots,        setSlots]          = useState(() =>
    question.type === 'wordBuilder'
      ? new Array(question.word.en.length).fill(null) // null = vazio, tile object = preenchido
      : []
  );

  const timerRef          = useRef(null);
  const roundEndCalledRef = useRef(false);
  const { speakNormal, speakSlow } = useSpeech();
  const { playCorrect, playWrong, playClick } = useSound();

  // ─── Fala a palavra no Listening ──────────────────────────────────────────
  useEffect(() => {
    if (question.type === 'listening') speakNormal(question.word.en);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishPlayer(null); // tempo esgotado → 0 pts
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Bot timer (delays realistas para timer de 20s) ──────────────────────────────────
  useEffect(() => {
    const range = BOT_DELAYS[botConfig.id] || BOT_DELAYS.medium;
    const delay = Math.random() * (range.max - range.min) + range.min;
    const timer = setTimeout(() => {
      setBotWon(Math.random() < botConfig.accuracy);
      setBotDone(true);
    }, delay);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Se jogador terminar e bot ainda não respondeu, force resposta em até 3s
  useEffect(() => {
    if (!playerDone || botDone) return;
    const timer = setTimeout(() => {
      setBotWon(Math.random() < botConfig.accuracy);
      setBotDone(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [playerDone, botDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Quando ambos terminam → mostra sumário por 2s → avança rodada ────────────────
  useEffect(() => {
    if (!playerDone || !botDone || roundEndCalledRef.current) return;
    roundEndCalledRef.current = true;

    const won = playerAnswer !== null &&
      playerAnswer.toLowerCase() === question.correctAnswer?.toLowerCase();

    const playerScoreDelta = won ? 100 : 0;
    const botScoreDelta    = botWon ? 100 : 0;

    setRoundSummary({ playerScoreDelta, botScoreDelta, playerWon: won, botWon });

    if (won) playCorrect();
    else if (playerAnswer !== null) playWrong();

    const timer = setTimeout(() => onRoundEnd({ playerScoreDelta, botScoreDelta }), 2500);
    return () => clearTimeout(timer);
  }, [playerDone, botDone, playerAnswer, botWon, question.correctAnswer, onRoundEnd, playCorrect, playWrong]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const finishPlayer = useCallback((answer) => {
    if (playerDone) return;
    clearInterval(timerRef.current);
    setPlayerAnswer(answer);
    setPlayerDone(true);
  }, [playerDone]);

  const handleOptionClick = useCallback((opt) => {
    if (playerDone) return;
    playClick();
    finishPlayer(opt);
  }, [playerDone, playClick, finishPlayer]);

  // WordBuilder: clica numa letra disponível → coloca no próximo slot vazio
  const handleTileClick = useCallback((tile) => {
    if (playerDone || tile.used) return;
    playClick();

    const nextEmpty = slots.findIndex(s => s === null);
    if (nextEmpty === -1) return;

    const newSlots = [...slots];
    newSlots[nextEmpty] = tile;
    setSlots(newSlots);
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));

    // Verificar se todos os slots estão preenchidos
    if (newSlots.every(s => s !== null)) {
      const formed = newSlots.map(s => s.letter).join('').toLowerCase();
      finishPlayer(formed);
    }
  }, [playerDone, slots, playClick, finishPlayer]);

  // WordBuilder: clica num slot preenchido → devolve a letra
  const handleSlotClick = useCallback((slotIdx) => {
    if (playerDone) return;
    const tile = slots[slotIdx];
    if (!tile) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: false } : t));
  }, [playerDone, slots]);

  // WordBuilder: limpar tudo
  const handleClearWord = useCallback(() => {
    if (playerDone) return;
    setSlots(new Array(question.word.en.length).fill(null));
    setTiles(makeLetterTiles(question.scrambledText));
  }, [playerDone, question]);

  // ─── Estado de resposta do jogador ────────────────────────────────────────
  const isCorrect = playerDone && playerAnswer !== null &&
    playerAnswer.toLowerCase() === question.correctAnswer?.toLowerCase();
  const isWrong   = playerDone && playerAnswer !== null && !isCorrect;
  const isTimeout = playerDone && playerAnswer === null;

  // ─── Calcula classe de cor de uma opção ───────────────────────────────────
  const optionClass = (opt) => {
    if (!playerDone) return '';
    if (opt.toLowerCase() === question.correctAnswer?.toLowerCase()) return 'correct';
    if (opt === playerAnswer) return 'incorrect';
    return '';
  };

  const timerPct   = (timeLeft / timeLimit) * 100;
  const timerUrgent = timeLeft <= 5;

  const { progress } = useProgress();
  const userLevelObj = getCurrentLevel(progress.wordsStudied || 0);
  const userTitle = getUserTitle(userLevelObj?.level || 1);

  const botLevelMap = { easy: 5, medium: 25, hard: 50 };
  const botLevel = botLevelMap[botConfig?.id] || 10;
  const botTitle = getUserTitle(botLevel);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="duel-match-container animate-fade-in-up">

      {/* Barra de saída */}
      <div className="duel-topbar">
        {confirmExit ? (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Sair? A partida será perdida.</span>
            <button className="btn btn-danger btn-sm" onClick={onConfirmExit}>Sair</button>
            <button className="btn btn-ghost btn-sm"  onClick={onCancelExit}>Ficar</button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onRequestExit}>✕ Sair da partida</button>
        )}
      </div>

      {/* Placar */}
      <div className="duel-scoreboard glass-card">
        <div className="player-profile player-profile--you">
          <div className="avatar">{playerAvatar || '👤'}</div>
          <div className="profile-info">
            <span className="profile-name">Você</span>
            <span className="profile-title" style={{ fontSize: '11px', color: 'var(--accent-purple-light)', fontWeight: 600 }}>{userTitle.tag}</span>
            <span className="profile-score">{playerScore} pts</span>
          </div>
        </div>
        <div className="vs-badge">
          <span>VS</span>
          <small>Rodada {roundIndex + 1}/{totalRounds}</small>
        </div>
        <div className="player-profile player-profile--opponent">
          <div className="avatar">🤖</div>
          <div className="profile-info">
            <span className="profile-name">{botConfig.name}</span>
            <span className="profile-title" style={{ fontSize: '11px', color: 'var(--accent-purple-light)', fontWeight: 600 }}>{botTitle.tag}</span>
            <span className="profile-score">{botScore} pts</span>
          </div>
        </div>
      </div>

      {/* Cronômetro */}
      <div className="timer-bar-container">
        <div
          className={`timer-bar-fill ${timerUrgent ? 'urgent' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
        <span className="timer-text">{timeLeft}s</span>
      </div>

      {/* ═══════════════════ CONTEÚDO POR TIPO ═══════════════════ */}

      {/* ── Tradução ─────────────────────────────────────────────── */}
      {question.type === 'translation' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">Qual é a tradução em português?</span>
            <div className="target-word">{question.word.en}</div>
            {question.word.pronunciation && (
              <span className="pronunciation">{question.word.pronunciation}</span>
            )}
          </div>
          <div className="options-grid">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleOptionClick(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Verdadeiro ou Falso ──────────────────────────────────── */}
      {question.type === 'trueFalse' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">A palavra em inglês significa…</span>
            <div className="target-word">{question.word.en}</div>
            <span className="duel-tip">"{question.displayedPt}"</span>
          </div>
          <div className="options-grid tf-grid">
            {['Verdadeiro', 'Falso'].map(opt => (
              <button
                key={opt}
                className={`option-btn ${opt === 'Verdadeiro' ? 'tf-true' : 'tf-false'} ${optionClass(opt)}`}
                onClick={() => handleOptionClick(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{opt === 'Verdadeiro' ? '✅' : '❌'}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Escuta ───────────────────────────────────────────────── */}
      {question.type === 'listening' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">Ouça e escolha a tradução correta</span>
            <div className="listening-controls">
              <button className="btn btn-primary" onClick={() => speakNormal(question.word.en)}>
                🔊 Ouvir
              </button>
              <button className="btn btn-secondary" onClick={() => speakSlow(question.word.en)}>
                🐌 Devagar
              </button>
            </div>
          </div>
          <div className="options-grid">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleOptionClick(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Complete a Frase ─────────────────────────────────────── */}
      {question.type === 'fillBlanks' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">Complete a frase com a palavra correta</span>
            <p className="duel-tip" style={{ fontSize: 'var(--fs-lg)', textAlign: 'center' }}>
              {question.blankedSentence}
            </p>
          </div>
          <div className="options-grid">
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleOptionClick(opt)}
                disabled={playerDone}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Montar Palavras (WordBuilder) ────────────────────────── */}
      {question.type === 'wordBuilder' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">Monte a palavra em inglês</span>
            <p className="duel-hint">Tradução: <strong>{question.word.pt}</strong></p>

            {/* Slots de resposta */}
            <div className={`wb-answer ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
              {slots.map((slot, i) => (
                <button
                  key={i}
                  className={`wb-slot ${slot ? 'filled' : ''}`}
                  onClick={() => handleSlotClick(i)}
                  disabled={playerDone}
                >
                  {slot?.letter ?? ''}
                </button>
              ))}
            </div>

            {/* Botão limpar */}
            {!playerDone && slots.some(s => s !== null) && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 'var(--space-sm)' }}
                onClick={handleClearWord}
              >
                🗑️ Limpar
              </button>
            )}
          </div>

          {/* Tiles de letras embaralhadas */}
          <div className="wb-letters">
            {tiles.map(tile => (
              <button
                key={tile.id}
                className="wb-letter-btn"
                onClick={() => handleTileClick(tile)}
                disabled={tile.used || playerDone}
                style={{ opacity: tile.used ? 0.3 : 1 }}
              >
                {tile.letter}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Montar Frases (SentenceBuilder) ─────────────────────── */}
      {question.type === 'sentenceBuilder' && (
        <>
          <div className="question-card glass-card">
            <span className="question-label">Qual é a tradução desta frase?</span>
            <p className="duel-tip">{question.word.example}</p>
          </div>
          <div className="options-grid" style={{ gridTemplateColumns: '1fr' }}>
            {question.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${optionClass(opt)}`}
                onClick={() => handleOptionClick(opt)}
                disabled={playerDone}
                style={{ textAlign: 'left' }}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ═══════════════════ RESULTADO DO JOGADOR ════════════════ */}
      {playerDone && (
        <div
          className="duel-status-bar glass-card animate-bounce-in"
          style={{
            marginTop: 'var(--space-md)',
            background:   isCorrect  ? 'var(--bg-green-subtle)' :
                          isTimeout  ? 'var(--bg-tertiary)'      : 'var(--bg-red-subtle)',
            border: `1px solid ${isCorrect ? 'var(--accent-green)' :
                                 isTimeout ? 'var(--border-color)' : 'var(--accent-red)'}`,
          }}
        >
          <strong style={{
            color: isCorrect  ? 'var(--accent-green)'       :
                   isTimeout  ? 'var(--text-secondary)'      : 'var(--accent-red)',
          }}>
            {isCorrect  ? '✅ Correto! +100 pts'       :
             isTimeout  ? '⏱️ Tempo esgotado!'         : `❌ Incorreto! Era: "${question.correctAnswer}"`}
          </strong>
        </div>
      )}

      {/* ═══════════════════ RESULTADO COMBINADO DA RODADA ══════════════════ */}
      {roundSummary ? (
        /* Ambos terminaram → mostra quem ganhou o quê */
        <div className="duel-status-bar glass-card animate-bounce-in" style={{
          marginTop: 'var(--space-md)',
          background: roundSummary.playerWon ? 'var(--bg-green-subtle)' : roundSummary.playerScoreDelta === roundSummary.botScoreDelta ? 'var(--bg-tertiary)' : 'var(--bg-red-subtle)',
          border: `1px solid ${roundSummary.playerWon ? 'var(--accent-green)' : roundSummary.playerScoreDelta === roundSummary.botScoreDelta ? 'var(--border-color)' : 'var(--accent-red)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>Você</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: roundSummary.playerWon ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {roundSummary.playerWon ? '✅' : (roundSummary.playerScoreDelta === roundSummary.botScoreDelta ? '🤝' : '❌')} {roundSummary.playerScoreDelta} pts
              </div>
            </div>
            <div style={{ fontSize: 'var(--fs-lg)', color: 'var(--text-muted)', fontWeight: 700 }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>{botConfig.name}</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: roundSummary.botWon ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {roundSummary.botWon ? '✅' : '❌'} {roundSummary.botScoreDelta} pts
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Rodada ainda em curso */
        <div className="duel-status-bar glass-card" style={{ marginTop: 'var(--space-md)' }}>
          {playerDone && !botDone ? (
            /* Jogador terminou, aguardando bot */
            <div className="opponent-thinking">
              <span className="spinner" />
              <span>Aguardando {botConfig.name}...</span>
            </div>
          ) : botDone && !playerDone ? (
            /* Bot terminou primeiro — pressão! */
            <div className="opponent-response animate-bounce-in">
              <span>{botConfig.name} respondeu!</span>
              <strong style={{ color: 'var(--accent-orange-light)' }}>⏱️ Corra!</strong>
            </div>
          ) : (
            /* Ambos ainda jogando */
            <div className="opponent-thinking">
              <span className="spinner" />
              <span>{botConfig.name} está respondendo...</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default DuelBotGame;
