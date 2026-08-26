import { describe, expect, it } from 'vitest';
import { createMemoryGameResult, getMemoryMedal } from './memoryScoring';

describe('resultado e recompensa da Memória', () => {
  it('classifica ouro, prata e bronze pela eficiência', () => {
    expect(getMemoryMedal(10, 12).id).toBe('gold');
    expect(getMemoryMedal(10, 15).id).toBe('silver');
    expect(getMemoryMedal(10, 16).id).toBe('bronze');
  });

  it('informa tentativas ideais e eficiência real', () => {
    expect(createMemoryGameResult({ pairs: 6, attempts: 12 })).toMatchObject({
      pairs: 6,
      attempts: 12,
      idealAttempts: 6,
      efficiency: 50,
    });
  });

  it('recompensa mais um modo difícil equivalente', () => {
    const easy = createMemoryGameResult({ mode: 'easy', pairs: 6, attempts: 8, difficulty: 40 });
    const hard = createMemoryGameResult({ mode: 'hard', pairs: 6, attempts: 8, difficulty: 40 });
    expect(hard.points).toBeGreaterThan(easy.points);
  });

  it('nunca concede pontos negativos ou valores inválidos', () => {
    const result = createMemoryGameResult({ mode: 'x', pairs: -5, attempts: NaN, difficulty: 999 });
    expect(result.points).toBeGreaterThanOrEqual(30);
    expect(result.difficulty).toBe(100);
    expect(result.efficiency).toBeGreaterThanOrEqual(0);
  });
});

