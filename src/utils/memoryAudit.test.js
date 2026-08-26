import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { auditMemoryBoard, auditMemoryCatalog, isValidMemoryBoard } from './memoryAudit';

describe.each([
  ['inglês', englishWords],
  ['espanhol', spanishWords],
])('auditoria do catálogo de memória — %s', (_course, words) => {
  it('possui termos únicos e todos os campos necessários', () => {
    const report = auditMemoryCatalog(words);
    expect(report.total).toBeGreaterThan(100);
    expect(report.invalid).toEqual([]);
    expect(report.duplicateKeys).toEqual([]);
  });
});

describe('auditoria de uma partida', () => {
  const valid = [
    { en: 'Cat', pt: 'Gato', level: 1 },
    { en: 'Dog', pt: 'Cachorro', level: 1 },
    { en: 'Bird', pt: 'Pássaro', level: 1 },
  ];

  it('aceita uma partida completa sem textos ambíguos', () => {
    expect(isValidMemoryBoard(valid, 3)).toBe(true);
  });

  it('detecta palavra repetida, tradução ambígua e quantidade incompleta', () => {
    const report = auditMemoryBoard([
      valid[0],
      { en: 'Kitten', pt: 'Gato', level: 2 },
      valid[0],
    ], 4);
    expect(report.complete).toBe(false);
    expect(report.duplicateWords).toEqual(['cat']);
    expect(report.ambiguousSourceTexts).toEqual(['gato']);
  });
});

