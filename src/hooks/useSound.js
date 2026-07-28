import { useCallback, useRef } from 'react';
import { loadSettings } from '../utils/storage';

// Generate sounds using Web Audio API — no external files needed
const useSound = () => {
  const audioCtxRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Navegadores criam o contexto suspenso até haver um gesto do usuário.
    // Como todo som aqui parte de um clique, basta retomá-lo na primeira vez.
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => { /* sem áudio disponível */ });
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.15) => {
    const settings = loadSettings();
    if (!settings.soundEnabled) return;

    try {
      const ctx = getAudioCtx();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Áudio indisponível: o jogo segue sem som
    }
  }, [getAudioCtx]);

  const playCorrect = useCallback(() => {
    playTone(523.25, 0.15, 'sine', 0.12); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.12), 200); // G5
  }, [playTone]);

  // Erro precisa soar CLARAMENTE diferente do acerto: o acerto é um arpejo
  // ascendente em seno (C5-E5-G5), então aqui usamos o oposto — duas notas
  // graves DEScendentes com timbre de onda quadrada (áspero, tipo "buzzer").
  const playWrong = useCallback(() => {
    playTone(185.00, 0.16, 'square', 0.05);                                  // F#3
    setTimeout(() => playTone(138.59, 0.34, 'square', 0.05), 130);           // C#3
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(800, 0.05, 'sine', 0.06);
  }, [playTone]);

  const playAchievement = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.2, 'sine', 0.1), i * 120);
    });
  }, [playTone]);

  const playFlip = useCallback(() => {
    playTone(400, 0.08, 'triangle', 0.06);
  }, [playTone]);

  const playMatch = useCallback(() => {
    playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.1), 80);
  }, [playTone]);

  return { playCorrect, playWrong, playClick, playAchievement, playFlip, playMatch };
};

export default useSound;
