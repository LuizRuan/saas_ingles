import { useState, useCallback } from 'react';
import useSound from '../../hooks/useSound';
import { useProgress } from '../../hooks/useProgress';
import { AVAILABLE_COURSES } from '../../data/index';

// Nome do idioma-alvo do curso ativo. Fixar "inglês" no texto fazia o
// desafio diário mandar "traduza para o inglês" para quem está estudando
// espanhol — a instrução contradizia a resposta esperada.
const nomeDoIdioma = (courseId) =>
  AVAILABLE_COURSES.find(c => c.id === courseId)?.targetName || 'Inglês';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG = 6;

// SVG Desenho da Forca
const HangmanDrawing = ({ wrongCount }) => (
  <svg viewBox="0 0 200 250" className="hangman-svg" style={{ width: '150px', height: '180px', margin: '0 auto', display: 'block' }}>
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

const DailyHangmanStep = ({ challenge, stepState, onAnswer }) => {
  const { progress } = useProgress();
  const idioma = nomeDoIdioma(progress?.activeCourse || 'en-pt');
  const { answer } = challenge;
  const wordUpper = (answer?.en || '').toUpperCase();
  const { playClick, playCorrect, playWrong } = useSound();

  const [guessed, setGuessed] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);

  const handleLetterClick = useCallback((letter) => {
    if (stepState !== 'playing' || guessed.includes(letter)) return;
    playClick();

    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);

    if (!wordUpper.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) {
        playWrong();
        onAnswer({ en: 'errou' }, answer, false);
      }
    } else {
      const isComplete = wordUpper.split('').every(l => !/[A-Z]/.test(l) || newGuessed.includes(l));
      if (isComplete) {
        playCorrect();
        onAnswer(answer, answer, true);
      }
    }
  }, [guessed, wrongCount, wordUpper, stepState, playClick, playCorrect, playWrong, onAnswer, answer]);

  return (
    <div className="daily-hangman-step animate-fade-in-up text-center">
      <div className="hangman-hint glass-card animate-fade-in-up" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', textAlign: 'left' }}>
        <span>💡 </span>
        <span>Dica: {answer.tip || `Adivinhe a palavra em ${idioma.toLowerCase()}`}</span>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
        <div className="hangman-drawing">
          <HangmanDrawing wrongCount={wrongCount} />
        </div>

        {/* Word Letters */}
        <div className="hangman-word animate-fade-in-up" style={{ margin: 'var(--space-lg) 0 var(--space-md) 0' }}>
          {wordUpper.split('').map((char, idx) => {
            const isLetter = /[A-Z]/.test(char);
            const isRevealed = !isLetter || guessed.includes(char) || stepState === 'feedback';
            return (
              <span key={idx} className={`hangman-letter ${isRevealed ? 'revealed' : ''}`}>
                {isRevealed ? char : '_'}
              </span>
            );
          })}
        </div>

        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
          Erros: {wrongCount} / {MAX_WRONG}
        </div>
      </div>

      {/* Keyboard */}
      <div className="hangman-keyboard animate-fade-in-up">
        {ALPHABET.map((letter) => {
          const isGuessed = guessed.includes(letter);
          const isCorrect = isGuessed && wordUpper.includes(letter);
          const isWrong = isGuessed && !wordUpper.includes(letter);

          return (
            <button
              key={letter}
              className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              onClick={() => handleLetterClick(letter)}
              disabled={isGuessed || stepState !== 'playing'}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyHangmanStep;
