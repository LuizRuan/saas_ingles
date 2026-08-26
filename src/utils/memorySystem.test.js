import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { getAllMemoryDifficulties, getMemoryDifficulty } from './memoryDifficulty';
import { getMemoryWordKey, isValidMemoryBoard } from './memoryAudit';
import { buildMemoryWordResults, updateMemoryStats } from './memoryPerformance';
import { appendRecentMemoryWords, MEMORY_RECENT_LIMIT } from './memoryRecent';
import { updateMemoryReviewQueue, MEMORY_REVIEW_QUEUE_LIMIT } from './memoryReview';
import { createMemoryGameResult } from './memoryScoring';
import { selectMemoryWords } from './memorySelection';
import { updateMemorySkill } from './memorySkill';

const seeded = (initial) => {
  let seed = initial >>> 0;
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
};

const courses = [
  ['inglês', englishWords],
  ['espanhol', spanishWords],
];

describe.each(courses)('auditoria completa do sistema de memória — %s', (_name, words) => {
  it('cria tabuleiros válidos em todos os níveis e modos', () => {
    for (let level = 1; level <= 100; level += 1) {
      getAllMemoryDifficulties({ rating: level, attempts: 1 }, level).forEach((mode, modeIndex) => {
        const board = selectMemoryWords({
          words,
          targetDifficulty: mode.targetDifficulty,
          count: mode.pairs,
          rng: seeded((level * 31) + modeIndex),
        });
        expect(board.words, `nível ${level}, modo ${mode.id}`).toHaveLength(mode.pairs);
        expect(isValidMemoryBoard(board.words, mode.pairs), `nível ${level}, modo ${mode.id}`).toBe(true);
        expect(board.averageDifficulty).toBeGreaterThanOrEqual(1);
        expect(board.averageDifficulty).toBeLessThanOrEqual(100);
      });
    }
  }, 30_000);

  it('evita repetir as palavras da partida imediatamente anterior', () => {
    const mode = getMemoryDifficulty('hard', { rating: 55, attempts: 5 }, 55);
    const first = selectMemoryWords({
      words,
      targetDifficulty: mode.targetDifficulty,
      count: mode.pairs,
      rng: seeded(101),
    });
    const recent = appendRecentMemoryWords([], first.words);
    const second = selectMemoryWords({
      words,
      targetDifficulty: mode.targetDifficulty,
      count: mode.pairs,
      recentWordKeys: recent,
      rng: seeded(102),
    });
    const firstKeys = new Set(first.words.map(getMemoryWordKey));
    expect(second.words.some(word => firstKeys.has(getMemoryWordKey(word)))).toBe(false);
  });
});

describe('simulação integrada de progressão da memória', () => {
  it('mantém habilidade, histórico, estatísticas e revisões consistentes por 120 partidas', () => {
    let skill = { rating: 25, attempts: 1, perfectGames: 0, streak: 0, bestByMode: {}, recentResults: [] };
    let recent = [];
    let stats = {};
    let reviewQueue = [];

    for (let game = 0; game < 120; game += 1) {
      const modeId = ['easy', 'medium', 'hard'][game % 3];
      const mode = getMemoryDifficulty(modeId, skill, skill.rating);
      const board = selectMemoryWords({
        words: englishWords,
        targetDifficulty: mode.targetDifficulty,
        count: mode.pairs,
        recentWordKeys: recent,
        memoryStats: stats,
        reviewQueue,
        completedGames: game,
        rng: seeded(5000 + game),
      });
      const metrics = Object.fromEntries(board.words.map((_, index) => [index, {
        reveals: game % 5 === 0 && index === 0 ? 6 : 2,
        associationMisses: game % 5 === 0 && index === 0 ? 2 : (index % 4 === 0 ? 1 : 0),
      }]));
      const wordResults = buildMemoryWordResults(board.words, metrics);
      const attempts = mode.pairs + (game % Math.max(2, mode.pairs));
      const result = createMemoryGameResult({
        mode: modeId,
        pairs: mode.pairs,
        attempts,
        difficulty: board.averageDifficulty,
        durationMs: 20_000 + (game * 25),
      });

      skill = updateMemorySkill(skill, result);
      stats = updateMemoryStats(stats, wordResults, game + 1);
      reviewQueue = updateMemoryReviewQueue(reviewQueue, wordResults, game + 1);
      recent = appendRecentMemoryWords(recent, board.words);

      expect(isValidMemoryBoard(board.words, mode.pairs)).toBe(true);
      expect(skill.rating).toBeGreaterThanOrEqual(1);
      expect(skill.rating).toBeLessThanOrEqual(100);
      expect(skill.recentResults.length).toBeLessThanOrEqual(20);
      expect(recent.length).toBeLessThanOrEqual(MEMORY_RECENT_LIMIT);
      expect(reviewQueue.length).toBeLessThanOrEqual(MEMORY_REVIEW_QUEUE_LIMIT);
    }

    expect(skill.attempts).toBe(121);
    expect(Object.keys(skill.bestByMode).sort()).toEqual(['easy', 'hard', 'medium']);
    expect(Object.keys(stats).length).toBeGreaterThan(20);
  }, 30_000);

  it('limita revisões vencidas a aproximadamente 30% do tabuleiro', () => {
    const dueQueue = englishWords.slice(0, 20).map((word, index) => ({
      wordKey: getMemoryWordKey(word),
      stage: 0,
      dueGame: 1,
      wrongCount: 20 - index,
      lastQuality: 20,
    }));

    for (const count of [3, 4, 5, 6, 7, 8, 9, 10]) {
      const board = selectMemoryWords({
        words: englishWords,
        targetDifficulty: 50,
        count,
        reviewQueue: dueQueue,
        completedGames: 2,
        rng: seeded(900 + count),
      });
      const dueKeys = new Set(dueQueue.map(item => item.wordKey));
      const reviewCount = board.words.filter(word => dueKeys.has(getMemoryWordKey(word))).length;
      expect(reviewCount).toBeLessThanOrEqual(Math.max(1, Math.floor(count * 0.3)));
    }
  });
});
