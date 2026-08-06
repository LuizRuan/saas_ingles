import { useState, useEffect } from 'react';
import useSpeech from '../../hooks/useSpeech';
import useSound from '../../hooks/useSound';

const DailyListeningStep = ({ challenge, stepState, onAnswer }) => {
  const { answer, options } = challenge;
  const { speakNormal, speakSlow, isAvailable } = useSpeech();
  const { playCorrect, playWrong } = useSound();
  const [selected, setSelected] = useState(null);

  // Pronúncia automática ao carregar a etapa
  useEffect(() => {
    if (answer?.en && isAvailable) {
      const timer = setTimeout(() => speakNormal(answer.en), 300);
      return () => clearTimeout(timer);
    }
  }, [answer?.en, isAvailable, speakNormal]);

  const handleOptionClick = (opt) => {
    if (stepState !== 'playing') return;
    setSelected(opt);
    const isCorrect = opt.en === answer.en;
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    onAnswer(opt, answer, isCorrect);
  };

  return (
    <div className="daily-listening-step animate-fade-in-up text-center">
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: 'var(--space-sm)' }}>🎧</span>
        <p className="daily-prompt-label">Escute a palavra com atenção:</p>
        
        {/* A palavra permanece OCULTA como ??? até ser respondida */}
        <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-purple-light)', margin: 'var(--space-sm) 0' }}>
          {stepState === 'feedback' ? answer.en : '???'}
        </h2>

        {isAvailable && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={() => speakNormal(answer.en)}>
              🔊 Ouvir
            </button>
            <button className="btn btn-ghost" onClick={() => speakSlow(answer.en)}>
              🐢 Devagar
            </button>
          </div>
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
              {opt.pt} ({opt.en})
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyListeningStep;
