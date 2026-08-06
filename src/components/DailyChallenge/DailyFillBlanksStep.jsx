import { useState } from 'react';
import useSound from '../../hooks/useSound';

const DailyFillBlanksStep = ({ challenge, stepState, onAnswer }) => {
  const { fillObj, options, answer } = challenge;
  const { playCorrect, playWrong } = useSound();
  const [selected, setSelected] = useState(null);

  const handleOptionClick = (opt) => {
    if (stepState !== 'playing') return;
    setSelected(opt);
    const isCorrect = opt === fillObj.answer;
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    onAnswer({ en: opt }, answer, isCorrect);
  };

  // Substitui '___' pela palavra selecionada ou pelo campo em branco com destaque
  const renderSentence = () => {
    const parts = (fillObj?.sentence || '').split('___');
    return (
      <span>
        {parts[0]}
        <span style={{
          padding: '2px 10px',
          margin: '0 4px',
          borderBottom: '3px solid var(--accent-purple)',
          color: 'var(--accent-purple-light)',
          fontWeight: 700
        }}>
          {selected || '______'}
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <div className="daily-fill-blanks-step animate-fade-in-up text-center">
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'block' }}>
          Escolha a palavra que completa a frase:
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: 'var(--space-md) 0' }}>
          {renderSentence()}
        </h2>
      </div>

      <div className="daily-options">
        {(options || fillObj.options || []).map((opt) => {
          let cls = 'glass-card daily-option';
          if (stepState === 'feedback') {
            if (opt === fillObj.answer) cls += ' correct';
            else if (opt === selected) cls += ' wrong';
          }
          return (
            <button
              key={opt}
              className={cls}
              onClick={() => handleOptionClick(opt)}
              disabled={stepState !== 'playing'}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyFillBlanksStep;
