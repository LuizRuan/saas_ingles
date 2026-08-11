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

  const getSelectedPack = useCallback((overridePack) => {
    const settings = loadSettings();
    if (!settings.soundEnabled) return null;
    if (overridePack) return overridePack;
    const progress = JSON.parse(localStorage.getItem('englishplay_progress') || '{}');
    return progress.selectedSoundPack || 'default';
  }, []);

  const playCorrect = useCallback((overridePack) => {
    const pack = getSelectedPack(overridePack);
    if (!pack) return;

    if (pack === 'retro') {
      playTone(440, 0.08, 'square', 0.06);
      setTimeout(() => playTone(554.37, 0.08, 'square', 0.06), 70);
      setTimeout(() => playTone(659.25, 0.12, 'square', 0.06), 140);
    } else if (pack === 'scifi') {
      playTone(700, 0.1, 'sawtooth', 0.05);
      setTimeout(() => playTone(1200, 0.15, 'sawtooth', 0.05), 80);
    } else if (pack === 'orchestra') {
      playTone(523.25, 0.25, 'sine', 0.08);
      playTone(659.25, 0.25, 'sine', 0.08);
      playTone(783.99, 0.3, 'sine', 0.08);
    } else {
      playTone(523.25, 0.15, 'sine', 0.12); // C5
      setTimeout(() => playTone(659.25, 0.15, 'sine', 0.12), 100); // E5
      setTimeout(() => playTone(783.99, 0.2, 'sine', 0.12), 200); // G5
    }
  }, [getSelectedPack, playTone]);

  const playWrong = useCallback((overridePack) => {
    const pack = getSelectedPack(overridePack);
    if (!pack) return;

    if (pack === 'retro') {
      playTone(220, 0.12, 'square', 0.06);
      setTimeout(() => playTone(164.81, 0.22, 'square', 0.06), 100);
    } else if (pack === 'scifi') {
      playTone(400, 0.1, 'sawtooth', 0.05);
      setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.05), 90);
    } else if (pack === 'orchestra') {
      playTone(196.00, 0.22, 'triangle', 0.06);
      setTimeout(() => playTone(174.61, 0.25, 'triangle', 0.06), 120);
      setTimeout(() => playTone(146.83, 0.35, 'triangle', 0.05), 260);
    } else {
      playTone(185.00, 0.16, 'square', 0.05);
      setTimeout(() => playTone(138.59, 0.34, 'square', 0.05), 130);
    }
  }, [getSelectedPack, playTone]);

  const playClick = useCallback((overridePack) => {
    const pack = getSelectedPack(overridePack);
    if (!pack) return;

    if (pack === 'retro') {
      playTone(880, 0.04, 'square', 0.04);
    } else if (pack === 'scifi') {
      playTone(1200, 0.04, 'sawtooth', 0.035);
      setTimeout(() => playTone(900, 0.04, 'sawtooth', 0.03), 35);
    } else if (pack === 'orchestra') {
      playTone(659.25, 0.07, 'triangle', 0.045);
    } else {
      playTone(800, 0.05, 'sine', 0.06);
    }
  }, [getSelectedPack, playTone]);

  const playAchievement = useCallback((overridePack) => {
    const pack = getSelectedPack(overridePack);
    if (!pack) return;

    const patterns = {
      retro: { notes: [523.25, 659.25, 783.99, 1046.5, 1318.51], type: 'square', volume: 0.06, step: 85 },
      scifi: { notes: [392, 784, 1174.66, 1567.98], type: 'sawtooth', volume: 0.045, step: 95 },
      orchestra: { notes: [392, 523.25, 659.25, 783.99, 1046.5], type: 'sine', volume: 0.09, step: 130 },
      default: { notes: [523.25, 659.25, 783.99, 1046.5], type: 'sine', volume: 0.1, step: 120 },
    };
    const pattern = patterns[pack] || patterns.default;
    pattern.notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.2, pattern.type, pattern.volume), i * pattern.step);
    });
  }, [getSelectedPack, playTone]);

  const playFlip = useCallback((overridePack) => {
    const pack = getSelectedPack(overridePack);
    if (!pack) return;

    if (pack === 'retro') {
      playTone(330, 0.06, 'square', 0.05);
      setTimeout(() => playTone(660, 0.06, 'square', 0.05), 55);
    } else if (pack === 'scifi') {
      playTone(300, 0.08, 'sawtooth', 0.04);
      setTimeout(() => playTone(900, 0.08, 'sawtooth', 0.04), 60);
    } else if (pack === 'orchestra') {
      playTone(349.23, 0.08, 'triangle', 0.055);
    } else {
      playTone(400, 0.08, 'triangle', 0.06);
    }
  }, [getSelectedPack, playTone]);

  const playMatch = useCallback((overridePack) => {
    const pack = getSelectedPack(overridePack);
    if (!pack) return;

    if (pack === 'retro') {
      playTone(660, 0.08, 'square', 0.055);
      setTimeout(() => playTone(880, 0.1, 'square', 0.055), 65);
    } else if (pack === 'scifi') {
      playTone(850, 0.08, 'sawtooth', 0.045);
      setTimeout(() => playTone(1350, 0.12, 'sawtooth', 0.04), 70);
    } else if (pack === 'orchestra') {
      playTone(523.25, 0.16, 'sine', 0.075);
      playTone(659.25, 0.16, 'sine', 0.075);
      setTimeout(() => playTone(783.99, 0.2, 'sine', 0.075), 100);
    } else {
      playTone(600, 0.1, 'sine', 0.1);
      setTimeout(() => playTone(800, 0.15, 'sine', 0.1), 80);
    }
  }, [getSelectedPack, playTone]);

  return { playCorrect, playWrong, playClick, playAchievement, playFlip, playMatch };
};

export default useSound;
