import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { getAllMemoryDifficulties } from './memoryDifficulty';
import { isValidMemoryBoard } from './memoryAudit';
import { selectMemoryWords } from './memorySelection';

const seeded = (initial) => {
  let seed = initial >>> 0;
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
};

describe.each([
  ['inglês', englishWords],
  ['espanhol', spanishWords],
])('seleção adaptativa — %s', (_course, words) => {
  it.each([1, 25, 50, 75, 100])('monta os três modos completos no nível %i', (level) => {
    getAllMemoryDifficulties({ rating: level, attempts: 1 }, level).forEach((mode, index) => {
      const result = selectMemoryWords({
        words,
        targetDifficulty: mode.targetDifficulty,
        count: mode.pairs,
        rng: seeded((level * 10) + index),
      });
      expect(result.words).toHaveLength(mode.pairs);
      expect(isValidMemoryBoard(result.words, mode.pairs)).toBe(true);
    });
  });

  it('produz vocabulário progressivamente mais difícil entre os modos', () => {
    for (const level of [1, 25, 50, 75, 100]) {
      const averages = getAllMemoryDifficulties({ rating: level, attempts: 1 }, level).map((mode, modeIndex) => {
        let total = 0;
        for (let seed = 1; seed <= 12; seed += 1) {
          total += selectMemoryWords({
            words,
            targetDifficulty: mode.targetDifficulty,
            count: mode.pairs,
            rng: seeded(seed + (modeIndex * 1000)),
          }).averageDifficulty;
        }
        return total / 12;
      });
      expect(averages[0]).toBeLessThan(averages[1]);
      expect(averages[1]).toBeLessThan(averages[2]);
    }
  }, 30_000);
});

describe('prioridade adaptativa', () => {
  it('puxa uma palavra problemática para o espaço de reforço', () => {
    const pool = Array.from({ length: 50 }, (_, index) => ({
      en: `Word ${index}`,
      pt: `Palavra ${index}`,
      level: index + 1,
    }));
    const result = selectMemoryWords({
      words: pool,
      targetDifficulty: 50,
      count: 10,
      memoryStats: { 'word 1': { associationMisses: 20, matches: 0 } },
      rng: seeded(9),
    });
    expect(result.words.map(word => word.en)).toContain('Word 1');
  });
});
