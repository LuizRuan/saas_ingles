import { describe, expect, it } from 'vitest';
import { getAllMemoryDifficulties, getMemoryDifficulty } from './memoryDifficulty';

describe('dificuldades do Jogo da Memória', () => {
  it.each([1, 10, 25, 50, 75, 100])('mantém Fácil < Médio < Difícil no nível %i', (level) => {
    const [easy, medium, hard] = getAllMemoryDifficulties({ rating: level, attempts: 1 }, level);
    expect(easy.targetDifficulty).toBeLessThan(medium.targetDifficulty);
    expect(medium.targetDifficulty).toBeLessThan(hard.targetDifficulty);
    expect(easy.pairs).toBeLessThan(medium.pairs);
    expect(medium.pairs).toBeLessThan(hard.pairs);
  });

  it('escala pares e alvo conforme a habilidade evolui', () => {
    const beginner = getMemoryDifficulty('hard', { rating: 1, attempts: 1 }, 1);
    const expert = getMemoryDifficulty('hard', { rating: 100, attempts: 1 }, 100);
    expect(beginner.pairs).toBe(8);
    expect(expert.pairs).toBe(10);
    expect(beginner.targetDifficulty).toBe(20);
    expect(expert.targetDifficulty).toBe(100);
  });

  it('oferece mais ajuda visual no Fácil e menos no Difícil', () => {
    const [easy, medium, hard] = getAllMemoryDifficulties(null, 30);
    expect(easy.previewMs).toBeGreaterThan(medium.previewMs);
    expect(medium.previewMs).toBeGreaterThan(hard.previewMs);
    expect(easy.mismatchMs).toBeGreaterThan(medium.mismatchMs);
    expect(medium.mismatchMs).toBeGreaterThan(hard.mismatchMs);
  });
});

