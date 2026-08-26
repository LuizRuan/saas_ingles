import { describe, expect, it } from 'vitest';
import { buildHangmanWordResult } from './hangmanPerformance';
import {
  getDueHangmanReviews,
  HANGMAN_REVIEW_QUEUE_LIMIT,
  updateHangmanReviewQueue,
} from './hangmanReview';

const word = { en: 'Elephant', pt: 'Elefante', category: 'animais' };

describe('revisão espaçada da Forca', () => {
  it('agenda derrota em 1 partida e vitória sofrida em 3', () => {
    const lost = buildHangmanWordResult({ word, won: false, wrongCount: 6, maxWrong: 6 });
    const struggled = buildHangmanWordResult({ word, won: true, wrongCount: 5, maxWrong: 6, hintsUsed: 1 });
    expect(updateHangmanReviewQueue([], lost, 10)[0]).toMatchObject({ stage: 0, dueGame: 11 });
    expect(updateHangmanReviewQueue([], struggled, 10)[0]).toMatchObject({ stage: 1, dueGame: 13 });
  });

  it('avança por 3, 7 e 14 partidas e remove depois da consolidação', () => {
    const good = buildHangmanWordResult({ word, won: true, wrongCount: 0, maxWrong: 6 });
    let queue = [{ wordKey: 'elephant', category: 'animais', stage: 0, dueGame: 1, wrongCount: 1 }];
    queue = updateHangmanReviewQueue(queue, good, 10);
    expect(queue[0]).toMatchObject({ stage: 1, dueGame: 13 });
    queue = updateHangmanReviewQueue(queue, good, 13);
    expect(queue[0]).toMatchObject({ stage: 2, dueGame: 20 });
    queue = updateHangmanReviewQueue(queue, good, 20);
    expect(queue[0]).toMatchObject({ stage: 3, dueGame: 34 });
    queue = updateHangmanReviewQueue(queue, good, 34);
    expect(queue).toEqual([]);
  });

  it('retorna primeiro as revisões mais antigas e mais erradas', () => {
    const due = getDueHangmanReviews([
      { wordKey: 'cat', dueGame: 2, wrongCount: 1 },
      { wordKey: 'dog', dueGame: 1, wrongCount: 2 },
      { wordKey: 'bird', dueGame: 1, wrongCount: 5 },
      { wordKey: 'future', dueGame: 20, wrongCount: 10 },
    ], 10);
    expect(due.map(item => item.wordKey)).toEqual(['bird', 'dog', 'cat']);
  });

  it('limita a fila a 60 palavras', () => {
    let queue = [];
    for (let index = 0; index < 80; index += 1) {
      queue = updateHangmanReviewQueue(queue, {
        ...buildHangmanWordResult({ word: { ...word, en: `Word${String.fromCharCode(65 + (index % 26))}${index < 26 ? 'A' : index < 52 ? 'B' : 'C'}` }, won: false }),
      }, index);
    }
    expect(queue).toHaveLength(HANGMAN_REVIEW_QUEUE_LIMIT);
  });
});
