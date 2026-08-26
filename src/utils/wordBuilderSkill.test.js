import { describe, expect, it } from 'vitest';
import {
  calculateWordBuilderPerformance,
  getWordBuilderSkillRating,
  isBetterWordBuilderResult,
  updateWordBuilderSkill,
} from './wordBuilderSkill';

describe('habilidade própria do Montar Palavras', () => {
  it('começa pelo nível geral e depois usa o rating próprio', () => {
    expect(getWordBuilderSkillRating(null, 37)).toBe(37);
    expect(getWordBuilderSkillRating({ rating: 12, attempts: 0 }, 37)).toBe(37);
    expect(getWordBuilderSkillRating({ rating: 12, attempts: 1 }, 37)).toBe(12);
  });

  it('avalia precisão, tentativas, movimentos e dicas', () => {
    const perfect = calculateWordBuilderPerformance({ correctCount: 8, totalRounds: 8, averageAttempts: 1, moveEfficiency: 1 });
    const assisted = calculateWordBuilderPerformance({ correctCount: 8, totalRounds: 8, averageAttempts: 2, moveEfficiency: 0.6, hintsUsed: 3 });
    const failed = calculateWordBuilderPerformance({ correctCount: 0, totalRounds: 8, averageAttempts: 3, moveEfficiency: 0 });
    expect(perfect).toBe(1);
    expect(assisted).toBeLessThan(perfect);
    expect(failed).toBe(0);
  });

  it('sobe com sessão forte e desce com sessão fraca', () => {
    const base = { rating: 50, attempts: 5 };
    const strong = updateWordBuilderSkill(base, { difficulty: 50, correctCount: 8, totalRounds: 8, performance: 100 });
    const weak = updateWordBuilderSkill(base, { difficulty: 50, correctCount: 0, totalRounds: 8, performance: 0 });
    expect(strong.rating).toBeGreaterThan(50);
    expect(weak.rating).toBeLessThan(50);
  });

  it('mantém rating e histórico dentro dos limites', () => {
    let skill = { rating: 99, attempts: 1, recentResults: [] };
    for (let index = 0; index < 30; index += 1) {
      skill = updateWordBuilderSkill(skill, { difficulty: 100, correctCount: 8, totalRounds: 8, performance: 100 });
    }
    expect(skill.rating).toBeLessThanOrEqual(100);
    expect(skill.recentResults).toHaveLength(20);
  });

  it('guarda recordes por modo e desempata por acertos e tempo', () => {
    expect(isBetterWordBuilderResult(
      { performance: 90, correctCount: 8, durationMs: 30000 },
      { performance: 90, correctCount: 7, durationMs: 20000 },
    )).toBe(true);
    let skill = updateWordBuilderSkill(null, { mode: 'easy', correctCount: 6, totalRounds: 8, performance: 80, durationMs: 30000 });
    skill = updateWordBuilderSkill(skill, { mode: 'easy', correctCount: 8, totalRounds: 8, performance: 100, durationMs: 25000 });
    expect(skill.bestByMode.easy).toMatchObject({ performance: 100, correctCount: 8, durationMs: 25000 });
  });
});
