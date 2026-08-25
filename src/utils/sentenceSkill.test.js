import { describe, expect, it } from 'vitest';
import { DEFAULT_SENTENCE_SKILL, getSentenceDifficultyBand, getSentenceSkillRating, updateSentenceSkill } from './sentenceSkill';

describe('habilidade adaptativa do Montar Frases', () => {
  it('usa o nível geral somente antes da primeira resposta', () => {
    expect(getSentenceSkillRating(DEFAULT_SENTENCE_SKILL, 35)).toBe(35);
    expect(getSentenceSkillRating({ ...DEFAULT_SENTENCE_SKILL, attempts: 1, rating: 12 }, 35)).toBe(12);
  });

  it('sobe com acertos e desce com erros', () => {
    const base = { ...DEFAULT_SENTENCE_SKILL, rating: 30, attempts: 5 };
    const correct = updateSentenceSkill(base, { correct: true, difficulty: 35, wordCount: 5, durationMs: 5000 });
    const wrong = updateSentenceSkill(base, { correct: false, difficulty: 25, wordCount: 5, durationMs: 5000 });
    expect(correct.rating).toBeGreaterThan(base.rating);
    expect(wrong.rating).toBeLessThan(base.rating);
  });

  it('penaliza menos quando a frase estava muito acima da habilidade', () => {
    const base = { ...DEFAULT_SENTENCE_SKILL, rating: 20, attempts: 5 };
    const near = updateSentenceSkill(base, { correct: false, difficulty: 20 });
    const tooHard = updateSentenceSkill(base, { correct: false, difficulty: 60 });
    expect(tooHard.rating).toBeGreaterThanOrEqual(near.rating);
  });

  it('limita rating e histórico aos tetos definidos', () => {
    let skill = { ...DEFAULT_SENTENCE_SKILL, rating: 99 };
    for (let index = 0; index < 30; index += 1) {
      skill = updateSentenceSkill(skill, { sentenceId: `s-${index}`, correct: true, difficulty: 100 });
    }
    expect(skill.rating).toBe(100);
    expect(skill.recentResults).toHaveLength(20);
  });

  it('nomeia corretamente as cinco faixas visuais', () => {
    expect([1, 20, 21, 40, 41, 60, 61, 80, 81, 100].map(value => getSentenceDifficultyBand(value).label)).toEqual([
      'Iniciante', 'Iniciante', 'Básico', 'Básico', 'Intermediário', 'Intermediário',
      'Intermediário avançado', 'Intermediário avançado', 'Avançado', 'Avançado',
    ]);
  });
});
