import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { isRateLimited, resetRateLimiter, sweepRateLimiter } from './rateLimiter.js';

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

// REGRESSÃO de vazamento: o Map só crescia. Chaves são por socket.id (uma nova
// a cada conexão), então num processo de longa duração isso acumulava para
// sempre — o filtro interno só limpa chave que volta a ser tocada.
// `isRateLimited` grava com Date.now() real, então o relógio precisa ser
// controlado de verdade aqui — passar um `now` inventado só para o sweep
// compara timestamps de épocas diferentes.
describe('sweepRateLimiter', () => {
  it('despeja chaves cuja janela expirou', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    isRateLimited('velha', { windowMs: 1000, max: 5 });

    expect(sweepRateLimiter(1000, Date.now() + 5000)).toBe(0);
  });

  it('mantém chave ainda dentro da janela', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    isRateLimited('nova', { windowMs: 60_000, max: 5 });

    expect(sweepRateLimiter(60_000, Date.now() + 100)).toBe(1);
  });

  it('não deixa chave morta acumulada depois de muitas conexões', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    for (let i = 0; i < 500; i++) {
      isRateLimited(`answer:socket-${i}`, { windowMs: 1000, max: 5 });
    }

    expect(sweepRateLimiter(1000, Date.now() + 10_000)).toBe(0);
  });
});
