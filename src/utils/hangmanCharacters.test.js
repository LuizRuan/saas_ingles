import { describe, expect, it } from 'vitest';
import {
  doesHangmanGuessMatch,
  getHangmanAlphabet,
  getHangmanGuessKey,
  getHangmanWordTokens,
  getUnrevealedHangmanLetters,
  isHangmanWordSolved,
} from './hangmanCharacters';

describe('alfabeto da Forca por curso', () => {
  it('usa A–Z no inglês e inclui Ñ no espanhol', () => {
    expect(getHangmanAlphabet('en-pt')).toHaveLength(26);
    expect(getHangmanAlphabet('en-pt')).not.toContain('Ñ');
    expect(getHangmanAlphabet('es-pt')).toHaveLength(27);
    expect(getHangmanAlphabet('es-pt')).toContain('Ñ');
  });

  it('associa vogais acentuadas à tecla base sem transformar Ñ em N', () => {
    expect(getHangmanGuessKey('Á', 'es-pt')).toBe('A');
    expect(getHangmanGuessKey('é', 'en-pt')).toBe('E');
    expect(getHangmanGuessKey('Ñ', 'es-pt')).toBe('Ñ');
  });
});

describe('resolução Unicode de palavras', () => {
  it('exige A para revelar Á e Ñ para revelar Ñ', () => {
    expect(doesHangmanGuessMatch('Pájaro', 'A', 'es-pt')).toBe(true);
    expect(isHangmanWordSolved('Araña', ['A', 'R', 'Ñ'], 'es-pt')).toBe(true);
    expect(isHangmanWordSolved('Araña', ['A', 'R', 'N'], 'es-pt')).toBe(false);
  });

  it('revela hífen e apóstrofo sem exigir teclas inexistentes', () => {
    expect(isHangmanWordSolved('T-shirt', ['T', 'S', 'H', 'I', 'R'], 'en-pt')).toBe(true);
    expect(isHangmanWordSolved("Chef's", ['C', 'H', 'E', 'F', 'S'], 'en-pt')).toBe(true);
    expect(getHangmanWordTokens('T-shirt').find(token => token.character === '-').isLetter).toBe(false);
  });

  it('lista apenas letras ainda necessárias, sem duplicatas', () => {
    expect(getUnrevealedHangmanLetters('Adiós', ['A', 'D'], 'es-pt')).toEqual(['I', 'O', 'S']);
  });
});
