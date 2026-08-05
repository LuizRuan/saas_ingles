import { useEffect } from 'react';
import useSpeech from '../../hooks/useSpeech';
import useCourse from '../../hooks/useCourse';
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

  const { targetText, sourceText, tip, exampleTarget, exampleSource } = useCourse(word);

  return (
    <div className={`word-explanation ${compact ? 'compact' : ''}`}>
      <div className="word-main">
        <span className="word-en">{targetText}</span>
        <span className="word-pt">= {sourceText}</span>
        {isAvailable && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => speakNormal(targetText)}
              aria-label={`Ouvir pronúncia de ${targetText}`}
              title="Ouvir pronúncia">
              🔊
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => speakSlow(targetText)}
              aria-label={`Ouvir ${targetText} devagar`}
              title="Ouvir devagar">
              🐢
            </button>
          </div>
        )}
      </div>

      {word.pronunciation && (
        <div className="pronunciation">🗣️ Pronúncia: "{word.pronunciation}"</div>
      )}

      {exampleTarget && (
        <div className="example">
          <div className="en">📝 "{exampleTarget}"</div>
          <div className="pt">"{exampleSource}"</div>
        </div>
      )}

      {showTip && tip && (
        <div className="tip">💡 Dica: {tip}</div>
      )}
    </div>
  );
};

export default WordExplanation;
