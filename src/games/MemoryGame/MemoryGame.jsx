import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { shuffleArray } from '../../data/words';
import { AVAILABLE_COURSES } from '../../data/index';
import { useProgress } from '../../hooks/useProgress';
import useCourseData from '../../hooks/useCourseData';
import useUserLevel from '../../hooks/useUserLevel';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import { getAllMemoryDifficulties, getMemoryDifficulty } from '../../utils/memoryDifficulty';
import { selectMemoryWords } from '../../utils/memorySelection';
import { buildMemoryWordResults } from '../../utils/memoryPerformance';
import { createMemoryGameResult } from '../../utils/memoryScoring';
import { getMemorySkillRating, isBetterMemoryResult, updateMemorySkill } from '../../utils/memorySkill';
import './MemoryGame.css';

const MemoryGame = () => {
  const { words } = useCourseData();
  const { userLevel } = useUserLevel();
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const previewTimerRef = useRef(null);
  const wordMetricsRef = useRef({});
  const gameWordsRef = useRef([]);
  const gameStartedAtRef = useRef(0);
  const startingSkillRef = useRef(null);
  const startingMultiplierRef = useRef(1);
  const completionHandledRef = useRef(false);
  const { progress, rememberMemoryWords, completeMemoryGame } = useProgress();
  const { playFlip, playMatch, playCorrect } = useSound();
  const { speakNormal } = useSpeech();
  // Bandeira/nome do idioma-alvo do curso ativo, não fixo em inglês — senão
  // quem estuda espanhol via uma carta com 🇺🇸 e o texto "palavra em inglês".
  const course = AVAILABLE_COURSES.find(c => c.id === (progress.activeCourse || 'en-pt'));
  const targetFlag = course?.flag || '🇺🇸';
  const targetName = (course?.targetName || 'Inglês').toLowerCase();
  const memoryRating = getMemorySkillRating(progress.memoryGameSkill, userLevel);
  const currentEfficiency = attempts > 0
    ? Math.round(((matched.length / 2) / attempts) * 100)
    : 100;

  const startGame = useCallback((mode) => {
    const diff = getMemoryDifficulty(mode.id, progress.memoryGameSkill, userLevel);
    const selection = selectMemoryWords({
      words,
      targetDifficulty: diff.targetDifficulty,
      count: diff.pairs,
      memoryStats: progress.memoryStats,
      recentWordKeys: progress.recentMemoryWordKeys,
      reviewQueue: progress.memoryReviewQueue,
      completedGames: progress.gamesCompleted?.memory || 0,
    });
    const gameWords = selection.words;
    gameWordsRef.current = gameWords;
    startingSkillRef.current = progress.memoryGameSkill;
    startingMultiplierRef.current = (progress.multiplierGames || 0) > 0
      ? Math.max(1, Number(progress.pointsMultiplier) || 1)
      : 1;
    gameStartedAtRef.current = Date.now() + diff.previewMs;
    completionHandledRef.current = false;
    wordMetricsRef.current = Object.fromEntries(gameWords.map((_, index) => [index, {
      reveals: 0,
      associationMisses: 0,
    }]));
    rememberMemoryWords(gameWords);
    setDifficulty({ ...diff, boardDifficulty: selection.averageDifficulty });

    const cardPairs = gameWords.flatMap((word, idx) => [
      { id: idx * 2, wordIndex: idx, type: 'en', text: word.en, word },
      { id: idx * 2 + 1, wordIndex: idx, type: 'pt', text: word.pt, word },
    ]);
    
    setCards(shuffleArray(cardPairs));
    setFlipped([]);
    setMatched([]);
    setAttempts(0);
    setGameComplete(false);
    setCurrentMatch(null);
    setShowExplanation(false);
    setFinalResult(null);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPreviewing(diff.previewMs > 0);
    if (diff.previewMs > 0) {
      previewTimerRef.current = setTimeout(() => setPreviewing(false), diff.previewMs);
    }
  }, [words, userLevel, progress.memoryGameSkill, progress.memoryStats, progress.recentMemoryWordKeys, progress.memoryReviewQueue, progress.gamesCompleted?.memory, progress.multiplierGames, progress.pointsMultiplier, rememberMemoryWords]);

  useEffect(() => () => clearTimeout(previewTimerRef.current), []);

  const handleCardClick = useCallback((cardId) => {
    if (flipped.length === 2) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(cardId)) return;
    if (showExplanation) return;
    if (previewing) return;

    playFlip();
    // Fala a palavra ao virar a carta em inglês — a voz é sempre en-US (ver
    // useSpeech.js), então só faz sentido para o lado 'en' do par.
    const clicked = cards.find(c => c.id === cardId);
    if (clicked) {
      const metrics = wordMetricsRef.current[clicked.wordIndex];
      if (metrics) metrics.reveals += 1;
    }
    if (clicked?.type === 'en') speakNormal(clicked.text);
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(prev => prev + 1);
      const card1 = cards.find(c => c.id === newFlipped[0]);
      const card2 = cards.find(c => c.id === newFlipped[1]);

      if (card1.wordIndex === card2.wordIndex) {
        // Match found! Não fala a palavra aqui: o par sempre tem um lado
        // 'en', e virar essa carta (linha acima) já falou a mesma palavra
        // há poucos milissegundos — falar de novo aqui só dobrava o áudio.
        playMatch();
        setCurrentMatch(card1.word);
        setShowExplanation(true);
        
        setTimeout(() => {
          setMatched(prev => [...prev, newFlipped[0], newFlipped[1]]);
          setFlipped([]);
        }, 300);
      } else {
        // No match
        if (wordMetricsRef.current[card1.wordIndex]) wordMetricsRef.current[card1.wordIndex].associationMisses += 1;
        if (wordMetricsRef.current[card2.wordIndex]) wordMetricsRef.current[card2.wordIndex].associationMisses += 1;
        setTimeout(() => {
          setFlipped([]);
        }, difficulty.mismatchMs);
      }
    }
  }, [flipped, matched, cards, showExplanation, previewing, difficulty, playFlip, playMatch, speakNormal]);

  const dismissExplanation = useCallback(() => {
    setShowExplanation(false);
    setCurrentMatch(null);
  }, []);

  // Check if game is complete.
  // Espera a explicação do último par ser fechada: senão a tela de parabéns
  // engole o modal e o usuário nunca lê a palavra que acabou de descobrir.
  useEffect(() => {
    if (difficulty && !showExplanation && matched.length === cards.length && cards.length > 0 && !completionHandledRef.current) {
      completionHandledRef.current = true;
      const wordResults = buildMemoryWordResults(gameWordsRef.current, wordMetricsRef.current);
      const result = createMemoryGameResult({
        mode: difficulty.id,
        pairs: difficulty.pairs,
        attempts,
        difficulty: difficulty.boardDifficulty || difficulty.targetDifficulty,
        durationMs: Math.max(0, Date.now() - gameStartedAtRef.current),
      });
      result.fallbackRating = difficulty.memoryRating;
      const projectedSkill = updateMemorySkill(startingSkillRef.current, result);
      const previousRating = startingSkillRef.current?.attempts > 0
        ? startingSkillRef.current.rating
        : difficulty.memoryRating;
      setFinalResult({
        ...result,
        skillBefore: previousRating,
        skillAfter: projectedSkill.rating,
        skillDelta: projectedSkill.rating - previousRating,
        reviewWords: wordResults.filter(item => item.needsReview).length,
        awardedPoints: result.points * startingMultiplierRef.current,
        isPersonalBest: isBetterMemoryResult(
          projectedSkill.bestByMode?.[difficulty.id],
          startingSkillRef.current?.bestByMode?.[difficulty.id],
        ),
        personalBest: projectedSkill.bestByMode?.[difficulty.id],
      });
      setGameComplete(true);
      playCorrect();
      completeMemoryGame(wordResults, result);
    }
  }, [matched.length, cards.length, difficulty, showExplanation, attempts, playCorrect, completeMemoryGame]);

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="page">
        <div className="container game-container">
          <div className="text-center animate-fade-in-up">
            <Link to="/games" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>
              ← Voltar
            </Link>
            <h1 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
              <img src="/memory-icon.webp" alt="" style={{ width: '1.4em', height: '1.4em', borderRadius: 'var(--radius-sm)' }} />
              Jogo da Memória
            </h1>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-2xl)' }}>
              Encontre os pares: palavra em {targetName} + tradução em português
            </p>
            <div className="memory-level-summary">
              <span>🧠 Sua Memória</span>
              <strong>Nível {memoryRating}</strong>
              <small>A dificuldade se adapta ao seu desempenho</small>
            </div>
            
            <div className="difficulty-grid">
              {getAllMemoryDifficulties(progress.memoryGameSkill, userLevel).map((diff) => (
                <button
                  key={diff.id}
                  className="glass-card difficulty-card"
                  onClick={() => startGame(diff)}
                >
                  <span className="diff-label">{diff.label}</span>
                  <span className="diff-info">{diff.pairs * 2} cartas</span>
                  <span className="diff-info">{diff.pairs} pares</span>
                  <span className="memory-target-level">Partida nível {diff.targetDifficulty}</span>
                  <span className="diff-description">{diff.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <p className="text-secondary">Você encontrou todos os {difficulty.pairs} pares!</p>
            {finalResult && (
              <div className="memory-medal">
                <span>{finalResult.medal.icon}</span>
                <strong>{finalResult.medal.label}</strong>
                <small>+{finalResult.awardedPoints} moedas</small>
              </div>
            )}
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{attempts}</span>
                <span className="result-stat-label">Tentativas</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{difficulty.pairs}</span>
                <span className="result-stat-label">Pares encontrados</span>
              </div>
              {finalResult && (
                <>
                  <div className="result-stat">
                    <span className="result-stat-value">{finalResult.idealAttempts}</span>
                    <span className="result-stat-label">Tentativas ideais</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-stat-value">{finalResult.efficiency}%</span>
                    <span className="result-stat-label">Eficiência</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-stat-value">
                      {finalResult.skillDelta >= 0 ? '+' : ''}{finalResult.skillDelta}
                    </span>
                    <span className="result-stat-label">Evolução da Memória</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-stat-value">{finalResult.skillAfter}</span>
                    <span className="result-stat-label">Nível de Memória</span>
                  </div>
                  <div className="result-stat">
                    <span className="result-stat-value">{finalResult.reviewWords}</span>
                    <span className="result-stat-label">Palavras para revisar</span>
                  </div>
                </>
              )}
            </div>
            {finalResult?.isPersonalBest && (
              <p className="memory-personal-best">🏆 Novo recorde pessoal no modo {difficulty.label}!</p>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => startGame(difficulty)}>
                🔄 Jogar novamente
              </button>
              <button className="btn btn-secondary" onClick={() => setDifficulty(null)}>
                Mudar dificuldade
              </button>
              <Link to="/games" className="btn btn-ghost">
                ← Outros jogos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container game-container">
        {/* Header */}
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/memory-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Jogo da Memória</h2>
            <span className="badge badge-purple">{difficulty.label}</span>
            <span className="badge memory-rating-badge">🧠 {difficulty.memoryRating}</span>
            <span className="badge memory-board-badge">🎚️ {difficulty.boardDifficulty || difficulty.targetDifficulty}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item">
              <span>🎯</span>
              <span className="value">{matched.length / 2}/{difficulty.pairs}</span>
            </div>
            <div className="game-score-item">
              <span>🔄</span>
              <span className="value">{attempts}</span>
            </div>
            <div className="game-score-item" title="Eficiência atual">
              <span>⚡</span>
              <span className="value">{Math.max(0, Math.min(100, currentEfficiency))}%</span>
            </div>
          </div>
        </div>

        {previewing && (
          <div className="memory-preview-notice" role="status" aria-live="polite">
            👀 Memorize a posição das cartas…
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="progress-bar-fill" style={{ width: `${(matched.length / cards.length) * 100}%` }}></div>
        </div>

        {/* Cards Grid */}
        <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)` }}>
          {cards.map((card) => {
            const isFlipped = previewing || flipped.includes(card.id);
            const isMatched = matched.includes(card.id);
            
            return (
              <button
                key={card.id}
                className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
                disabled={isMatched || previewing}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-front">
                    <span>?</span>
                  </div>
                  <div className="memory-card-back">
                    <span className={`card-text ${card.type === 'en' ? 'en' : 'pt'}`}>
                      {card.text}
                    </span>
                    <span className="card-lang">{card.type === 'en' ? targetFlag : '🇧🇷'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Word Explanation Modal */}
        {showExplanation && currentMatch && (
          <div className="modal-overlay" onClick={dismissExplanation}>
            <div className="modal-content animate-bounce-in" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-md)', color: 'var(--accent-green)' }}>
                ✅ Par encontrado!
              </h3>
              <WordExplanation word={currentMatch} showTip={false} />
              <button
                className="btn btn-primary"
                onClick={dismissExplanation}
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
