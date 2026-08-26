import { describe, expect, it } from 'vitest';
import {
  calculateHangmanPerformance,
  getHangmanSkillRating,
  isBetterHangmanResult,
  updateHangmanSkill,
} from './hangmanSkill';

describe('habilidade própria da Forca', () => {
  it('começa pelo nível geral e depois usa o rating próprio', () => {
    expect(getHangmanSkillRating(null, 42)).toBe(42);
    expect(getHangmanSkillRating({ rating: 12, attempts: 0 }, 42)).toBe(42);
    expect(getHangmanSkillRating({ rating: 12, attempts: 1 }, 42)).toBe(12);
  });

  it('avalia melhor uma vitória limpa e penaliza assistência', () => {
    expect(calculateHangmanPerformance({ won: true, wrongCount: 0, maxWrong: 6 })).toBe(1);
    expect(calculateHangmanPerformance({ won: true, wrongCount: 4, maxWrong: 6 })).toBeLessThan(0.8);
    expect(calculateHangmanPerformance({ won: true, wrongCount: 0, maxWrong: 6, hintsUsed: 2 })).toBeLessThan(1);
    expect(calculateHangmanPerformance({ won: false })).toBe(0);
  });

  it('sobe com bom desempenho e desce com derrota adequada ao nível', () => {
    const base = { rating: 50, attempts: 5, wins: 3, losses: 2 };
    const win = updateHangmanSkill(base, { won: true, difficulty: 50, wrongCount: 0, maxWrong: 6 });
    const loss = updateHangmanSkill(base, { won: false, difficulty: 50, wrongCount: 6, maxWrong: 6 });
    expect(win.rating).toBeGreaterThan(50);
    expect(loss.rating).toBeLessThan(50);
  });

  it('mantém o nível entre 1 e 100 e somente 20 resultados', () => {
    let skill = { rating: 99, attempts: 1, recentResults: [] };
    for (let index = 0; index < 30; index += 1) {
      skill = updateHangmanSkill(skill, { won: true, difficulty: 100, wrongCount: 0, maxWrong: 6 });
    }
    expect(skill.rating).toBeLessThanOrEqual(100);
    expect(skill.recentResults).toHaveLength(20);
  });

  it('guarda recordes por modo e desempata por erros e tempo', () => {
    expect(isBetterHangmanResult(
      { performance: 90, wrongCount: 1, durationMs: 30000 },
      { performance: 90, wrongCount: 2, durationMs: 20000 },
    )).toBe(true);
    let skill = updateHangmanSkill(null, { mode: 'easy', won: true, wrongCount: 2, maxWrong: 6, durationMs: 30000 });
    skill = updateHangmanSkill(skill, { mode: 'easy', won: true, wrongCount: 0, maxWrong: 6, durationMs: 25000 });
    expect(skill.bestByMode.easy).toMatchObject({ performance: 100, wrongCount: 0, durationMs: 25000 });
  });
});
