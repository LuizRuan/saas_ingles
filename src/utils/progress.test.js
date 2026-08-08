// Lógica de progresso: pontuação, níveis, revisão, chave canônica e desafio
// diário. Cada bloco marcado "regressão" corresponde a um bug real já corrigido.
import { describe, it, expect } from 'vitest';
import { calculatePoints, checkStreakBonus, POINTS } from './scoring';
import { getCurrentLevel, getNextLevel, getLevelProgress, getUserTitle } from './levelSystem';
import { recordWordResult, getWordsToReview, mixReviewWords, LEARNED_THRESHOLD } from './reviewSystem';
import { normalizeKey, resolveWordKey, mergeStats } from './wordKey';
import { generateDailyChallenge, isDailyChallengeCompleted } from './dailyChallenge';
import { levels } from '../data/categories';
import { words } from '../data/words';

const progressoVazio = () => ({
  wordStats: {}, phraseStats: {}, errorHistory: [],
  totalCorrect: 0, totalWrong: 0, currentStreak: 0, bestStreak: 0,
});

describe('pontuação', () => {
  it('premia por tentativa e nunca subtrai', () => {
    expect(calculatePoints(1)).toBe(POINTS.FIRST_TRY);
    expect(calculatePoints(2)).toBe(POINTS.SECOND_TRY);
    expect(calculatePoints(1, true)).toBe(POINTS.WITH_HINT);
    expect(calculatePoints(9)).toBeGreaterThan(0);
  });

  it('dá bônus a cada 5 acertos seguidos', () => {
    expect(checkStreakBonus(5)).toBe(POINTS.STREAK_BONUS);
    expect(checkStreakBonus(10)).toBe(POINTS.STREAK_BONUS);
    expect(checkStreakBonus(4)).toBe(0);
    expect(checkStreakBonus(0)).toBe(0);
  });
});

