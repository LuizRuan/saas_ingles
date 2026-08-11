import { useEffect } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import './MicButton.css';

const MicButton = ({ onTranscriptChange, onSpeechEnd, lang = 'en-US', size = 'md' }) => {
  const {
    isSupported,
    isListening,
    transcript,
    audioUrl,
    startListening,
    stopListening
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && onTranscriptChange) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  useEffect(() => {
    if (!isListening && transcript && onSpeechEnd) {
      onSpeechEnd({ transcript, audioUrl });
    }
  }, [isListening, transcript, audioUrl, onSpeechEnd]);

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(lang);
    }
  };

  return (
    <button
      type="button"
      className={`mic-button ${size} ${isListening ? 'listening' : ''}`}
      onClick={handleClick}
      aria-label={isListening ? 'Parar de gravar' : 'Falar no microfone'}
      title={isListening ? 'Gravando... Clique para parar' : 'Clique para praticar a fala'}
    >
      <span className="mic-icon">🎙️</span>
      {isListening && <span className="mic-pulse-ring"></span>}
    </button>
  );
};

export default MicButton;
