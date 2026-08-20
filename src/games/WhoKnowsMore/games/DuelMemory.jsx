import { useState, useEffect, useRef, useCallback } from 'react';
import { shuffleArray } from '../../../data/words';
import { AVAILABLE_COURSES } from '../../../data/index';
import { useProgress } from '../../../hooks/useProgress';
import useSound from '../../../hooks/useSound';
import useSpeech from '../../../hooks/useSpeech';
import AvatarDisplay from '../../../components/Avatar/AvatarDisplay';
import '../../../games/MemoryGame/MemoryGame.css';

// Tempo simulado do bot para encontrar 4 pares (ms)
// Os valores são propositalmente altos: o jogador precisa de tempo para virar 8 cartas
const BOT_MEMORY_RANGE = {
  easy:   { min: 48000, max: 70000 },
  medium: { min: 28000, max: 45000 },
  hard:   { min: 15000, max: 28000 },
};

const DuelMemory = ({
  words,          // array de 4 word objects
  botConfig,      // { id, accuracy, name, ... }
  roundIndex,
  totalRounds,
  playerScore,
  botScore,
  playerAvatar,
  onRoundEnd,     // ({ playerScoreDelta, botScoreDelta })
  confirmExit,
  onRequestExit,
  onConfirmExit,
  onCancelExit,
}) => {
  const PAIRS = words.length; // 4

  const [cards] = useState(() => {
    const pairs = words.flatMap((word, idx) => [
      { id: idx * 2,     wordIndex: idx, type: 'en', text: word.en, word },
      { id: idx * 2 + 1, wordIndex: idx, type: 'pt', text: word.pt, word },
    ]);
    return shuffleArray(pairs);
  });

  const [flipped,    setFlipped]    = useState([]);
  const [matched,    setMatched]    = useState([]);
  const [attempts,   setAttempts]   = useState(0);
  const [playerDone, setPlayerDone] = useState(false);
  const [botDone,    setBotDone]    = useState(false);
  const [roundResult, setRoundResult] = useState(null); // { playerWon, playerScoreDelta, botScoreDelta }

  const startTimeRef          = useRef(Date.now());
  const botDelayRef           = useRef(null);
  const roundEndCalledRef     = useRef(false);
  const { playFlip, playMatch, playCorrect } = useSound();
  const { speakNormal } = useSpeech();
  const { progress } = useProgress();
  // Bandeira do idioma-alvo do curso ativo — este componente é usado no modo
  // bot (não no duelo humano, que é English-only), então precisa refletir o
  // curso ativo em vez de assumir sempre inglês.
  const targetFlag = AVAILABLE_COURSES.find(c => c.id === (progress.activeCourse || 'en-pt'))?.flag || '🇺🇸';
  const targetName = (AVAILABLE_COURSES.find(c => c.id === (progress.activeCourse || 'en-pt'))?.targetName || 'Inglês').toLowerCase();

  // ─── Bot timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    const range = BOT_MEMORY_RANGE[botConfig.id] || BOT_MEMORY_RANGE.medium;
    const delay = Math.random() * (range.max - range.min) + range.min;
    botDelayRef.current = delay;

    const timer = setTimeout(() => setBotDone(true), delay);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Se o jogador terminar e o bot ainda não respondeu, espera 2s e força o resultado
  useEffect(() => {
    if (!playerDone || botDone) return;
    const timer = setTimeout(() => setBotDone(true), 2000);
    return () => clearTimeout(timer);
  }, [playerDone, botDone]);

  // Quando ambos terminam → calcula resultado → aguarda 2s → avança rodada
  useEffect(() => {
    if (!playerDone || !botDone || roundEndCalledRef.current) return;
    roundEndCalledRef.current = true;

    const playerTime = Date.now() - startTimeRef.current;
    const playerWon  = playerTime <= (botDelayRef.current ?? Infinity);

    // Pontuação base 100; -5 por tentativa extra além do mínimo de pares
    const rawScore = Math.max(10, 100 - Math.max(0, (attempts - PAIRS) * 5));
    const playerScoreDelta = rawScore;
    const botScoreDelta    = playerWon ? 0 : 100;

    setRoundResult({ playerWon, playerScoreDelta, botScoreDelta });
    playCorrect();

    const timer = setTimeout(() => onRoundEnd({ playerScoreDelta, botScoreDelta }), 2000);
    return () => clearTimeout(timer);
  }, [playerDone, botDone, attempts, PAIRS, onRoundEnd, playCorrect]);

  // ─── Lógica das cartas ────────────────────────────────────────────────────
  const handleCardClick = useCallback((cardId) => {
    if (flipped.length === 2 || flipped.includes(cardId) || matched.includes(cardId) || playerDone) return;

    playFlip();
    // Fala a palavra ao virar a carta em inglês — mesma regra do
    // MemoryGame.jsx: a voz é sempre en-US, só faz sentido no lado 'en'.
    const clicked = cards.find(c => c.id === cardId);
    if (clicked?.type === 'en') speakNormal(clicked.text);
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(prev => prev + 1);
      const c1 = cards.find(c => c.id === newFlipped[0]);
      const c2 = cards.find(c => c.id === newFlipped[1]);

      if (c1.wordIndex === c2.wordIndex) {
        // Não fala a palavra aqui: o par sempre tem um lado 'en', e virar
        // essa carta já falou a mesma palavra há poucos milissegundos.
        playMatch();
        const newMatched = [...matched, newFlipped[0], newFlipped[1]];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length) setPlayerDone(true);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  }, [flipped, matched, cards, playerDone, playFlip, playMatch, speakNormal]);

  const pairsFound = matched.length / 2;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="duel-match-container animate-fade-in-up">

      {/* Barra de saída */}
      <div className="duel-topbar">
        {confirmExit ? (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Sair? A rodada será perdida.</span>
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
          <AvatarDisplay avatar={playerAvatar || '👤'} size="sm" />
          <div className="profile-info">
            <span className="profile-name">Você</span>
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
            <span className="profile-score">{botScore} pts</span>
          </div>
        </div>
      </div>

      {/* Progresso */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
        🃏 Encontre os {PAIRS} pares: {targetName} + português &nbsp;|&nbsp; {pairsFound}/{PAIRS} pares encontrados
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="progress-bar-fill" style={{ width: `${(pairsFound / PAIRS) * 100}%` }} />
      </div>

      {/* Grade de cartas — 4 colunas (4 pares = 8 cartas) */}
      <div className="memory-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-md)' }}>
        {cards.map(card => {
          const isFlipped  = flipped.includes(card.id);
          const isMatched  = matched.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              disabled={isMatched || playerDone}
            >
              <div className="memory-card-inner">
                <div className="memory-card-front"><span>?</span></div>
                <div className="memory-card-back">
                  <span className={`card-text ${card.type === 'en' ? 'en' : 'pt'}`}>{card.text}</span>
                  <span className="card-lang">{card.type === 'en' ? targetFlag : '🇧🇷'}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Banner de resultado do jogador */}
      {roundResult && (
        <div className="duel-status-bar glass-card animate-bounce-in" style={{
          marginBottom: 'var(--space-md)',
          background:   roundResult.playerWon ? 'var(--bg-green-subtle)' : 'var(--bg-red-subtle)',
          border:       `1px solid ${roundResult.playerWon ? 'var(--accent-green)' : 'var(--accent-red)'}`,
        }}>
          <strong style={{ color: roundResult.playerWon ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {roundResult.playerWon
              ? `✅ Você foi mais rápido! +${roundResult.playerScoreDelta} pts`
              : `❌ O bot foi mais rápido! +${roundResult.playerScoreDelta} pts pelo esforço`}
          </strong>
        </div>
      )}

      {/* Status do bot */}
      <div className="duel-status-bar glass-card">
        {botDone ? (
          <div className="opponent-response animate-bounce-in">
            <span>{botConfig.name} completou todos os pares!</span>
            {roundResult ? (
              <strong className={roundResult.playerWon ? 'text-red' : 'text-green'}>
                {roundResult.playerWon ? '❌ Chegou depois!' : '✅ +100'}
              </strong>
            ) : (
              <strong style={{ color: 'var(--accent-orange-light)' }}>
                ⏱️ Corra! Ainda dá tempo!
              </strong>
            )}
          </div>
        ) : (
          <div className="opponent-thinking">
            <span className="spinner" />
            <span>{botConfig.name} está virando as cartas...</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default DuelMemory;