describe('níveis', () => {
  it('mapeia palavras estudadas para o nível certo', () => {
    expect(getCurrentLevel(0).level).toBe(1);
    expect(getCurrentLevel(levels[1].wordsNeeded).level).toBe(2);
    expect(getCurrentLevel(999999).level).toBe(levels.length);
    expect(getNextLevel(999999)).toBeNull();
  });

  it('o percentual fica sempre entre 0 e 100', () => {
    [0, 5, 20, 100, 999999].forEach(n => {
      const v = getLevelProgress(n);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('retorna os títulos certos a cada 10 níveis até o 100', () => {
    expect(getUserTitle(1).title).toBe('Iniciante');
    expect(getUserTitle(10).title).toBe('Estudante');
    expect(getUserTitle(20).title).toBe('Conversador');
    expect(getUserTitle(30).title).toBe('Poliglota');
    expect(getUserTitle(40).title).toBe('Especialista');
    expect(getUserTitle(50).title).toBe('Sábio');
    expect(getUserTitle(60).title).toBe('Mestre das Frases');
    expect(getUserTitle(70).title).toBe('Fluente Épico');
    expect(getUserTitle(80).title).toBe('Lenda do Inglês');
    expect(getUserTitle(90).title).toBe('Imortal do Idioma');
    expect(getUserTitle(100).title).toBe('Supremo Mestre');
  });
});

describe('chave canônica', () => {
  it('ignora caixa e pontuação de borda', () => {
    expect(normalizeKey('Good morning!')).toBe(normalizeKey('good morning'));
    expect(resolveWordKey('Good morning!')).toBe('Good morning');
    expect(resolveWordKey('blue')).toBe('Blue');
  });

  it('devolve null para o que não é vocabulário', () => {
    expect(resolveWordKey('I am happy.')).toBeNull();
    expect(resolveWordKey('')).toBeNull();
  });

  it('mergeStats soma sem perder histórico', () => {
    const a = { correct: 1, wrong: 2, timestamps: [1], lastSeen: 1 };
    const b = { correct: 3, wrong: 0, timestamps: [5], lastSeen: 5 };
    expect(mergeStats(a, b)).toMatchObject({ correct: 4, wrong: 2, timestamps: [1, 5], lastSeen: 5 });
  });
});

describe('registro de resultado', () => {
  it('contabiliza acerto, sequência e recorde', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', true);
    expect(p.wordStats.Hello.correct).toBe(1);
    expect(p.currentStreak).toBe(1);
    expect(p.bestStreak).toBe(1);
    p = recordWordResult(p, 'Hello', false);
    expect(p.currentStreak).toBe(0);
    expect(p.bestStreak).toBe(1);
    expect(p.errorHistory).toHaveLength(1);
  });

  it('regressão: é PURA — não altera o progresso recebido', () => {
    // O bug: push direto em errorHistory/wordStats fazia o StrictMode
    // duplicar cada erro (um clique registrava 2).
    const antes = recordWordResult(progressoVazio(), 'Hello', false);
    const copia = structuredClone(antes);
    const depois = recordWordResult(antes, 'Hello', false);
    expect(antes).toEqual(copia);            // entrada intacta
    expect(depois.errorHistory).toHaveLength(2);
    expect(antes.errorHistory).toHaveLength(1);
  });

  it('regressão: chamar duas vezes com o mesmo estado dá o mesmo resultado', () => {
    const base = progressoVazio();
    const a = recordWordResult(base, 'Hello', false);
    const b = recordWordResult(base, 'Hello', false);
    expect(a.errorHistory).toHaveLength(1);
    expect(b.errorHistory).toHaveLength(1);
  });

  it('regressão: frases vão para phraseStats, não inflam palavras estudadas', () => {
    let p = recordWordResult(progressoVazio(), 'I am happy.', true);
    expect(p.wordsStudied).toBe(0);
    expect(Object.keys(p.phraseStats)).toEqual(['I am happy.']);
    p = recordWordResult(p, 'Hello', true);
    expect(p.wordsStudied).toBe(1);
  });

  it('regressão: grafias diferentes da mesma palavra somam na mesma chave', () => {
    let p = recordWordResult(progressoVazio(), 'Good morning', true);
    p = recordWordResult(p, 'Good morning!', true);
    expect(Object.keys(p.wordStats)).toEqual(['Good morning']);
    expect(p.wordStats['Good morning'].correct).toBe(2);
    expect(p.wordsStudied).toBe(1);
  });

  it('limita o histórico de erros a 100', () => {
    let p = progressoVazio();
    for (let i = 0; i < 150; i++) p = recordWordResult(p, `Palavra ${i}`, false);
    expect(p.errorHistory).toHaveLength(100);
  });

  it('só marca "aprendida" com acertos em dias distintos', () => {
    let p = progressoVazio();
    for (let i = 0; i < LEARNED_THRESHOLD; i++) p = recordWordResult(p, 'Dog', true);
    expect(p.wordStats.Dog.learned).toBeUndefined(); // tudo no mesmo dia
    expect(p.wordsLearned).toBe(1);                  // mas já conta pelo limiar
  });
});

describe('revisão', () => {
  it('lista palavras erradas e ignora as já dominadas', () => {
    let p = progressoVazio();
    p = recordWordResult(p, 'Hello', false);
    const revisar = getWordsToReview(p, words).map(w => w.en);
    expect(revisar).toContain('Hello');
  });

  it('regressão: erro gravado com outra grafia aparece na revisão', () => {
    // Antes, TranslationQuiz gravava "Good morning!" e a revisão — que casa
    // contra words.js — nunca encontrava a palavra.
    let p = recordWordResult(progressoVazio(), 'Good morning!', false);
    expect(getWordsToReview(p, words).map(w => w.en)).toContain('Good morning');
  });

  it('mixReviewWords preserva o tamanho do lote', () => {
    expect(mixReviewWords(words.slice(0, 10), words.slice(20, 25), 0.3)).toHaveLength(10);
  });

  it('palavra dominada sai da revisão ao atingir o limiar', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    expect(getWordsToReview(p, words)).toHaveLength(1);
    for (let i = 0; i < LEARNED_THRESHOLD; i++) p = recordWordResult(p, 'Hello', true);
    expect(getWordsToReview(p, words)).toHaveLength(0);
  });

  it('regressão: 1 acerto na revisão já remove a palavra, sem esperar o limiar', () => {
    // Antes, a lista só considerava "revisada" ao atingir LEARNED_THRESHOLD
    // acertos totais — quem terminava a tela "Revisão Concluída!" via a
    // mesma palavra continuar aparecendo, porque 1 acerto raramente chega
    // ao limiar sozinho.
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    expect(getWordsToReview(p, words)).toHaveLength(1);
    p = recordWordResult(p, 'Hello', true);
    expect(getWordsToReview(p, words)).toHaveLength(0);
  });

  it('regressão: um erro novo depois de acertar volta a marcar a palavra pra revisão', () => {
    let p = recordWordResult(progressoVazio(), 'Hello', false);
    p = recordWordResult(p, 'Hello', true);
    expect(getWordsToReview(p, words)).toHaveLength(0);
    p = recordWordResult(p, 'Hello', false);
    expect(getWordsToReview(p, words)).toHaveLength(1);
  });
});

describe('desafio diário', () => {
  it('é determinístico no mesmo dia, inclusive nas alternativas', () => {
    const sig = (r) => r.challenges.map(c => `${c.type}:${c.answer.en}[${c.options.map(o => o.en)}]`).join('|');
    expect(sig(generateDailyChallenge(words))).toBe(sig(generateDailyChallenge(words)));
  });

  it('regressão: todo passo tem 4 alternativas distintas com 1 correta', () => {
    generateDailyChallenge(words).challenges.forEach(c => {
      expect(c.options).toHaveLength(4);
      expect(new Set(c.options.map(o => o.en)).size).toBe(4);
      expect(c.options.filter(o => o.en === c.answer.en)).toHaveLength(1);
    });
  });

  it('regressão: não quebra com acervo pequeno', () => {
    [1, 2, 5, 8].forEach(n => {
      const c = generateDailyChallenge(words.slice(0, n));
      c.challenges.forEach(ch => expect(ch.answer).toBeTruthy());
    });
    expect(generateDailyChallenge([]).challenges).toEqual([]);
  });

  it('reconhece o desafio já concluído hoje', () => {
    expect(isDailyChallengeCompleted({ lastDailyChallengeDate: new Date().toDateString() })).toBe(true);
    expect(isDailyChallengeCompleted({ lastDailyChallengeDate: 'Mon Jan 01 2024' })).toBe(false);
  });
});
