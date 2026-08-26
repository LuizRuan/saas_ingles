import { describe, expect, it } from 'vitest';
import { getWordBuilderKey } from './wordBuilderAudit';
import { hasImmediateWordBuilderRepeat, selectWordBuilderWords } from './wordBuilderSelection';

const words = Array.from({ length: 30 }, (_, index) => ({
  en: `${String.fromCharCode(65 + (index % 20))}word${String.fromCharCode(65 + ((index + 7) % 20))}`,
  pt: `palavra ${index}`,
  level: index + 1,
}));
const mode = { rounds: 8, minLetters: 3, maxLetters: 14, targetDifficulty: 50 };

describe('seleção adaptativa do Montar Palavras', () => {
  it('forma uma sessão completa, única e jogável', () => {
    const result = selectWordBuilderWords({ words, mode, rng: () => 0.4 });
    expect(result.words).toHaveLength(8);
    expect(new Set(result.words.map(getWordBuilderKey)).size).toBe(8);
    expect(result.averageDifficulty).toBeGreaterThanOrEqual(1);
    expect(result.averageDifficulty).toBeLessThanOrEqual(100);
  });

  it('evita o histórico recente quando existe vocabulário novo suficiente', () => {
    const recent = words.slice(0, 10).map(getWordBuilderKey);
    const result = selectWordBuilderWords({ words, mode, recentWordKeys: recent, rng: () => 0.2 });
    expect(result.words.every(word => !recent.includes(getWordBuilderKey(word)))).toBe(true);
  });

  it('nunca começa repetindo a última palavra quando há alternativa', () => {
    const recent = [getWordBuilderKey(words[15])];
    const result = selectWordBuilderWords({ words, mode, recentWordKeys: recent, rng: () => 0 });
    expect(hasImmediateWordBuilderRepeat(result.words, recent)).toBe(false);
  });

  it('prioriza uma dificuldade conhecida como problemática no papel struggle', () => {
    const hardWord = words.at(-1);
    const result = selectWordBuilderWords({
      words,
      mode,
      wordBuilderStats: { [getWordBuilderKey(hardWord)]: { wrong: 20 } },
      rng: () => 0.99,
    });
    expect(result.words.map(getWordBuilderKey)).toContain(getWordBuilderKey(hardWord));
  });

  it('reserva no máximo 30% da sessão para revisões vencidas', () => {
    const reviewQueue = words.slice(10, 20).map(word => ({
      wordKey: getWordBuilderKey(word),
      dueGame: 0,
      wrongCount: 1,
    }));
    const result = selectWordBuilderWords({ words, mode, reviewQueue, completedGames: 5, rng: () => 0.3 });
    expect(result.words).toHaveLength(8);
    expect(result.roles.filter(role => role === 'spaced-review')).toHaveLength(2);
  });
});
