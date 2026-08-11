import useSpeech from '../../hooks/useSpeech';
import './PronunciationFeedbackModal.css';

const PronunciationFeedbackModal = ({ evaluation, targetText, onClose }) => {
  const { speakNormal } = useSpeech();

  if (!evaluation) return null;

  const playRecordedVoice = () => {
    if (evaluation.audioUrl) {
      const audio = new Audio(evaluation.audioUrl);
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="pronunciation-modal-overlay animate-fade-in">
      <div className="pronunciation-modal-card glass-card animate-pop-in">
        <div className="pronunciation-score-badge">
          {evaluation.score}%
        </div>
        <h3 className="pronunciation-feedback-title">{evaluation.feedback}</h3>

        <div className="pronunciation-word-results">
          {evaluation.wordResults.map((item, idx) => (
            <span key={idx} className={`pronunciation-word ${item.status}`}>
              {item.word}
            </span>
          ))}
        </div>

        <div className="pronunciation-audio-actions">
          {evaluation.audioUrl && (
            <button className="btn btn-secondary btn-sm" onClick={playRecordedVoice}>
              ▶️ Minha Voz
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => speakNormal(targetText)}>
            🔊 Voz Nativa
          </button>
        </div>

        <button className="btn btn-ghost btn-sm pronunciation-close-btn" onClick={onClose}>
          Continuar
        </button>
      </div>
    </div>
  );
};

export default PronunciationFeedbackModal;
