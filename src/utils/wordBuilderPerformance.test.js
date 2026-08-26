import { describe, expect, it } from 'vitest';
import {
  buildWordBuilderWordResult,
  calculateWordBuilderWordPerformance,
  updateWordBuilderStats,
} from './wordBuilderPerformance';

describe('desempenho por palavra do Montar Palavras', () => {
  it('premia resposta direta e penaliza tentativas, movimentos e dicas', () => {
    const perfect = calculateWordBuilderWordPerformance({ won: true, attempts: 1, maxAttempts: 3, moves: 5, idealMoves: 5 });
    const assisted = calculateWordBuilderWordPerformance({ won: true, attempts: 3, maxAttempts: 3, moves: 10, idealMoves: 5, hintsUsed: 2 });
    expect(perfect).toBe(1);
    expect(assisted).toBeLessThan(perfect);
    expect(calculateWordBuilderWordPerformance({ won: false })).toBe(0);
  });

  it('gera resultado completo e marca baixo desempenho para revisão', () => {
    const result = buildWordBuilderWordResult({
      word: { en: 'Apple', wordBuilderDifficulty: 44 },
      won: true,
      attempts: 3,
      maxAttempts: 3,
      moves: 12,
      hintsUsed: 2,
      durationMs: 9000,
    });
    expect(result.key).toBe('apple');
    expect(result.idealMoves).toBe(5);
    expect(result.needsReview).toBe(true);
  });

  it('acumula estatísticas sem apagar o histórico anterior', () => {
    const result = buildWordBuilderWordResult({ word: { en: 'Cat' }, won: true, moves: 3, durationMs: 1000 });
    const updated = updateWordBuilderStats({ cat: { rounds: 2, correct: 1, bestMoves: 4 } }, [result], 123);
    expect(updated.cat).toMatchObject({ rounds: 3, correct: 2, wrong: 0, bestMoves: 3, lastSeen: 123 });
  });
});
