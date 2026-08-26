import { describe, expect, it } from 'vitest';
import { addWordBuilderDistractors, getAllWordBuilderModes, getWordBuilderMode } from './wordBuilderModes';

describe('modos do Montar Palavras', () => {
  it('mantém Fácil < Médio < Difícil nos 100 níveis', () => {
    for (let level = 1; level <= 100; level += 1) {
      const modes = getAllWordBuilderModes({ rating: level, attempts: 1 }, level);
      expect(modes[0].targetDifficulty).toBeLessThan(modes[1].targetDifficulty);
      expect(modes[1].targetDifficulty).toBeLessThan(modes[2].targetDifficulty);
    }
  });

  it('diferencia tamanho, tentativas, ajuda e distrações', () => {
    const [easy, medium, hard] = getAllWordBuilderModes({ rating: 50, attempts: 1 }, 50);
    expect(easy.maxAttempts).toBeGreaterThan(medium.maxAttempts);
    expect(easy.freeLetters).toBe(1);
    expect(medium.freeLetters).toBe(0);
    expect(hard.maxLetters).toBeGreaterThan(medium.maxLetters);
    expect(hard.distractorLetters).toBe(2);
  });

  it('adiciona distrações que não fazem parte da palavra', () => {
    const tiles = [{ letter: 'C', id: 'c' }, { letter: 'A', id: 'a' }, { letter: 'T', id: 't' }];
    const withExtras = addWordBuilderDistractors(tiles, { en: 'Cat' }, 2, 'en-pt', () => 0);
    expect(withExtras).toHaveLength(5);
    expect(withExtras.filter(tile => tile.distractor)).toHaveLength(2);
    expect(withExtras.filter(tile => tile.distractor).every(tile => !'CAT'.includes(tile.letter))).toBe(true);
  });

  it('usa Médio como fallback para modo inválido', () => {
    expect(getWordBuilderMode('inexistente', null, 1).id).toBe('medium');
  });
});
