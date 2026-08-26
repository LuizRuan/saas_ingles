import { describe, expect, it } from 'vitest';
import { buildWordBuilderWordResult } from './wordBuilderPerformance';
import {
  calculateWordBuilderWordPoints,
  createWordBuilderGameResult,
  getWordBuilderMedal,
} from './wordBuilderScoring';

const word = { en: 'Elephant', pt: 'Elefante', wordBuilderDifficulty: 70 };
const perfect = buildWordBuilderWordResult({ word, won: true, attempts: 1, maxAttempts: 3, moves: 8, difficulty: 70 });
const assisted = buildWordBuilderWordResult({ word, won: true, attempts: 3, maxAttempts: 3, moves: 16, hintsUsed: 2, difficulty: 70 });
const lost = buildWordBuilderWordResult({ word, won: false, attempts: 3, maxAttempts: 3, moves: 20, difficulty: 70 });

describe('pontuação do Montar Palavras', () => {
  it('premia dificuldade e desempenho sem permitir exploração por dicas', () => {
    expect(calculateWordBuilderWordPoints(perfect, 'hard')).toBeGreaterThan(calculateWordBuilderWordPoints(perfect, 'easy'));
    expect(calculateWordBuilderWordPoints(perfect, 'medium')).toBeGreaterThan(calculateWordBuilderWordPoints(assisted, 'medium'));
    expect(calculateWordBuilderWordPoints(lost, 'hard')).toBe(0);
  });

  it('não dá bônus nem pontos para uma sessão toda errada', () => {
    const result = createWordBuilderGameResult({ wordResults: [lost, lost], mode: 'hard' });
    expect(result.points).toBe(0);
    expect(result.completionBonus).toBe(0);
    expect(result.medal.id).toBe('effort');
  });

  it('gera ouro somente com 100% de acerto e ótimo desempenho', () => {
    const result = createWordBuilderGameResult({ wordResults: [perfect, perfect], mode: 'medium', difficulty: 70 });
    expect(result.medal.id).toBe('gold');
    expect(result.performance).toBe(100);
    expect(result.reviewCount).toBe(0);
  });

  it('separa corretamente os limites das medalhas', () => {
    expect(getWordBuilderMedal({ accuracy: 0.4, performance: 100 }).id).toBe('effort');
    expect(getWordBuilderMedal({ accuracy: 0.75, performance: 72 }).id).toBe('silver');
    expect(getWordBuilderMedal({ accuracy: 1, performance: 89 }).id).toBe('silver');
  });
});
