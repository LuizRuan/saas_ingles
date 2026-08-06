import { useState } from 'react';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';

const DailyTranslationStep = ({ challenge, stepState, onAnswer }) => {
  const { answer, options } = challenge;
  const { playCorrect, playWrong } = useSound();
  const { speakNormal, isAvailable } = useSpeech();
  const [selected, setSelected] = useState(null);

  const handleOptionClick = (opt) => {
    if (stepState !== 'playing') return;
    setSelected(opt);
    if (isAvailable && opt.en) speakNormal(opt.en);

    const isCorrect = opt.en === answer.en;
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    onAnswer(opt, answer, isCorrect);
  };

  return (
    <div className="daily-translation-step animate-fade-in-up text-center">
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'block' }}>
          Qual é a tradução em português de:
        </span>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-purple-light)', margin: 'var(--space-xs) 0' }}>
          {answer.en}
        </h2>
        {isAvailable && (
          <button className="btn btn-sm btn-ghost" onClick={() => speakNormal(answer.en)} style={{ marginTop: 'var(--space-xs)' }}>
            🔊 Ouvir
          </button>
        )}
      </div>

      <div className="daily-options">
        {options.map((opt) => {
          let cls = 'glass-card daily-option';
          if (stepState === 'feedback') {
            if (opt.en === answer.en) cls += ' correct';
            else if (opt === selected) cls += ' wrong';
          }
          return (
            <button
              key={opt.en}
              className={cls}
              onClick={() => handleOptionClick(opt)}
              disabled={stepState !== 'playing'}>
              {opt.pt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTranslationStep;
