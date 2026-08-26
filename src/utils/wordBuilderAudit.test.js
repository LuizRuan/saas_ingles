import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import {
  auditWordBuilderCatalog,
  getWordBuilderExclusionReason,
  getWordBuilderLetterCount,
  isWordBuilderPlayable,
} from './wordBuilderAudit';

describe.each([
  ['inglês', englishWords, 1500],
  ['espanhol', spanishWords, 300],
])('auditoria do Montar Palavras — %s', (_course, words, minimumPlayable) => {
  it('oferece um catálogo amplo, único e válido', () => {
    const audit = auditWordBuilderCatalog(words);
    expect(audit.playable).toBeGreaterThanOrEqual(minimumPlayable);
    expect(audit.duplicateKeys).toEqual([]);
    expect(audit.playableWords.every(isWordBuilderPlayable)).toBe(true);
  });

  it('tem palavras suficientes em diferentes tamanhos para sessões variadas', () => {
    const audit = auditWordBuilderCatalog(words);
    expect(Object.keys(audit.lengthCounts).length).toBeGreaterThanOrEqual(8);
    expect(audit.playableWords.filter(word => getWordBuilderLetterCount(word.en) <= 5).length).toBeGreaterThan(40);
    expect(audit.playableWords.filter(word => getWordBuilderLetterCount(word.en) >= 9).length).toBeGreaterThanOrEqual(12);
  });
});

describe('regras de entrada do Montar Palavras', () => {
  it('aceita acentos, Ñ, hífen, apóstrofo e pontuação terminal', () => {
    for (const en of ['Adiós', 'Araña', 'T-shirt', "Chef's", 'What?']) {
      expect(isWordBuilderPlayable({ en, pt: 'teste' })).toBe(true);
    }
  });

  it('explica por que uma entrada não pode ser usada', () => {
    expect(getWordBuilderExclusionReason({ en: 'Good morning', pt: 'Bom dia' })).toBe('multiple-words');
    expect(getWordBuilderExclusionReason({ en: 'TV', pt: 'TV' })).toBe('too-short');
    expect(getWordBuilderExclusionReason({ en: 'A'.repeat(15), pt: 'Longa' })).toBe('too-long');
    expect(getWordBuilderExclusionReason({ en: 'Word2', pt: 'Palavra' })).toBe('unsupported-character');
  });
});
