import { useState, useEffect, useCallback } from 'react';
import useSound from '../../hooks/useSound';

const STEP_TIME_SECONDS = 10;

const DailyTrueFalseStep = ({ challenge, stepState, onAnswer }) => {
  const { answer, displayPt, isTrue } = challenge;
  const { playCorrect, playWrong } = useSound();

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(STEP_TIME_SECONDS);

  const handleChoice = useCallback((userChoice) => {
    if (stepState !== 'playing') return;
    setSelectedChoice(userChoice);

    const isCorrect = userChoice === isTrue;
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    onAnswer({ en: userChoice ? 'Verdadeiro' : 'Falso' }, answer, isCorrect);
  }, [isTrue, stepState, playCorrect, playWrong, onAnswer, answer]);

  // Cronômetro regressivo
  useEffect(() => {
    if (stepState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Tempo esgotado -> errou!
          handleChoice(!isTrue);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stepState, isTrue, handleChoice]);

  return (
    <div className="daily-true-false-step animate-fade-in-up text-center">
      {/* Barra de tempo */}
      <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)', height: '6px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${(timeLeft / STEP_TIME_SECONDS) * 100}%`,
            background: timeLeft <= 3 ? 'var(--accent-red)' : 'var(--accent-primary)',
            transition: 'width 1s linear'
          }}></div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-2xl)', marginBottom: 'var(--space-xl)' }}>
        <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'block' }}>
          A tradução abaixo está correta?
        </span>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-purple-light)', margin: 'var(--space-sm) 0' }}>
          {answer.en} = {displayPt}
        </h2>
      </div>

      {/* Botões grandes V / F */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', maxWidth: '400px', margin: '0 auto' }}>
        <button
          onClick={() => handleChoice(true)}
          disabled={stepState !== 'playing'}
          style={{
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--fs-lg)',
            fontWeight: 700,
            cursor: stepState === 'playing' ? 'pointer' : 'default',
            border: stepState === 'feedback' && isTrue ? '3px solid var(--accent-green)' : '1px solid var(--border-color)',
            background: selectedChoice === true ? (isTrue ? 'var(--bg-green-subtle)' : 'var(--bg-red-subtle)') : 'var(--bg-card)',
            color: selectedChoice === true ? (isTrue ? 'var(--accent-green-dark)' : 'var(--accent-red-light)') : 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
          ✅ Verdadeiro
        </button>

        <button
          onClick={() => handleChoice(false)}
          disabled={stepState !== 'playing'}
          style={{
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--fs-lg)',
            fontWeight: 700,
            cursor: stepState === 'playing' ? 'pointer' : 'default',
            border: stepState === 'feedback' && !isTrue ? '3px solid var(--accent-green)' : '1px solid var(--border-color)',
            background: selectedChoice === false ? (!isTrue ? 'var(--bg-green-subtle)' : 'var(--bg-red-subtle)') : 'var(--bg-card)',
            color: selectedChoice === false ? (!isTrue ? 'var(--accent-green-dark)' : 'var(--accent-red-light)') : 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}>
          ❌ Falso
        </button>
      </div>
    </div>
  );
};

export default DailyTrueFalseStep;
