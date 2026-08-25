import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSettings, saveSettings, SETTINGS_CHANGE_EVENT } from '../utils/storage';

const MUSIC_STATE_EVENT = 'wordly:background-music-state';
const PAD_INTERVAL_MS = 3500;
const MELODY_INTERVAL_MS = 2200;
const notes = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
const randomNote = () => notes[Math.floor(Math.random() * notes.length)];

/** Player global de ambiente procedural. Monte-o uma única vez no Layout. */
const useBackgroundMusic = () => {
  const contextRef = useRef(null);
  const masterGainRef = useRef(null);
  const padTimerRef = useRef(null);
  const melodyTimerRef = useRef(null);
  const startedByUserRef = useRef(false);
  const playingRef = useRef(false);
  const volumeRef = useRef(loadSettings().musicVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(volumeRef.current);

  const publishState = useCallback((playing) => {
    document.documentElement.dataset.backgroundMusic = playing ? 'playing' : 'paused';
    window.dispatchEvent(new CustomEvent(MUSIC_STATE_EVENT, {
      detail: { isPlaying: playing, volume: volumeRef.current },
    }));
  }, []);

  const setPlaying = useCallback((playing) => {
    playingRef.current = playing;
    setIsPlaying(playing);
    publishState(playing);
  }, [publishState]);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      const context = new AudioContext();
      const masterGain = context.createGain();
      masterGain.gain.setValueAtTime(volumeRef.current, context.currentTime);
      masterGain.connect(context.destination);
      contextRef.current = context;
      masterGainRef.current = masterGain;
    }
    return contextRef.current;
  }, []);

  const playPad = useCallback(() => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain || context.state !== 'running') return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const now = context.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(randomNote() / 2, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
    gain.gain.linearRampToValueAtTime(0.05, now + 2);
    gain.gain.linearRampToValueAtTime(0, now + 4);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 4.1);
  }, []);

  const playMelody = useCallback(() => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain || context.state !== 'running' || Math.random() > 0.4) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(randomNote(), now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.15);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.6);
    gain.gain.linearRampToValueAtTime(0, now + 1.8);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + 1.9);
  }, []);

  const stopMusic = useCallback(() => {
    clearInterval(padTimerRef.current);
    clearInterval(melodyTimerRef.current);
    padTimerRef.current = null;
    melodyTimerRef.current = null;
    const context = contextRef.current;
    if (context?.state === 'running') context.suspend().catch(() => {});
    if (playingRef.current) setPlaying(false);
  }, [setPlaying]);

  const startMusic = useCallback(async () => {
    const settings = loadSettings();
    if (!settings.musicEnabled || document.hidden || playingRef.current) return;
    const context = getContext();
    if (!context) return;
    try {
      if (context.state === 'suspended') await context.resume();
      if (context.state !== 'running') return;
      playPad();
      padTimerRef.current = setInterval(playPad, PAD_INTERVAL_MS);
      melodyTimerRef.current = setInterval(playMelody, MELODY_INTERVAL_MS);
      setPlaying(true);
    } catch {
      // A próxima interação do usuário tentará iniciar novamente.
    }
  }, [getContext, playMelody, playPad, setPlaying]);

  const setVolume = useCallback((value) => {
    const nextVolume = Math.max(0, Math.min(1, Number(value) || 0));
    volumeRef.current = nextVolume;
    setVolumeState(nextVolume);
    if (masterGainRef.current && contextRef.current) {
      masterGainRef.current.gain.setValueAtTime(nextVolume, contextRef.current.currentTime);
    }
    saveSettings({ ...loadSettings(), musicVolume: nextVolume });
    publishState(playingRef.current);
  }, [publishState]);

  const toggle = useCallback(() => {
    const settings = loadSettings();
    saveSettings({ ...settings, musicEnabled: !settings.musicEnabled });
  }, []);

  useEffect(() => {
    const syncSettings = () => {
      const settings = loadSettings();
      volumeRef.current = settings.musicVolume;
      setVolumeState(settings.musicVolume);
      if (masterGainRef.current && contextRef.current) {
        masterGainRef.current.gain.setValueAtTime(settings.musicVolume, contextRef.current.currentTime);
      }
      if (!settings.musicEnabled) stopMusic();
      else if (startedByUserRef.current && !document.hidden) startMusic();
    };
    window.addEventListener(SETTINGS_CHANGE_EVENT, syncSettings);
    window.addEventListener('storage', syncSettings);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, [startMusic, stopMusic]);

  useEffect(() => {
    const startAfterGesture = () => {
      startedByUserRef.current = true;
      startMusic();
    };
    const handleVisibility = () => {
      if (document.hidden) stopMusic();
      else if (startedByUserRef.current) startMusic();
    };
    document.addEventListener('pointerdown', startAfterGesture);
    document.addEventListener('keydown', startAfterGesture);
    document.addEventListener('touchstart', startAfterGesture);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('pointerdown', startAfterGesture);
      document.removeEventListener('keydown', startAfterGesture);
      document.removeEventListener('touchstart', startAfterGesture);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [startMusic, stopMusic]);

  useEffect(() => () => {
    stopMusic();
    contextRef.current?.close().catch(() => {});
  }, [stopMusic]);

  return { isPlaying, volume, setVolume, toggle };
};

export { MUSIC_STATE_EVENT };
export default useBackgroundMusic;
