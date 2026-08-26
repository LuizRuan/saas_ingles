import { describe, expect, it } from 'vitest';
import {
  calculateMemoryEfficiency,
  getMemorySkillRating,
  isBetterMemoryResult,
  updateMemorySkill,
} from './memorySkill';

describe('habilidade própria do Jogo da Memória', () => {
  it('usa o nível geral como ponto inicial até existir uma partida', () => {
    expect(getMemorySkillRating(null, 37)).toBe(37);
    expect(getMemorySkillRating({ rating: 12, attempts: 0 }, 37)).toBe(37);
    expect(getMemorySkillRating({ rating: 12, attempts: 1 }, 37)).toBe(12);
  });

  it('mantém rating e eficiência dentro dos limites', () => {
    expect(calculateMemoryEfficiency(6, 6)).toBe(1);
    expect(calculateMemoryEfficiency(6, 18)).toBeCloseTo(1 / 3);
    expect(updateMemorySkill({ rating: 99, attempts: 4 }, {
      difficulty: 100, pairs: 10, attempts: 10,
    }).rating).toBeLessThanOrEqual(100);
  });

  it('premia partida eficiente e reduz após desempenho ruim', () => {
    const base = { rating: 50, attempts: 5, perfectGames: 0, streak: 0, recentResults: [] };
    const excellent = updateMemorySkill(base, { difficulty: 50, pairs: 6, attempts: 6, mode: 'medium' });
    const poor = updateMemorySkill(base, { difficulty: 50, pairs: 6, attempts: 30, mode: 'medium' });
    expect(excellent.rating).toBeGreaterThan(50);
    expect(excellent.perfectGames).toBe(1);
    expect(poor.rating).toBeLessThan(50);
    expect(poor.streak).toBe(0);
  });

  it('inicia a primeira atualização a partir do nível geral informado', () => {
    const next = updateMemorySkill(null, {
      fallbackRating: 40, difficulty: 40, pairs: 6, attempts: 6,
    });
    expect(next.rating).toBeGreaterThan(40);
  });

  it('guarda somente os 20 resultados mais recentes', () => {
    let skill = { rating: 20, attempts: 0, recentResults: [] };
    for (let index = 0; index < 30; index += 1) {
      skill = updateMemorySkill(skill, { difficulty: 20, pairs: 3, attempts: 4 });
    }
    expect(skill.recentResults).toHaveLength(20);
    expect(skill.attempts).toBe(30);
  });

  it('preserva o melhor resultado de cada modo', () => {
    let skill = updateMemorySkill({ rating: 30, attempts: 1 }, {
      mode: 'easy', difficulty: 25, pairs: 4, attempts: 8,
    });
    skill = updateMemorySkill(skill, {
      mode: 'easy', difficulty: 25, pairs: 4, attempts: 4,
    });
    skill = updateMemorySkill(skill, {
      mode: 'easy', difficulty: 25, pairs: 4, attempts: 10,
    });
    expect(skill.bestByMode.easy).toMatchObject({ efficiency: 100, attempts: 4 });
  });

  it('considera menos tentativas como desempate de recorde', () => {
    expect(isBetterMemoryResult(
      { efficiency: 80, attempts: 5 },
      { efficiency: 80, attempts: 7 },
    )).toBe(true);
    expect(isBetterMemoryResult(
      { efficiency: 80, attempts: 8 },
      { efficiency: 80, attempts: 7 },
    )).toBe(false);
  });
});
