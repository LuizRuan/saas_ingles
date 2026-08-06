import { useState, useCallback } from 'react';
import useSound from '../../hooks/useSound';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG = 6;

// SVG Desenho da Forca
const HangmanDrawing = ({ wrongCount }) => (
  <svg viewBox="0 0 100 120" style={{ width: '130px', height: '150px', margin: '0 auto', display: 'block' }}>
    {/* Base da forca */}
    <line x1="10" y1="110" x2="90" y2="110" stroke="var(--text-secondary)" strokeWidth="4" strokeLinecap="round" />
    <line x1="30" y1="110" x2="30" y2="10" stroke="var(--text-secondary)" strokeWidth="4" strokeLinecap="round" />
    <line x1="30" y1="10" x2="70" y2="10" stroke="var(--text-secondary)" strokeWidth="4" strokeLinecap="round" />
    <line x1="70" y1="10" x2="70" y2="25" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" />

    {/* Partes do boneco */}
    {wrongCount >= 1 && <circle cx="70" cy="35" r="10" stroke="var(--accent-red)" strokeWidth="3" fill="none" />}
    {wrongCount >= 2 && <line x1="70" y1="45" x2="70" y2="75" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" />}
    {wrongCount >= 3 && <line x1="70" y1="55" x2="55" y2="65" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" />}
    {wrongCount >= 4 && <line x1="70" y1="55" x2="85" y2="65" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" />}
    {wrongCount >= 5 && <line x1="70" y1="75" x2="55" y2="95" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" />}
    {wrongCount >= 6 && <line x1="70" y1="75" x2="85" y2="95" stroke="var(--accent-red)" strokeWidth="3" strokeLinecap="round" />}
  </svg>
);

const DailyHangmanStep = ({ challenge, stepState, onAnswer }) => {
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
      const isComplete = wordUpper.split('').every(l => newGuessed.includes(l));
      if (isComplete) {
        playCorrect();
        onAnswer(answer, answer, true);
      }
    }
  }, [guessed, wrongCount, wordUpper, stepState, playClick, playCorrect, playWrong, onAnswer, answer]);

  return (
    <div className="daily-hangman-step animate-fade-in-up text-center">
      <div className="glass-card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <p className="daily-prompt-label">Dica: {answer.pt} ({answer.tip || 'Adivinhe a palavra em inglês'})</p>
        <HangmanDrawing wrongCount={wrongCount} />

        {/* Tracinhos da palavra secreta */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: 'var(--space-md) 0' }}>
          {wordUpper.split('').map((char, idx) => {
            const isRevealed = guessed.includes(char) || stepState === 'feedback';
            return (
              <span
                key={idx}
                style={{
                  minWidth: '28px',
                  fontSize: '1.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  borderBottom: '3px solid var(--accent-purple)',
                  color: isRevealed ? 'var(--accent-purple-light)' : 'transparent',
                  paddingBottom: '2px'
                }}>
                {char}
              </span>
            );
          })}
        </div>

        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
          Erros: {wrongCount} / {MAX_WRONG}
        </div>
      </div>

      {/* Teclado Virtual A-Z */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '5px',
        maxWidth: '480px',
        margin: '0 auto'
      }}>
        {ALPHABET.map((letter) => {
          const isUsed = guessed.includes(letter);
          const isRight = isUsed && wordUpper.includes(letter);
          const isWrong = isUsed && !wordUpper.includes(letter);

          let btnBg = 'var(--bg-card)';
          let btnColor = 'var(--text-primary)';
          if (isRight) { btnBg = 'var(--accent-green)'; btnColor = 'white'; }
          else if (isWrong) { btnBg = 'var(--bg-red-subtle)'; btnColor = 'var(--accent-red-light)'; }

          return (
            <button
              key={letter}
              onClick={() => handleLetterClick(letter)}
              disabled={isUsed || stepState !== 'playing'}
              style={{
                width: '36px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '14px',
                background: btnBg,
                color: btnColor,
                border: '1px solid var(--border-color)',
                cursor: isUsed || stepState !== 'playing' ? 'default' : 'pointer',
                opacity: isWrong ? 0.5 : 1,
                transition: 'all 0.15s ease'
              }}>
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyHangmanStep;
