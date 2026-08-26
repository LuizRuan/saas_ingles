import { describe, expect, it } from 'vitest';
import {
  createWordBuilderSlots,
  getWordBuilderTarget,
  getWordBuilderTokens,
  isWordBuilderAnswerCorrect,
  makeWordBuilderTiles,
} from './wordBuilderCharacters';

const fixedRng = (...values) => {
  let index = 0;
  return () => values[index++] ?? 0;
};

describe('tokenização Unicode do Montar Palavras', () => {
  it('preserva acentos e Ñ como letras completas', () => {
    expect(getWordBuilderTarget('Adiós')).toBe('ADIÓS');
    expect(getWordBuilderTokens('Araña').filter(token => token.isLetter).map(token => token.character)).toEqual(['A', 'R', 'A', 'Ñ', 'A']);
  });

  it('transforma hífen, apóstrofo e pontuação em posições literais fixas', () => {
    const hyphen = createWordBuilderSlots({ en: 'T-shirt' });
    const question = createWordBuilderSlots({ en: 'What?' });
    expect(hyphen[1]).toMatchObject({ letter: '-', literal: true });
    expect(question.at(-1)).toMatchObject({ letter: '?', literal: true });
    expect(makeWordBuilderTiles({ en: "Chef's" }).map(tile => tile.letter)).not.toContain("'");
  });

  it('compara a resposta preservando os caracteres fixos', () => {
    const word = { en: 'X-ray' };
    const slots = createWordBuilderSlots(word);
    ['X', 'R', 'A', 'Y'].forEach((letter, index) => {
      const slotIndex = [0, 2, 3, 4][index];
      slots[slotIndex] = { letter, id: `test-${index}` };
    });
    expect(isWordBuilderAnswerCorrect(word, slots)).toBe(true);
  });
});

describe('peças embaralhadas', () => {
  it('gera uma peça por letra, com IDs únicos e sem pontuação', () => {
    const tiles = makeWordBuilderTiles({ en: 'Adiós?' }, fixedRng(0.2, 0.4, 0.6, 0.8));
    expect(tiles).toHaveLength(5);
    expect(new Set(tiles.map(tile => tile.id)).size).toBe(5);
    expect(tiles.map(tile => tile.letter)).not.toContain('?');
  });

  it('não deixa uma palavra embaralhável já montada', () => {
    const tiles = makeWordBuilderTiles({ en: 'Llave' }, () => 0.999999);
    expect(tiles.map(tile => tile.letter).join('')).not.toBe('LLAVE');
  });
});
