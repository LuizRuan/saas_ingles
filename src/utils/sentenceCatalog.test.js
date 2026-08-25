import { describe, expect, it } from 'vitest';
import { getSentences } from '../data/index';
import {
  appendRecentSentenceIds,
  buildSentenceCatalog,
  calibrateSentenceDifficulty,
  normalizeSentenceText,
  pickFreshSentences,
  RECENT_SENTENCE_LIMIT,
} from './sentenceCatalog';

describe('catálogo do Montar Frases', () => {
  it('remove duplicatas normalizadas e gera IDs estáveis', () => {
    const input = [
      { en: 'I am happy.', level: 1 },
      { en: 'I AM HAPPY!', level: 4 },
      { en: 'I am ready.', level: 1 },
    ];
    const first = buildSentenceCatalog(input, 'en-pt');
    const second = buildSentenceCatalog(input, 'en-pt');
    expect(first).toHaveLength(2);
    expect(first.map(item => item.id)).toEqual(second.map(item => item.id));
    expect(normalizeSentenceText('¿Cómo estás?')).toBe('como estas');
  });

  it('os catálogos reais não contêm textos nem IDs duplicados', () => {
    for (const courseId of ['en-pt', 'es-pt']) {
      const catalog = getSentences(courseId);
      expect(new Set(catalog.map(item => normalizeSentenceText(item.en))).size).toBe(catalog.length);
      expect(new Set(catalog.map(item => item.id)).size).toBe(catalog.length);
    }
  });

  it('oferece grande variedade, principalmente no início', () => {
    const catalog = getSentences('en-pt');
    const beginner = catalog.filter(item => item.level <= 2);
    const starters = new Set(beginner.map(item => normalizeSentenceText(item.en).split(' ').slice(0, 2).join(' ')));
    const topics = new Set(beginner.map(item => item.category));
    expect(catalog.length).toBeGreaterThanOrEqual(1000);
    expect(beginner.length).toBeGreaterThanOrEqual(500);
    expect(starters.size).toBeGreaterThanOrEqual(25);
    expect(topics.size).toBeGreaterThanOrEqual(6);
  });

  it('todas as variações podem ser remontadas pelos próprios blocos', () => {
    const catalog = getSentences('en-pt');
    for (const sentence of catalog) {
      expect(normalizeSentenceText(sentence.words.map(word => word.en).join(' '))).toBe(
        normalizeSentenceText(sentence.en),
      );
      expect(sentence.pt.trim().length).toBeGreaterThan(0);
      expect(sentence.grammar.trim().length).toBeGreaterThan(0);
    }
  });

  it('calibra todo o catálogo em uma escala ampla de 1 a 100', () => {
    const catalog = getSentences('en-pt');
    const beginner = catalog.filter(item => item.difficulty <= 20);
    const advanced = catalog.filter(item => item.difficulty >= 85);
    expect(catalog.every(item => Number.isInteger(item.difficulty) && item.difficulty >= 1 && item.difficulty <= 100)).toBe(true);
    expect(beginner.length).toBeGreaterThanOrEqual(300);
    expect(advanced.length).toBeGreaterThanOrEqual(80);
    expect(calibrateSentenceDifficulty({ en: 'I am ready.', level: 1 })).toBeLessThan(
      calibrateSentenceDifficulty({ en: 'If I had known, I would have changed it.', level: 7 }),
    );
  });

  it('não seleciona frases do histórico recente quando há alternativas', () => {
    const catalog = buildSentenceCatalog(
      Array.from({ length: 20 }, (_, index) => ({ en: `Sentence ${index}.`, level: 1 })),
      'en-pt',
    );
    const recent = catalog.slice(0, 10).map(item => item.id);
    const selected = pickFreshSentences(catalog, 1, 100, 5, recent, () => 0.5);
    expect(selected).toHaveLength(5);
    expect(selected.every(item => !recent.includes(item.id))).toBe(true);
  });

  it('mantém somente os IDs recentes dentro do limite', () => {
    const ids = Array.from({ length: RECENT_SENTENCE_LIMIT + 10 }, (_, index) => `s-${index}`);
    expect(appendRecentSentenceIds([], ids)).toEqual(ids.slice(-RECENT_SENTENCE_LIMIT));
  });
});
