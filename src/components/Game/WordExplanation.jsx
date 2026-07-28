import { useEffect } from 'react';
import useSpeech from '../../hooks/useSpeech';
import { loadSettings } from '../../utils/storage';

const WordExplanation = ({ word, showTip = true, compact = false }) => {
  const { speakNormal, speakSlow, isAvailable } = useSpeech();

  // Pronúncia automática (Configurações > Pronúncia automática).
  // Este componente aparece no momento em que a palavra é ensinada, então é
  // aqui que o áudio deve disparar sozinho.
  useEffect(() => {
    if (!word?.en || !isAvailable) return;
    if (!loadSettings().autoPronounce) return;

    // Pequeno atraso: deixa a animação do modal começar antes da fala.
    const timer = setTimeout(() => speakNormal(word.en), 250);
    return () => clearTimeout(timer);
  }, [word?.en, isAvailable, speakNormal]);

  if (!word) return null;

  return (
    <div className={`word-explanation ${compact ? 'compact' : ''}`}>
      <div className="word-main">
        <span className="word-en">{word.en}</span>
        <span className="word-pt">= {word.pt}</span>
        {isAvailable && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => speakNormal(word.en)} title="Ouvir pronúncia">
              🔊
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => speakSlow(word.en)} title="Ouvir devagar">
              🐢
            </button>
          </div>
        )}
      </div>

      {word.pronunciation && (
        <div className="pronunciation">🗣️ Pronúncia: "{word.pronunciation}"</div>
      )}

      {word.example && (
        <div className="example">
          <div className="en">📝 "{word.example}"</div>
          <div className="pt">"{word.examplePt}"</div>
        </div>
      )}

      {showTip && word.tip && (
        <div className="tip">💡 Dica: {word.tip}</div>
      )}
    </div>
  );
};

export default WordExplanation;
