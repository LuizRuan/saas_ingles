import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { appendRecentMemoryWords, MEMORY_RECENT_LIMIT } from './memoryRecent';
import { selectMemoryWords } from './memorySelection';

describe('histórico recente do Jogo da Memória', () => {
  it('remove duplicatas, mantém a ordem recente e limita em 40', () => {
    const original = Array.from({ length: 45 }, (_, index) => `word ${index}`);
    const result = appendRecentMemoryWords(original, ['word 10', 'new word']);
    expect(result).toHaveLength(MEMORY_RECENT_LIMIT);
    expect(result.at(-2)).toBe('word 10');
    expect(result.at(-1)).toBe('new word');
    expect(result.filter(key => key === 'word 10')).toHaveLength(1);
  });

  it('a partida seguinte não repete nenhuma palavra da anterior', () => {
    const first = selectMemoryWords({ words: englishWords, targetDifficulty: 50, count: 10 });
    const recent = appendRecentMemoryWords([], first.words);
    const second = selectMemoryWords({
      words: englishWords,
      targetDifficulty: 50,
      count: 10,
      recentWordKeys: recent,
    });
    const secondKeys = new Set(appendRecentMemoryWords([], second.words));
    expect(recent.filter(key => secondKeys.has(key))).toEqual([]);
  });
});

