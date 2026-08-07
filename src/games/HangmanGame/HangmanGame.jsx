import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { words, shuffleArray } from '../../data/words';
import { categories } from '../../data/categories';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import WordExplanation from '../../components/Game/WordExplanation';
import './HangmanGame.css';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const hangmanCategories = categories.filter(c => 
  ['animais', 'comidas', 'cores', 'familia', 'casa', 'escola', 'corpo', 'roupas', 'bebidas'].includes(c.id)
);

const HangmanGame = () => {
  const [category, setCategory] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameState, setGameState] = useState('select'); // select, playing, won, lost
  const { progress, consumeHint, consumeTipTranslation, handleCorrectAnswer, handleWrongAnswer, completeGame, addExploredCategory } = useProgress();
  const { playCorrect, playWrong, playClick } = useSound();
  const [tipTranslated, setTipTranslated] = useState(false);

  const startGame = useCallback((cat) => {
    setCategory(cat);
    addExploredCategory(cat.id);
    const categoryWords = words.filter(w => w.category === cat.id && w.en.length >= 3 && !w.en.includes(' '));
    const word = shuffleArray(categoryWords)[0];
    setCurrentWord(word);
    setGuessedLetters([]);
    setWrongCount(0);
    setTipTranslated(false);
    setGameState('playing');
  }, [addExploredCategory]);

  const handleLetterGuess = useCallback((letter) => {
    if (guessedLetters.includes(letter) || gameState !== 'playing') return;
    
    playClick();
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);
    
    const wordUpper = currentWord.en.toUpperCase();
    
    if (!wordUpper.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      
      if (newWrong >= MAX_WRONG) {
        setGameState('lost');
        handleWrongAnswer(currentWord.en);
        playWrong();
      }
    } else {
      // Check if word is complete (exempting non-alphabet characters like spaces/hyphens)
      const allRevealed = wordUpper.split('').every(l => !/[A-Z]/.test(l) || newGuessed.includes(l));
      if (allRevealed) {
        setGameState('won');
        handleCorrectAnswer(currentWord.en, wrongCount === 0 ? 1 : 2);
        completeGame('hangman');
        playCorrect();
      }
    }
  }, [guessedLetters, gameState, currentWord, wrongCount, playClick, playWrong, playCorrect, handleCorrectAnswer, handleWrongAnswer, completeGame]);

  const handleUseExtraHint = useCallback(() => {
    if (!currentWord || gameState !== 'playing') return;
    if ((progress.hintsAvailable || 0) <= 0) return;

    const unrevealed = currentWord.en.toUpperCase().split('').filter(l => /[A-Z]/.test(l) && !guessedLetters.includes(l));
    if (unrevealed.length === 0) return;

    const letterToReveal = unrevealed[0];
    if (consumeHint()) {
      handleLetterGuess(letterToReveal);
    }
  }, [currentWord, gameState, guessedLetters, progress.hintsAvailable, consumeHint, handleLetterGuess]);

  const renderWord = () => {
    if (!currentWord) return null;
    return currentWord.en.toUpperCase().split('').map((letter, i) => {
      const isLetter = /[A-Z]/.test(letter);
      const isRevealed = !isLetter || guessedLetters.includes(letter) || gameState === 'lost';
      return (
        <span key={i} className={`hangman-letter ${isRevealed ? 'revealed' : ''}`}>
          {isRevealed ? letter : '_'}
        </span>
      );
    });
  };

  const renderHangman = () => {
    return (
      <svg viewBox="0 0 200 250" className="hangman-svg">
        {/* Gallows */}
        <line x1="20" y1="230" x2="180" y2="230" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="60" y1="230" x2="60" y2="20" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="60" y1="20" x2="130" y2="20" stroke="var(--text-muted)" strokeWidth="3" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
        
        {/* Person parts */}
        {wrongCount >= 1 && <circle cx="130" cy="65" r="15" stroke="var(--accent-red)" strokeWidth="3" fill="none" className="animate-fade-in" />}
        {wrongCount >= 2 && <line x1="130" y1="80" x2="130" y2="150" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 3 && <line x1="130" y1="100" x2="100" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 4 && <line x1="130" y1="100" x2="160" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 5 && <line x1="130" y1="150" x2="105" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
        {wrongCount >= 6 && <line x1="130" y1="150" x2="155" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
      </svg>
    );
  };

  // Category selection
  if (gameState === 'select') {
    return (
      <div className="page">
        <div className="container game-container text-center animate-fade-in-up">
          <Link to="/games" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>← Voltar</Link>
          <h1 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
            <img src="/hangman-icon.webp" alt="" style={{ width: '1.4em', height: '1.4em', borderRadius: 'var(--radius-sm)' }} />
            Jogo da Forca
          </h1>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-2xl)' }}>
            Escolha uma categoria e tente adivinhar a palavra em inglês!
          </p>
          <div className="category-grid">
            {hangmanCategories.map(cat => (
              <button key={cat.id} className="glass-card category-card" onClick={() => startGame(cat)}
                style={{ borderColor: `${cat.color}30` }}>
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-desc">{cat.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Won/Lost screen
  if (gameState === 'won' || gameState === 'lost') {
    return (
      <div className="page">
        <div className="container game-container text-center">
          <div className="game-result-card glass-card animate-bounce-in">
            <span style={{ fontSize: '4rem' }}>{gameState === 'won' ? '🎉' : '💪'}</span>
            <h2>{gameState === 'won' ? 'Parabéns!' : 'Boa tentativa!'}</h2>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
              {gameState === 'won'
                ? `Você descobriu a palavra com ${wrongCount} erro${wrongCount !== 1 ? 's' : ''}!`
                : 'Errar faz parte do aprendizado. Vamos aprender essa palavra!'}
            </p>
            <WordExplanation word={currentWord} />
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => startGame(category)}>
                🔄 Jogar novamente
              </button>
              <button className="btn btn-secondary" onClick={() => setGameState('select')}>
                Mudar categoria
              </button>
              <Link to="/games" className="btn btn-ghost">← Outros jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/hangman-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Forca</h2>
            <span className="badge badge-blue">{category.icon} {category.name}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item">
              <span>❌</span>
              <span className="value">{wrongCount}/{MAX_WRONG}</span>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="hangman-hint glass-card animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <span>💡 </span>
            <span>Dica: {currentWord.tip}</span>
            {tipTranslated && (currentWord.examplePt || currentWord.pt) && (() => {
              // Se houver frase de exemplo, oculta a palavra-resposta. Senão, mostra a tradução direta.
              let frasePt = '';
              if (currentWord.examplePt) {
                const regex = new RegExp((currentWord.pt || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                frasePt = currentWord.examplePt.replace(regex, '___');
              } else {
                frasePt = `Significa "${currentWord.pt}"`;
              }
              return (
                <div style={{ marginTop: '4px', fontSize: 'var(--fs-xs)', color: 'var(--accent-purple)', fontWeight: 600 }}>
                  🌎 Tradução: <em>{frasePt}</em>
                </div>
              );
            })()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            {!tipTranslated && (progress.tipTranslationsAvailable || 0) > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { if (consumeTipTranslation()) setTipTranslated(true); }}>
                🌐 Traduzir Dica ({progress.tipTranslationsAvailable} disp.)
              </button>
            )}
            {(progress.hintsAvailable || 0) > 0 ? (
              <button className="btn btn-secondary btn-sm" onClick={handleUseExtraHint}>
                💡 Revelar Letra ({progress.hintsAvailable} disps)
              </button>
            ) : (
              <Link to="/shop" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--fs-xs)', textDecoration: 'none' }}>
                🛒 Comprar Dicas na Loja
              </Link>
            )}
          </div>
        </div>

        {/* Hangman Drawing */}
        <div className="hangman-drawing">
          {renderHangman()}
        </div>

        {/* Word */}
        <div className="hangman-word animate-fade-in-up">
          {renderWord()}
        </div>

        {/* Keyboard */}
        <div className="hangman-keyboard animate-fade-in-up">
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && currentWord.en.toUpperCase().includes(letter);
            const isWrong = isGuessed && !currentWord.en.toUpperCase().includes(letter);
            
            return (
              <button
                key={letter}
                className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                onClick={() => handleLetterGuess(letter)}
                disabled={isGuessed}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HangmanGame;
