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
    // Campo novo: quem já jogava antes do Tempo Extra existir tem que receber
    // o default em vez de undefined, senão o botão "+10s" quebra na conta.
    expect(p.extraTimeAvailable).toBe(0);
    // Apelido do duelo humano de "Quem Sabe Mais?" — default null, não string vazia
    expect(p.displayName).toBeNull();
  });

  it('corta o apelido de duelo em 20 caracteres (é mostrado a um estranho)', () => {
    gravarProgresso({ displayName: 'a'.repeat(100) });
    expect(loadProgress().displayName).toHaveLength(20);
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

describe('saneamento (localStorage é entrada não confiável)', () => {
  it('descarta NaN e Infinity vindos do blob', () => {
    gravarProgresso({ totalScore: 'NaN', bestStreak: null, dayStreak: 'abc' });
    const p = loadProgress();
    expect(p.totalScore).toBe(0);
    expect(p.bestStreak).toBe(0);
    expect(p.dayStreak).toBe(0);
    expect(Number.isFinite(p.totalScore)).toBe(true);
  });

  it('limita o multiplicador de pontos', () => {
    gravarProgresso({ pointsMultiplier: 1e9, multiplierGames: 99999 });
    const p = loadProgress();
    expect(p.pointsMultiplier).toBeLessThanOrEqual(10);
    expect(p.multiplierGames).toBeLessThanOrEqual(100);
  });

  it('saneia o estoque de Tempo Extra', () => {
    gravarProgresso({ extraTimeAvailable: -5 });
    expect(loadProgress().extraTimeAvailable).toBe(0);

    gravarProgresso({ extraTimeAvailable: 'tres' });
    expect(loadProgress().extraTimeAvailable).toBe(0);

    gravarProgresso({ extraTimeAvailable: 3 });
    expect(loadProgress().extraTimeAvailable).toBe(3);
  });

  it('rejeita tipos trocados sem quebrar', () => {
    gravarProgresso({
      achievements: 'nao-e-array',
      wordStats: 'nao-e-objeto',
      gamesCompleted: [1, 2, 3],
      errorHistory: { nao: 'array' },
      shopItems: [{ objeto: true }, 'theme_dark'],
    });
    const p = loadProgress();
    expect(p.achievements).toEqual([]);
    expect(p.wordStats).toEqual({});
    expect(p.errorHistory).toEqual([]);
    expect(p.shopItems).toEqual(['theme_dark']); // objeto descartado
    expect(typeof p.gamesCompleted.memory).toBe('number');
  });

  it('corta chaves absurdamente longas', () => {
    gravarProgresso({ wordStats: { ['x'.repeat(5000)]: { correct: 1 } } });
    expect(Object.keys(loadProgress().wordStats)).toEqual([]);
  });

  it('não deixa protótipo ser poluído via __proto__', () => {
    localStorage.setItem('englishplay_progress',
      '{"__proto__":{"poluido":true},"totalScore":5}');
    const p = loadProgress();
    expect({}.poluido).toBeUndefined();
    expect(p.totalScore).toBe(5);
  });

  it('aceita um progresso legítimo sem alterá-lo', () => {
    gravarProgresso({
      totalScore: 250, bestStreak: 7, achievements: ['first_word'],
      wordStats: { Hello: { correct: 2, wrong: 1, timestamps: [111], lastSeen: 111 } },
    });
    const p = loadProgress();
    expect(p.totalScore).toBe(250);
    expect(p.bestStreak).toBe(7);
    expect(p.achievements).toEqual(['first_word']);
    expect(p.wordStats.Hello).toMatchObject({ correct: 2, wrong: 1 });
  });

  it('regressão: campos do Campeonato Mensal sobrevivem ao saneamento', () => {
    // Bug real: os 3 campos não existiam em defaultProgress nem no retorno de
    // saneiaProgresso(), então todo load/save (via sanitizeProgress) os
    // apagava silenciosamente — mesmo que o resgate tivesse gravado certo.
    gravarProgresso({
      lastMonthlyRewardMonth: '2026-07',
      pendingMonthlyReward: { month: '2026-08', rank: 2, claimed: false },
      isMonthlyChampion: true,
    });
    const p = loadProgress();
    expect(p.lastMonthlyRewardMonth).toBe('2026-07');
    expect(p.pendingMonthlyReward).toEqual({ month: '2026-08', rank: 2, claimed: false });
    expect(p.isMonthlyChampion).toBe(true);
  });

  it('rejeita pendingMonthlyReward forjado/malformado', () => {
    gravarProgresso({ pendingMonthlyReward: { rank: 1 } }); // sem month
    expect(loadProgress().pendingMonthlyReward).toBeNull();

    gravarProgresso({ pendingMonthlyReward: { month: '2026-08', rank: 99 } }); // rank inválido
    expect(loadProgress().pendingMonthlyReward).toBeNull();

    gravarProgresso({ pendingMonthlyReward: 'nao-e-objeto' });
    expect(loadProgress().pendingMonthlyReward).toBeNull();
  });

  it('configurações só aceitam booleanos', () => {
    localStorage.setItem('englishplay_settings',
      JSON.stringify({ soundEnabled: 'sim', animationsEnabled: 1, autoPronounce: false, extra: 'lixo' }));
    const s = loadSettings();
    expect(s.soundEnabled).toBe(true);       // volta ao padrão
    expect(s.animationsEnabled).toBe(true);  // volta ao padrão
    expect(s.autoPronounce).toBe(false);     // booleano legítimo preservado
    expect(s).not.toHaveProperty('extra');   // chave desconhecida descartada
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
  const dia = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toDateString();
  };

  it('começa em 1 no primeiro dia de estudo', () => {
    expect(updateDayStreak({}).dayStreak).toBe(1);
  });

  it('incrementa em dias consecutivos ao estudar', () => {
    expect(updateDayStreak({ lastStudyDate: dia(-1), dayStreak: 3 }).dayStreak).toBe(4);
  });

  it('reinicia em 1 após pular dias ao estudar novamente', () => {
    expect(updateDayStreak({ lastStudyDate: dia(-5), dayStreak: 9 }).dayStreak).toBe(1);
  });

  it('não conta duas vezes no mesmo dia', () => {
    const p = { lastStudyDate: dia(0), dayStreak: 3 };
    expect(updateDayStreak(p).dayStreak).toBe(3);
  });

  it('zera o streak ao carregar se o usuário ficou 2 ou mais dias sem estudar', () => {
    localStorage.setItem('englishplay_progress', JSON.stringify({ lastStudyDate: dia(-3), dayStreak: 10 }));
    const p = loadProgress();
    expect(p.dayStreak).toBe(0);
    expect(p.lastStudyDate).toBe(dia(-3));
  });

  it('mantém o streak ao carregar se o último estudo foi ontem ou hoje', () => {
    localStorage.setItem('englishplay_progress', JSON.stringify({ lastStudyDate: dia(-1), dayStreak: 10 }));
    expect(loadProgress().dayStreak).toBe(10);

    localStorage.setItem('englishplay_progress', JSON.stringify({ lastStudyDate: dia(0), dayStreak: 10 }));
    expect(loadProgress().dayStreak).toBe(10);
  });
});
