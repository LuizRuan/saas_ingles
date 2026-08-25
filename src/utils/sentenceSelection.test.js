import { describe, expect, it } from 'vitest';
import { getSentences } from '../data/index';
import { getSentenceStarter, selectSentenceSet } from './sentenceSelection';

const seeded = (initial) => {
  let seed = initial;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};

describe('seletor do Montar Frases', () => {
  const catalog = getSentences('en-pt');

  it('entrega cinco frases distintas sem ultrapassar o limite de desafio', () => {
    for (const target of [1, 10, 30, 50, 70, 92]) {
      const result = selectSentenceSet({ sentences: catalog, targetDifficulty: target, rng: seeded(target) });
      expect(result).toHaveLength(5);
      expect(new Set(result.map(item => item.id)).size).toBe(5);
      expect(Math.max(...result.map(item => item.difficulty))).toBeLessThanOrEqual(Math.min(100, target + 8));
    }
  });

  it('preserva diversidade de tema e de início desde o começo', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const result = selectSentenceSet({ sentences: catalog, targetDifficulty: 5, rng: seeded(seed) });
      expect(new Set(result.map(item => item.category)).size).toBeGreaterThanOrEqual(4);
      expect(new Set(result.map(getSentenceStarter)).size).toBeGreaterThanOrEqual(4);
    }
  });

  it('exclui integralmente o histórico recente quando existem alternativas', () => {
    const recent = catalog.filter(item => item.difficulty <= 20).slice(0, 60).map(item => item.id);
    const result = selectSentenceSet({ sentences: catalog, targetDifficulty: 10, recentSentenceIds: recent, rng: seeded(99) });
    expect(result.every(item => !recent.includes(item.id))).toBe(true);
  });

  it('mantém a média próxima da habilidade em uma amostra estatística', () => {
    for (const target of [10, 35, 60, 85]) {
      const values = [];
      for (let seed = 1; seed <= 100; seed += 1) {
        values.push(...selectSentenceSet({ sentences: catalog, targetDifficulty: target, rng: seeded(seed) }).map(item => item.difficulty));
      }
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      expect(Math.abs(average - target)).toBeLessThanOrEqual(8);
    }
  });

  it('reforça a estrutura e só devolve a frase exata quando a revisão vence', () => {
    const wrong = catalog.find(item => item.category === 'comidas' && item.difficulty <= 20);
    const queue = [{ sentenceId: wrong.id, category: wrong.category, difficulty: wrong.difficulty, dueGame: 2, wrongCount: 1 }];
    const beforeDue = selectSentenceSet({ sentences: catalog, targetDifficulty: 10, reviewQueue: queue, completedGames: 1, rng: seeded(7) });
    expect(beforeDue.some(item => item.id === wrong.id)).toBe(false);
    expect(beforeDue.some(item => item.category === wrong.category)).toBe(true);

    const whenDue = selectSentenceSet({ sentences: catalog, targetDifficulty: 10, reviewQueue: queue, completedGames: 2, recentSentenceIds: [wrong.id], rng: seeded(7) });
    expect(whenDue.some(item => item.id === wrong.id)).toBe(true);
  });

  it('desprioriza frases já dominadas quando há opções equivalentes', () => {
    const near = catalog.filter(item => Math.abs(item.difficulty - 10) <= 5).slice(0, 20);
    const mastered = near[0];
    let appearances = 0;
    for (let seed = 1; seed <= 50; seed += 1) {
      const result = selectSentenceSet({
        sentences: near,
        targetDifficulty: 10,
        phraseStats: { [mastered.en]: { correct: 10, wrong: 0 } },
        rng: seeded(seed),
      });
      if (result.some(item => item.id === mastered.id)) appearances += 1;
    }
    expect(appearances).toBeLessThan(20);
  });
});
