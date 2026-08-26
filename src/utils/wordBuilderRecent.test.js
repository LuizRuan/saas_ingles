import { describe, expect, it } from 'vitest';
import { appendRecentWordBuilderWords, WORD_BUILDER_RECENT_LIMIT } from './wordBuilderRecent';

describe('histórico recente do Montar Palavras', () => {
  it('normaliza, move repetidas para o fim e não duplica', () => {
    expect(appendRecentWordBuilderWords(['cat', 'dog'], [{ en: 'Cat' }, { en: 'Bird' }]))
      .toEqual(['dog', 'cat', 'bird']);
  });

  it('mantém somente as 40 palavras mais recentes', () => {
    const words = Array.from({ length: 50 }, (_, index) => `word-${index}`);
    const result = appendRecentWordBuilderWords([], words);
    expect(result).toHaveLength(WORD_BUILDER_RECENT_LIMIT);
    expect(result[0]).toBe('word-10');
  });
});

