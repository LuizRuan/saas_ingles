export const DEFAULT_SENTENCE_SKILL = Object.freeze({
  rating: 1,
  attempts: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  recentResults: [],
});

const clampRating = value => Math.max(1, Math.min(100, Math.round(value)));

export const getSentenceSkillRating = (skill, fallbackLevel = 1) =>
  skill?.attempts > 0 ? clampRating(skill.rating) : clampRating(fallbackLevel);

export const getSentenceDifficultyBand = (difficulty) => {
  const value = clampRating(difficulty);
  if (value <= 20) return { id: 'beginner', label: 'Iniciante' };
  if (value <= 40) return { id: 'basic', label: 'Básico' };
  if (value <= 60) return { id: 'intermediate', label: 'Intermediário' };
  if (value <= 80) return { id: 'upper-intermediate', label: 'Intermediário avançado' };
  return { id: 'advanced', label: 'Avançado' };
};

/** Atualização tipo Elo: acertar acima do rating vale mais; errar abaixo pesa mais. */
export const updateSentenceSkill = (currentSkill, result) => {
  const current = { ...DEFAULT_SENTENCE_SKILL, ...(currentSkill || {}) };
  const rating = clampRating(current.rating);
  const difficulty = clampRating(result?.difficulty || rating);
  const correct = Boolean(result?.correct);
  const expected = 1 / (1 + (10 ** ((difficulty - rating) / 30)));
  let delta = 6 * ((correct ? 1 : 0) - expected);
  const wordCount = Math.max(1, Number(result?.wordCount) || 1);
  const durationMs = Math.max(0, Number(result?.durationMs) || 0);
  const removedWords = Math.max(0, Number(result?.removedWords) || 0);

  if (correct && durationMs > 0 && durationMs / wordCount < 2500 && removedWords <= 1) delta += 1;
  if (!correct && difficulty > rating + 8) delta *= 0.5;
  const streak = correct ? current.streak + 1 : 0;
  if (correct && streak > 0 && streak % 3 === 0) delta += 1;

  return {
    rating: clampRating(rating + delta),
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    wrong: current.wrong + (correct ? 0 : 1),
    streak,
    recentResults: [...(current.recentResults || []), {
      sentenceId: String(result?.sentenceId || ''),
      correct,
      difficulty,
      durationMs: Math.round(durationMs),
      removedWords: Math.round(removedWords),
    }].slice(-20),
  };
};
