import { describe, expect, it } from 'vitest';
import { buildHangmanWordResult, updateHangmanStats } from './hangmanPerformance';

const word = { en: 'Elephant', pt: 'Elefante' };

describe('resultado por palavra da Forca', () => {
  it('distingue vitória perfeita, vitória sofrida e derrota', () => {
    const perfect = buildHangmanWordResult({ word, won: true, maxWrong: 6 });
    const struggled = buildHangmanWordResult({ word, won: true, wrongCount: 5, maxWrong: 6, hintsUsed: 1 });
    const lost = buildHangmanWordResult({ word, won: false, wrongCount: 6, maxWrong: 6 });
    expect(perfect.performance).toBe(100);
    expect(perfect.needsReview).toBe(false);
    expect(struggled.performance).toBeLessThan(65);
    expect(struggled.needsReview).toBe(true);
    expect(lost.performance).toBe(0);
    expect(lost.needsReview).toBe(true);
  });

  it('remove letras erradas duplicadas e calcula tentativas restantes', () => {
    const result = buildHangmanWordResult({ word, won: true, wrongGuesses: ['q', 'Q', 'z'], wrongCount: 2, maxWrong: 6 });
    expect(result.wrongGuesses).toEqual(['Q', 'Z']);
    expect(result.remainingAttempts).toBe(4);
  });
});

describe('estatísticas persistentes da Forca', () => {
  it('acumula vitórias, derrotas, erros e assistência', () => {
    let stats = updateHangmanStats({}, buildHangmanWordResult({ word, won: false, wrongCount: 6, maxWrong: 6 }), 100);
    stats = updateHangmanStats(stats, buildHangmanWordResult({ word, won: true, wrongCount: 1, maxWrong: 6, hintsUsed: 1, translationUsed: true }), 200);
    expect(stats.elephant).toMatchObject({
      games: 2,
      wins: 1,
      losses: 1,
      wrongLetters: 7,
      hintsUsed: 1,
      translationsUsed: 1,
      bestRemainingAttempts: 5,
      lastResult: 'won',
      lastSeen: 200,
    });
  });
});
