import { describe, expect, it } from 'vitest';
import { getSentences } from '../data/index';
import { auditSentenceCatalog } from './sentenceAudit';
import { getSentenceStarter, selectSentenceSet } from './sentenceSelection';

const seeded = (initial) => {
  let seed = initial;
  return () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
};

describe('auditoria final do Montar Frases', () => {
  const catalog = getSentences('en-pt');

  it('aprova todos os mínimos editoriais e estruturais', () => {
    const report = auditSentenceCatalog(catalog);
    expect(report.issues).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('mantém sobreposição zero entre partidas consecutivas', () => {
    for (const targetDifficulty of [5, 20, 40, 60, 80, 95]) {
      const first = selectSentenceSet({ sentences: catalog, targetDifficulty, rng: seeded(targetDifficulty) });
      const second = selectSentenceSet({
        sentences: catalog,
        targetDifficulty,
        recentSentenceIds: first.map(item => item.id),
        rng: seeded(targetDifficulty + 100),
      });
      expect(second.filter(item => first.some(previous => previous.id === item.id))).toHaveLength(0);
    }
  });

  it('mantém quatro temas e quatro inícios diferentes em todas as faixas', () => {
    for (const targetDifficulty of [5, 20, 40, 60, 80, 95]) {
      for (let seed = 1; seed <= 20; seed += 1) {
        const game = selectSentenceSet({ sentences: catalog, targetDifficulty, rng: seeded(targetDifficulty + seed) });
        expect(new Set(game.map(item => item.category)).size).toBeGreaterThanOrEqual(4);
        expect(new Set(game.map(getSentenceStarter)).size).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('detecta catálogo degradado em vez de aprová-lo silenciosamente', () => {
    const report = auditSentenceCatalog([{ id: 'x', en: 'Hi.', pt: '', words: [], difficulty: 200 }]);
    expect(report.ok).toBe(false);
    expect(report.issues.length).toBeGreaterThan(0);
  });
});
