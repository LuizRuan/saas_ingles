import { describe, expect, it } from 'vitest';
import { buildWordBuilderWordResult } from './wordBuilderPerformance';
import {
  getDueWordBuilderReviews,
  updateWordBuilderReviewQueue,
  WORD_BUILDER_REVIEW_QUEUE_LIMIT,
} from './wordBuilderReview';

const word = { en: 'Apple', pt: 'Maçã' };

describe('revisão espaçada do Montar Palavras', () => {
  it('agenda erro em 1 partida e acerto sofrido em 3', () => {
    const lost = buildWordBuilderWordResult({ word, won: false, attempts: 3, maxAttempts: 3 });
    const struggled = buildWordBuilderWordResult({ word, won: true, attempts: 3, maxAttempts: 3, moves: 12, hintsUsed: 2 });
    expect(updateWordBuilderReviewQueue([], [lost], 10)[0]).toMatchObject({ stage: 0, dueGame: 11 });
    expect(updateWordBuilderReviewQueue([], [struggled], 10)[0]).toMatchObject({ stage: 1, dueGame: 13 });
  });

  it('avança por 3, 7 e 14 partidas até consolidar', () => {
    const good = buildWordBuilderWordResult({ word, won: true, attempts: 1, maxAttempts: 3, moves: 5 });
    let queue = [{ wordKey: 'apple', stage: 0, dueGame: 1, wrongCount: 1 }];
    queue = updateWordBuilderReviewQueue(queue, [good], 10);
    expect(queue[0]).toMatchObject({ stage: 1, dueGame: 13 });
    queue = updateWordBuilderReviewQueue(queue, [good], 13);
    expect(queue[0]).toMatchObject({ stage: 2, dueGame: 20 });
    queue = updateWordBuilderReviewQueue(queue, [good], 20);
    expect(queue[0]).toMatchObject({ stage: 3, dueGame: 34 });
    expect(updateWordBuilderReviewQueue(queue, [good], 34)).toEqual([]);
  });

  it('prioriza vencidas e mais erradas e limita a fila', () => {
    const due = getDueWordBuilderReviews([
      { wordKey: 'cat', dueGame: 2, wrongCount: 1 },
      { wordKey: 'dog', dueGame: 1, wrongCount: 2 },
      { wordKey: 'bird', dueGame: 1, wrongCount: 5 },
    ], 10);
    expect(due.map(item => item.wordKey)).toEqual(['bird', 'dog', 'cat']);

    const results = Array.from({ length: 80 }, (_, index) => ({
      ...buildWordBuilderWordResult({ word: { en: `Word${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + Math.floor(index / 26))}` }, won: false }),
    }));
    expect(updateWordBuilderReviewQueue([], results, 0)).toHaveLength(WORD_BUILDER_REVIEW_QUEUE_LIMIT);
  });
});
