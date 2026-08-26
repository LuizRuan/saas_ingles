import { describe, expect, it } from 'vitest';
import {
  buildMemoryWordResults,
  calculateMemoryRecallQuality,
  updateMemoryStats,
} from './memoryPerformance';

describe('desempenho por palavra na Memória', () => {
  it('diferencia lembrança perfeita de palavra encontrada com muitos erros', () => {
    expect(calculateMemoryRecallQuality({ reveals: 2, associationMisses: 0 })).toBe(1);
    expect(calculateMemoryRecallQuality({ reveals: 8, associationMisses: 3 })).toBeLessThan(0.3);
  });

  it('marca para revisão somente associações abaixo da qualidade mínima', () => {
    const words = [{ en: 'Cat', pt: 'Gato' }, { en: 'Dog', pt: 'Cachorro' }];
    const results = buildMemoryWordResults(words, {
      0: { reveals: 2, associationMisses: 0 },
      1: { reveals: 7, associationMisses: 2 },
    });
    expect(results[0]).toMatchObject({ key: 'cat', quality: 1, needsReview: false });
    expect(results[1].needsReview).toBe(true);
  });

  it('acumula estatísticas sem modificar o objeto anterior', () => {
    const current = { cat: { matches: 2, associationMisses: 1, reveals: 5, bestRecall: 90 } };
    const [result] = buildMemoryWordResults([{ en: 'Cat', pt: 'Gato' }], {
      0: { reveals: 2, associationMisses: 0 },
    });
    const next = updateMemoryStats(current, [result], 1234);
    expect(next.cat).toEqual({
      matches: 3,
      associationMisses: 1,
      reveals: 7,
      bestRecall: 100,
      lastQuality: 100,
      lastSeen: 1234,
    });
    expect(current.cat.matches).toBe(2);
  });
});

