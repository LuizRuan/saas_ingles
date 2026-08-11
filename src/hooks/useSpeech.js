import { useCallback, useEffect, useState } from 'react';
import { loadSettings } from '../utils/storage';

const useSpeech = () => {
  const isAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [voices, setVoices] = useState([]);

  // Voices load asynchronously in most browsers
  useEffect(() => {
    if (!isAvailable) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [isAvailable]);

  const speak = useCallback((text, lang = 'en-US', rate = 1) => {
    const settings = loadSettings();
    if (!isAvailable || !settings.soundEnabled) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Procura uma voz no idioma solicitado (ex: 'en', 'pt')
      const targetLangPrefix = (lang || 'en').slice(0, 2);
      const matchingVoice = voices.find(v => v.lang.startsWith(targetLangPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Síntese de voz indisponível neste navegador
    }
  }, [isAvailable, voices]);

  const speakNormal = useCallback((text) => {
    speak(text, 'en-US', 0.95);
  }, [speak]);

  const speakSlow = useCallback((text) => {
    speak(text, 'en-US', 0.5);
  }, [speak]);

  const stop = useCallback(() => {
    if (isAvailable) {
      window.speechSynthesis.cancel();
    }
  }, [isAvailable]);

  return { speak, speakSlow, speakNormal, stop, isAvailable };
};

export default useSpeech;
