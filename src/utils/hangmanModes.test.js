import { describe, expect, it } from 'vitest';
import { getAllHangmanModes, getHangmanMode } from './hangmanModes';

describe('modos da Forca', () => {
  it('mantém Fácil < Médio < Difícil nos 100 níveis', () => {
    for (let level = 1; level <= 100; level += 1) {
      const modes = getAllHangmanModes({ rating: level, attempts: 1 }, level);
      expect(modes[0].targetDifficulty).toBeLessThan(modes[1].targetDifficulty);
      expect(modes[1].targetDifficulty).toBeLessThan(modes[2].targetDifficulty);
    }
  });

  it('reduz chances conforme o modo fica mais difícil', () => {
    const [easy, medium, hard] = getAllHangmanModes({ rating: 50, attempts: 1 }, 50);
    expect(easy.maxWrong).toBeGreaterThan(medium.maxWrong);
    expect(medium.maxWrong).toBeGreaterThan(hard.maxWrong);
    expect(easy.freeLetters).toBe(1);
    expect(hard.freeLetters).toBe(0);
  });

  it('usa a habilidade própria e mistura uma parcela do nível geral', () => {
    const low = getHangmanMode('medium', { rating: 10, attempts: 5 }, 80);
    const high = getHangmanMode('medium', { rating: 80, attempts: 5 }, 10);
    expect(low.hangmanRating).toBe(10);
    expect(high.targetDifficulty).toBeGreaterThan(low.targetDifficulty);
  });

  it('usa Médio como fallback para modo inválido', () => {
    expect(getHangmanMode('inexistente', null, 1).id).toBe('medium');
  });
});
