import { useEffect } from 'react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { useProgress } from '../../hooks/useProgress';
import { getCourseLangCode } from '../../data/index';
import './MicButton.css';

// `lang` continua aceito como override explícito, mas o padrão passou a ser o
// idioma do CURSO ATIVO — fixo em 'en-US' o reconhecimento tentaria entender
// espanhol usando o modelo de inglês e erraria quase tudo.
const MicButton = ({ onTranscriptChange, onSpeechEnd, lang, size = 'md' }) => {
  const { progress } = useProgress();
  const idioma = lang || getCourseLangCode(progress?.activeCourse || 'en-pt');
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
      startListening(idioma);
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
