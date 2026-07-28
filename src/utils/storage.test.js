// Persistência e migrações. O storage é a única memória do app (não há
// servidor), então uma migração errada apaga o progresso real de alguém.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadProgress, saveProgress, loadSettings, saveSettings, resetProgress, updateDayStreak } from './storage';

// localStorage mínimo em memória (o ambiente padrão do Vitest é Node)
beforeEach(() => {
  const store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  });
});

const gravarProgresso = (obj) => localStorage.setItem('englishplay_progress', JSON.stringify(obj));

describe('progresso', () => {
  it('devolve os padrões quando não há nada salvo', () => {
    const p = loadProgress();
    expect(p.totalScore).toBe(0);
    expect(p.wordStats).toEqual({});
    expect(p.phraseStats).toEqual({});
  });

  it('sobrevive a um blob corrompido', () => {
    localStorage.setItem('englishplay_progress', '{isso não é json');
    expect(loadProgress().totalScore).toBe(0);
  });

  it('completa campos novos em progresso antigo', () => {
    gravarProgresso({ totalScore: 42 });
    const p = loadProgress();
    expect(p.totalScore).toBe(42);
    expect(p.hintsAvailable).toBe(0);
    expect(p.selectedTheme).toBe('default');
  });

  it('faz ida e volta pelo saveProgress', () => {
    saveProgress({ ...loadProgress(), totalScore: 123 });
    expect(loadProgress().totalScore).toBe(123);
  });

  it('resetProgress limpa tudo', () => {
    saveProgress({ ...loadProgress(), totalScore: 500 });
    resetProgress();
    expect(loadProgress().totalScore).toBe(0);
  });
});

describe('migração de wordStats', () => {
  it('move frases para phraseStats e mantém vocabulário', () => {
    gravarProgresso({
      wordStats: {
        'Hello': { correct: 2, wrong: 1, timestamps: [1] },
        'I am happy.': { correct: 1, wrong: 0, timestamps: [2] },
      },
    });
    const p = loadProgress();
    expect(Object.keys(p.wordStats)).toEqual(['Hello']);
    expect(Object.keys(p.phraseStats)).toEqual(['I am happy.']);
    expect(p.wordsStudied).toBe(1);
  });

  it('funde grafias duplicadas da mesma palavra', () => {
    gravarProgresso({
      wordStats: {
        'Good morning': { correct: 1, wrong: 0, timestamps: [1] },
        'Good morning!': { correct: 2, wrong: 1, timestamps: [2] },
      },
    });
    const p = loadProgress();
    expect(Object.keys(p.wordStats)).toEqual(['Good morning']);
    expect(p.wordStats['Good morning'].correct).toBe(3);
    expect(p.wordStats['Good morning'].wrong).toBe(1);
    expect(p.wordsStudied).toBe(1);
  });

  it('é idempotente: carregar duas vezes não muda nada', () => {
    gravarProgresso({
      wordStats: { 'blue': { correct: 1, wrong: 0, timestamps: [1] }, 'I like pizza.': { correct: 1, wrong: 0, timestamps: [2] } },
    });
    const um = loadProgress();
    saveProgress(um);
    expect(loadProgress()).toEqual(um);
  });

  it('não perde progresso de quem nunca jogou nada', () => {
    gravarProgresso({ wordStats: {} });
    const p = loadProgress();
    expect(p.wordsStudied).toBe(0);
    expect(p.wordsLearned).toBe(0);
  });
});

describe('configurações', () => {
  it('migra o typo autoPronouce preservando a escolha', () => {
    localStorage.setItem('englishplay_settings', JSON.stringify({ autoPronouce: false, soundEnabled: true }));
    const s = loadSettings();
    expect(s.autoPronounce).toBe(false);
    expect(s).not.toHaveProperty('autoPronouce');
  });

  it('a grafia nova tem precedência sobre a antiga', () => {
    localStorage.setItem('englishplay_settings', JSON.stringify({ autoPronouce: false, autoPronounce: true }));
    expect(loadSettings().autoPronounce).toBe(true);
  });

  it('descarta a chave morta "theme"', () => {
    localStorage.setItem('englishplay_settings', JSON.stringify({ theme: 'dark' }));
    saveSettings(loadSettings());
    expect(JSON.parse(localStorage.getItem('englishplay_settings'))).not.toHaveProperty('theme');
  });
});

describe('sequência de dias', () => {
  const dia = (offset) => new Date(Date.now() + offset * 86400000).toDateString();

  it('começa em 1 no primeiro dia', () => {
    expect(updateDayStreak({}).dayStreak).toBe(1);
  });

  it('incrementa em dias consecutivos', () => {
    expect(updateDayStreak({ lastStudyDate: dia(-1), dayStreak: 3 }).dayStreak).toBe(4);
  });

  it('zera após pular um dia', () => {
    expect(updateDayStreak({ lastStudyDate: dia(-5), dayStreak: 9 }).dayStreak).toBe(1);
  });

  it('não conta duas vezes no mesmo dia', () => {
    const p = { lastStudyDate: dia(0), dayStreak: 3 };
    expect(updateDayStreak(p).dayStreak).toBe(3);
  });
});
