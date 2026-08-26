import { describe, expect, it } from 'vitest';
import { appendRecentHangmanWords, HANGMAN_RECENT_LIMIT } from './hangmanRecent';

describe('histórico recente da Forca', () => {
  it('guarda chaves canônicas sem duplicar', () => {
    const recent = appendRecentHangmanWords(['cat'], [{ en: 'Dog' }, { en: 'Cat' }]);
    expect(recent).toEqual(['dog', 'cat']);
  });

  it('mantém somente as 40 palavras mais recentes', () => {
    const recent = appendRecentHangmanWords([], Array.from({ length: 55 }, (_, index) => ({ en: `Word${index}` })));
    expect(recent).toHaveLength(HANGMAN_RECENT_LIMIT);
    expect(recent[0]).toBe('word15');
  });
});

