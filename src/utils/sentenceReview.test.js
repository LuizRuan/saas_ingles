import { describe, expect, it } from 'vitest';
import { getDueSentenceReviews, SENTENCE_REVIEW_DELAY_GAMES, updateSentenceReviewQueue } from './sentenceReview';

describe('revisão inteligente de frases', () => {
  const sentence = { id: 's-1', category: 'questions', difficulty: 25 };

  it('agenda um erro sem permitir retorno na partida seguinte', () => {
    const queue = updateSentenceReviewQueue([], sentence, false, 4);
    expect(queue[0].dueGame).toBe(4 + SENTENCE_REVIEW_DELAY_GAMES);
    expect(getDueSentenceReviews(queue, 5)).toHaveLength(0);
    expect(getDueSentenceReviews(queue, 6)).toHaveLength(1);
  });

  it('remove a pendência quando a frase é acertada', () => {
    const queue = updateSentenceReviewQueue([], sentence, false, 4);
    expect(updateSentenceReviewQueue(queue, sentence, true, 6)).toEqual([]);
  });

  it('não duplica a mesma frase e acumula reincidências', () => {
    let queue = updateSentenceReviewQueue([], sentence, false, 1);
    queue = updateSentenceReviewQueue(queue, sentence, false, 3);
    expect(queue).toHaveLength(1);
    expect(queue[0].wrongCount).toBe(2);
  });
});
