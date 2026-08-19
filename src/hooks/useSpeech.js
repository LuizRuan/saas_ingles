import { useCallback, useEffect, useState } from 'react';
import { loadSettings, loadProgress } from '../utils/storage';
import { getCourseLangCode } from '../data/index';

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

  const getTargetLang = useCallback((overrideLang) => {
    if (overrideLang) return overrideLang;
    const progress = loadProgress();
    return getCourseLangCode(progress.activeCourse || 'en-pt');
  }, []);

  const speak = useCallback((text, lang, rate = 1) => {
    const settings = loadSettings();
    if (!isAvailable || !settings.soundEnabled) return;

    const targetLang = getTargetLang(lang);

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Procura uma voz no idioma solicitado (ex: 'en', 'es', 'pt')
      const targetLangPrefix = (targetLang || 'en').slice(0, 2);
      const matchingVoice = voices.find(v => v.lang.startsWith(targetLangPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Síntese de voz indisponível neste navegador
    }
  }, [isAvailable, voices, getTargetLang]);

  const speakNormal = useCallback((text, lang) => {
    speak(text, lang, 0.95);
  }, [speak]);

  const speakSlow = useCallback((text, lang) => {
    speak(text, lang, 0.5);
  }, [speak]);

  const stop = useCallback(() => {
    if (isAvailable) {
      window.speechSynthesis.cancel();
    }
  }, [isAvailable]);

  return { speak, speakSlow, speakNormal, stop, isAvailable };
};

export default useSpeech;
