import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { isRateLimited, resetRateLimiter } from './rateLimiter.js';

beforeEach(() => resetRateLimiter());
afterEach(() => vi.useRealTimers());

describe('isRateLimited', () => {
  it('permite até o limite dentro da janela', () => {
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited('k1', { windowMs: 1000, max: 5 })).toBe(false);
    }
  });

  it('bloqueia ao ultrapassar o limite', () => {
    for (let i = 0; i < 5; i++) isRateLimited('k2', { windowMs: 1000, max: 5 });
    expect(isRateLimited('k2', { windowMs: 1000, max: 5 })).toBe(true);
  });

  it('chaves diferentes não interferem entre si', () => {
    for (let i = 0; i < 5; i++) isRateLimited('a', { windowMs: 1000, max: 5 });
    expect(isRateLimited('b', { windowMs: 1000, max: 5 })).toBe(false);
  });

  it('libera de novo depois que a janela desliza', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) isRateLimited('k3', { windowMs: 1000, max: 5 });
    expect(isRateLimited('k3', { windowMs: 1000, max: 5 })).toBe(true);

    vi.advanceTimersByTime(1100);
    expect(isRateLimited('k3', { windowMs: 1000, max: 5 })).toBe(false);
  });
});
