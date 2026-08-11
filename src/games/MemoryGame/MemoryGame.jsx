import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useCourseData from '../../hooks/useCourseData';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import './MemoryGame.css';

const DIFFICULTIES = [
  { label: 'Fácil', pairs: 3, cols: 3 },
  { label: 'Médio', pairs: 6, cols: 4 },
  { label: 'Difícil', pairs: 10, cols: 5 },
];

const MemoryGame = () => {
  const { words } = useCourseData();
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { handleCorrectAnswer, completeGame } = useProgress();
  const { playFlip, playMatch, playCorrect } = useSound();
  const { speakNormal } = useSpeech();

  const startGame = useCallback((diff) => {
    setDifficulty(diff);
    const gameWords = shuffleArray([...words]).slice(0, diff.pairs);
    
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
  }, []);

  const handleCardClick = useCallback((cardId) => {
    if (flipped.length === 2) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(cardId)) return;
    if (showExplanation) return;

    playFlip();
    // Fala a palavra ao virar a carta em inglês — a voz é sempre en-US (ver
    // useSpeech.js), então só faz sentido para o lado 'en' do par.
    const clicked = cards.find(c => c.id === cardId);
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
          handleCorrectAnswer(card1.word.en, 1);
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  }, [flipped, matched, cards, showExplanation, playFlip, playMatch, speakNormal, handleCorrectAnswer]);

  const dismissExplanation = useCallback(() => {
    setShowExplanation(false);
    setCurrentMatch(null);
  }, []);

  // Check if game is complete.
  // Espera a explicação do último par ser fechada: senão a tela de parabéns
  // engole o modal e o usuário nunca lê a palavra que acabou de descobrir.
  useEffect(() => {
    if (difficulty && !showExplanation && matched.length === cards.length && cards.length > 0) {
      setGameComplete(true);
      playCorrect();
      completeGame('memory');
    }
  }, [matched.length, cards.length, difficulty, showExplanation, playCorrect, completeGame]);

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
              Encontre os pares: palavra em inglês + tradução em português
            </p>
            
            <div className="difficulty-grid">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.label}
                  className="glass-card difficulty-card"
                  onClick={() => startGame(diff)}
                >
                  <span className="diff-label">{diff.label}</span>
                  <span className="diff-info">{diff.pairs * 2} cartas</span>
                  <span className="diff-info">{diff.pairs} pares</span>
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
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{attempts}</span>
                <span className="result-stat-label">Tentativas</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{difficulty.pairs}</span>
                <span className="result-stat-label">Pares encontrados</span>
              </div>
            </div>
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
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="progress-bar-fill" style={{ width: `${(matched.length / cards.length) * 100}%` }}></div>
        </div>

        {/* Cards Grid */}
        <div className="memory-grid" style={{ gridTemplateColumns: `repeat(${difficulty.cols}, 1fr)` }}>
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.id);
            
            return (
              <button
                key={card.id}
                className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
                disabled={isMatched}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-front">
                    <span>?</span>
                  </div>
                  <div className="memory-card-back">
                    <span className={`card-text ${card.type === 'en' ? 'en' : 'pt'}`}>
                      {card.text}
                    </span>
                    <span className="card-lang">{card.type === 'en' ? '🇺🇸' : '🇧🇷'}</span>
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
