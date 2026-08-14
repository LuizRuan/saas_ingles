import { useEffect } from 'react';
import useSpeech from '../../hooks/useSpeech';
import useCourse from '../../hooks/useCourse';
import { loadSettings } from '../../utils/storage';

const WordExplanation = ({ word, showTip = true, compact = false, exampleCount = 1 }) => {
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
  const examples = exampleTarget
    ? [
        { target: exampleTarget, source: exampleSource },
        ...(exampleCount > 1
          ? [{
              target: `I can use "${targetText}" in a sentence.`,
              source: `Eu posso usar "${sourceText}" em uma frase.`,
            }]
          : []),
      ]
    : [];

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
              aria-label={`Ouvir pronúncia de ${targetText}`}>
              🔊
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => speakSlow(targetText)}
              aria-label={`Ouvir ${targetText} devagar`}>
              🐢
            </button>
          </div>
        )}
      </div>

      {word.pronunciation && (
        <div className="pronunciation">🗣️ Pronúncia: "{word.pronunciation}"</div>
      )}

      {examples.length > 0 && (
        <div className={`word-examples ${examples.length > 1 ? 'two-columns' : ''}`}>
          {examples.map((example, index) => (
            <div className="example" key={`${example.target}-${index}`}>
              <div className="en example-en-row">
                <span>📝 "{example.target}"</span>
                {isAvailable && (
                  <button
                    className="btn btn-sm btn-secondary example-speak-btn"
                    onClick={() => speakNormal(example.target)}
                    aria-label={`Ouvir frase de exemplo: ${example.target}`}>
                    🔊
                  </button>
                )}
              </div>
              <div className="pt">"{example.source}"</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default WordExplanation;
