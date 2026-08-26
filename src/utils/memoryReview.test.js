import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { getMemoryWordKey } from './memoryAudit';
import { selectMemoryWords } from './memorySelection';
import {
  getDueMemoryReviews,
  MEMORY_REVIEW_DELAYS,
  updateMemoryReviewQueue,
} from './memoryReview';

const result = (key, quality, needsReview = quality < 0.65) => ({ key, quality, needsReview });

describe('revisão espaçada da Memória', () => {
  it('agenda uma dificuldade para a partida seguinte', () => {
    const queue = updateMemoryReviewQueue([], [result('cat', 0.3)], 10);
    expect(queue).toEqual([{
      wordKey: 'cat', stage: 0, dueGame: 11, wrongCount: 1, lastQuality: 30,
    }]);
    expect(getDueMemoryReviews(queue, 10)).toEqual([]);
    expect(getDueMemoryReviews(queue, 11)).toHaveLength(1);
  });

  it('avança por 1, 3, 7 e 14 partidas e depois remove', () => {
    let queue = updateMemoryReviewQueue([], [result('cat', 0.2)], 0);
    for (let stage = 1; stage < MEMORY_REVIEW_DELAYS.length; stage += 1) {
      const currentGame = queue[0].dueGame;
      queue = updateMemoryReviewQueue(queue, [result('cat', 1, false)], currentGame);
      expect(queue[0].stage).toBe(stage);
      expect(queue[0].dueGame).toBe(currentGame + MEMORY_REVIEW_DELAYS[stage]);
    }
    queue = updateMemoryReviewQueue(queue, [result('cat', 1, false)], queue[0].dueGame);
    expect(queue).toEqual([]);
  });

  it('um novo desempenho ruim reinicia o ciclo e aumenta a recorrência', () => {
    const old = [{ wordKey: 'cat', stage: 2, dueGame: 10, wrongCount: 2, lastQuality: 90 }];
    const queue = updateMemoryReviewQueue(old, [result('cat', 0.1)], 10);
    expect(queue[0]).toMatchObject({ stage: 0, dueGame: 11, wrongCount: 3 });
  });

  it('uma revisão vencida entra mesmo estando no histórico recente', () => {
    const reviewWord = englishWords[0];
    const key = getMemoryWordKey(reviewWord);
    const selected = selectMemoryWords({
      words: englishWords,
      targetDifficulty: 70,
      count: 10,
      recentWordKeys: [key],
      reviewQueue: [{ wordKey: key, stage: 0, dueGame: 2, wrongCount: 3 }],
      completedGames: 2,
    });
    expect(selected.words.map(getMemoryWordKey)).toContain(key);
  });
});

