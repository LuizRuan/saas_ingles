import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import {
  auditHangmanCatalog,
  getHangmanExclusionReason,
  getHangmanWordKey,
  isHangmanPlayable,
} from './hangmanAudit';

describe.each([
  ['inglês', englishWords, 400],
  ['espanhol', spanishWords, 190],
])('auditoria do catálogo da Forca — %s', (_course, words, minimumPlayable) => {
  it('tem um catálogo jogável amplo, único e distribuído', () => {
    const audit = auditHangmanCatalog(words);
    expect(audit.playable).toBeGreaterThanOrEqual(minimumPlayable);
    expect(audit.duplicateKeys).toEqual([]);
    expect(Object.values(audit.categoryCounts).filter(count => count > 0).length).toBe(11);
    expect(Math.min(...Object.values(audit.categoryCounts))).toBeGreaterThanOrEqual(9);
  });

  it('não aceita nenhuma palavra jogável sem tradução ou com caractere impossível', () => {
    const audit = auditHangmanCatalog(words);
    expect(audit.playableWords.every(word => isHangmanPlayable(word))).toBe(true);
    expect(audit.playableWords.every(word => getHangmanWordKey(word).length >= 3)).toBe(true);
  });
});

describe('regras de entrada da Forca', () => {
  it('aceita acentos, Ñ, hífen e apóstrofo', () => {
    for (const en of ['Adiós', 'Araña', 'Fiancé', 'T-shirt', "Chef's"]) {
      expect(isHangmanPlayable({ en, pt: 'teste', category: 'comidas' })).toBe(true);
    }
  });

  it('explica por que uma entrada foi excluída', () => {
    expect(getHangmanExclusionReason({ en: 'Good morning', pt: 'Bom dia', category: 'cumprimentos' })).toBe('multiple-words');
    expect(getHangmanExclusionReason({ en: 'TV', pt: 'TV', category: 'casa' })).toBe('too-short');
    expect(getHangmanExclusionReason({ en: 'Word2', pt: 'Palavra', category: 'escola' })).toBe('unsupported-character');
    expect(getHangmanExclusionReason({ en: 'Dog', pt: '', category: 'animais' })).toBe('missing-text');
  });
});
