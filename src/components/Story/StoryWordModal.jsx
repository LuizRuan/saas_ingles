import useSpeech from '../../hooks/useSpeech';
import { storyVocabulary } from '../../data/storyVocabulary';

// Reaproveita o esqueleto de modal já usado em MemoryGame/WhoKnowsMore e as
// classes globais que WordExplanation já define (.word-main/.word-en/
// .word-pt/.example) em vez de criar CSS novo só pra isso. O destaque de
// cada expressão (phrase/phrasePt + trecho em negrito na frase) é o que
// muda em relação ao layout antigo — ver .story-phrase-* em Stories.css.
const highlightPhrase = (sentence, phrase) => {
  const idx = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return sentence;
  const before = sentence.slice(0, idx);
  const match = sentence.slice(idx, idx + phrase.length);
  const after = sentence.slice(idx + phrase.length);
  return (
    <>
      {before}
      <mark className="story-highlight">{match}</mark>
      {after}
    </>
  );
};

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
              <button className="btn btn-sm btn-secondary" onClick={() => speakNormal(wordKey)} aria-label="Ouvir pronúncia">
                🔊
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => speakSlow(wordKey)} aria-label="Ouvir devagar">
                🐢
              </button>
            </div>
          )}
        </div>

        {(entry?.examples ?? []).map((ex, i) => (
          <div className="example story-example" key={i}>
            <div className="story-phrase-row">
              <span className="story-phrase-badge">{ex.phrase}</span>
              <span className="story-phrase-pt">{ex.phrasePt}</span>
            </div>
            <div className="en">
              📝 "{highlightPhrase(ex.en, ex.phrase)}"
              {isAvailable && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => speakNormal(ex.en)}
                  aria-label="Ouvir este exemplo"
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
