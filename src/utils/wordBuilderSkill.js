export const DEFAULT_WORD_BUILDER_SKILL = Object.freeze({
  rating: 1,
  attempts: 0,
  correct: 0,
  wrong: 0,
  perfectGames: 0,
  streak: 0,
  bestByMode: {},
  recentResults: [],
});

export const clampWordBuilderRating = value =>
  Math.max(1, Math.min(100, Math.round(Number(value) || 1)));

export const getWordBuilderSkillRating = (skill, fallbackLevel = 1) =>
  skill?.attempts > 0 ? clampWordBuilderRating(skill.rating) : clampWordBuilderRating(fallbackLevel);

export const calculateWordBuilderPerformance = ({
  correctCount = 0,
  totalRounds = 8,
  averageAttempts = 1,
  moveEfficiency = 1,
  hintsUsed = 0,
} = {}) => {
  const total = Math.max(1, Math.round(Number(totalRounds) || 8));
  const correct = Math.max(0, Math.min(total, Math.round(Number(correctCount) || 0)));
  const accuracy = correct / total;
  const attemptEfficiency = Math.max(0, Math.min(1, 1 - ((Math.max(1, Number(averageAttempts) || 1) - 1) / 2)));
  const safeMoveEfficiency = Math.max(0, Math.min(1, Number(moveEfficiency) || 0));
  const hintPenalty = Math.min(0.25, Math.max(0, Number(hintsUsed) || 0) * 0.025);
  return Math.max(0, Math.min(1,
    (accuracy * 0.65) + (attemptEfficiency * 0.2) + (safeMoveEfficiency * 0.15) - hintPenalty));
};

export const isBetterWordBuilderResult = (candidate, previous) => !previous
  || candidate.performance > previous.performance
  || (candidate.performance === previous.performance && candidate.correctCount > previous.correctCount)
  || (candidate.performance === previous.performance
    && candidate.correctCount === previous.correctCount
    && candidate.durationMs < previous.durationMs);

export const updateWordBuilderSkill = (currentSkill, result = {}) => {
  const current = { ...DEFAULT_WORD_BUILDER_SKILL, ...(currentSkill || {}) };
  const rating = current.attempts > 0
    ? clampWordBuilderRating(current.rating)
    : clampWordBuilderRating(result.fallbackRating || current.rating);
  const difficulty = clampWordBuilderRating(result.difficulty || rating);
  const totalRounds = Math.max(1, Math.round(Number(result.totalRounds) || 8));
  const correctCount = Math.max(0, Math.min(totalRounds, Math.round(Number(result.correctCount) || 0)));
  const performanceRatio = Number.isFinite(Number(result.performance))
    ? Math.max(0, Math.min(1, Number(result.performance) / 100))
    : calculateWordBuilderPerformance(result);
  const expected = 1 / (1 + (10 ** ((difficulty - rating) / 30)));
  let delta = 9 * (performanceRatio - expected);
  const perfect = correctCount === totalRounds
    && Math.max(0, Number(result.hintsUsed) || 0) === 0
    && Math.max(1, Number(result.averageAttempts) || 1) <= 1;
  if (perfect) delta += 1;
  if (correctCount === 0 && difficulty > rating + 12) delta *= 0.5;
  const nextRating = clampWordBuilderRating(rating + delta);
  const mode = String(result.mode || 'medium');
  const durationMs = Math.max(0, Math.round(Number(result.durationMs) || 0));
  const candidateBest = {
    performance: Math.round(performanceRatio * 100),
    correctCount,
    totalRounds,
    durationMs,
    difficulty,
  };
  const previousBest = current.bestByMode?.[mode];
  const successful = correctCount / totalRounds >= 0.7;

  return {
    rating: nextRating,
    attempts: Math.max(0, Number(current.attempts) || 0) + 1,
    correct: Math.max(0, Number(current.correct) || 0) + correctCount,
    wrong: Math.max(0, Number(current.wrong) || 0) + (totalRounds - correctCount),
    perfectGames: Math.max(0, Number(current.perfectGames) || 0) + (perfect ? 1 : 0),
    streak: successful ? Math.max(0, Number(current.streak) || 0) + 1 : 0,
    bestByMode: {
      ...(current.bestByMode || {}),
      ...(isBetterWordBuilderResult(candidateBest, previousBest) ? { [mode]: candidateBest } : {}),
    },
    recentResults: [...(current.recentResults || []), {
      mode,
      difficulty,
      correctCount,
      totalRounds,
      averageAttempts: Math.max(1, Number(result.averageAttempts) || 1),
      hintsUsed: Math.max(0, Math.round(Number(result.hintsUsed) || 0)),
      performance: candidateBest.performance,
      durationMs,
      delta: nextRating - rating,
    }].slice(-20),
  };
};

