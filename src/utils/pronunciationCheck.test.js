import { describe, it, expect } from 'vitest';
import { normalizeText, evaluatePronunciation } from './pronunciationCheck';

describe('pronunciationCheck utils', () => {
  it('should normalize text by stripping punctuation and lowercasing', () => {
    expect(normalizeText('Hello, World!')).toBe('hello world');
    expect(normalizeText('¡Buenos días!')).toBe('buenos dias');
  });

  it('should evaluate exact pronunciation match as 100% excellent', () => {
    const res = evaluatePronunciation('Hello how are you', 'Hello, how are you?');
    expect(res.score).toBe(100);
    expect(res.badge).toBe('excellent');
    expect(res.wordResults.every(w => w.status === 'correct')).toBe(true);
  });

  it('should evaluate partial pronunciation match correctly', () => {
    const res = evaluatePronunciation('Hello how', 'Hello, how are you?');
    expect(res.score).toBe(50);
    expect(res.badge).toBe('need_practice');
  });

  it('should handle empty transcript gracefully', () => {
    const res = evaluatePronunciation('', 'Hello world');
    expect(res.score).toBe(0);
    expect(res.wordResults.every(w => w.status === 'missing')).toBe(true);
  });
});
