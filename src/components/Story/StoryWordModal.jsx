import useSpeech from '../../hooks/useSpeech';
import { storyVocabulary } from '../../data/storyVocabulary';

// Reaproveita o esqueleto de modal já usado em MemoryGame/WhoKnowsMore e as
// classes globais que WordExplanation já define (.word-main/.word-en/
// .word-pt/.example) em vez de criar CSS novo só pra isso.
const StoryWordModal = ({ wordKey, onClose }) => {
  const { speakNormal, speakSlow, isAvailable } = useSpeech();
  const entry = storyVocabulary[wordKey];

  if (!wordKey) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        <div className="word-main">
          <span className="word-en">{wordKey}</span>
          {entry && <span className="word-pt">= {entry.pt}</span>}
          {isAvailable && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-sm btn-secondary" onClick={() => speakNormal(wordKey)} title="Ouvir pronúncia">
                🔊
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => speakSlow(wordKey)} title="Ouvir devagar">
                🐢
              </button>
            </div>
          )}
        </div>

        {(entry?.examples ?? []).map((ex, i) => (
          <div className="example" key={i}>
            <div className="en">
              📝 "{ex.en}"
              {isAvailable && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => speakNormal(ex.en)}
                  title="Ouvir este exemplo"
                  style={{ marginLeft: '6px' }}
                >
                  🔊
                </button>
              )}
            </div>
            <div className="pt">"{ex.pt}"</div>
          </div>
        ))}

        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default StoryWordModal;
