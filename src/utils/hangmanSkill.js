export const DEFAULT_HANGMAN_SKILL = Object.freeze({
  rating: 1,
  attempts: 0,
  wins: 0,
  losses: 0,
  perfectGames: 0,
  streak: 0,
  bestByMode: {},
  recentResults: [],
});

export const clampHangmanRating = value =>
  Math.max(1, Math.min(100, Math.round(Number(value) || 1)));

export const getHangmanSkillRating = (skill, fallbackLevel = 1) =>
  skill?.attempts > 0 ? clampHangmanRating(skill.rating) : clampHangmanRating(fallbackLevel);

export const calculateHangmanPerformance = ({
  won = false,
  wrongCount = 0,
  maxWrong = 6,
  hintsUsed = 0,
  translationUsed = false,
} = {}) => {
  if (!won) return 0;
  const safeMax = Math.max(1, Math.round(Number(maxWrong) || 6));
  const safeWrong = Math.max(0, Math.min(safeMax, Math.round(Number(wrongCount) || 0)));
  const remainingRatio = (safeMax - safeWrong) / safeMax;
  const assistancePenalty = (Math.max(0, Number(hintsUsed) || 0) * 0.08) + (translationUsed ? 0.04 : 0);
  return Math.max(0, Math.min(1, 0.55 + (remainingRatio * 0.45) - assistancePenalty));
};

export const isBetterHangmanResult = (candidate, previous) => !previous
  || candidate.performance > previous.performance
  || (candidate.performance === previous.performance && candidate.wrongCount < previous.wrongCount)
  || (candidate.performance === previous.performance
    && candidate.wrongCount === previous.wrongCount
    && candidate.durationMs < previous.durationMs);

export const updateHangmanSkill = (currentSkill, result = {}) => {
  const current = { ...DEFAULT_HANGMAN_SKILL, ...(currentSkill || {}) };
  const rating = current.attempts > 0
    ? clampHangmanRating(current.rating)
    : clampHangmanRating(result.fallbackRating || current.rating);
  const difficulty = clampHangmanRating(result.difficulty || rating);
  const performanceRatio = calculateHangmanPerformance(result);
  const expected = 1 / (1 + (10 ** ((difficulty - rating) / 30)));
  let delta = 9 * (performanceRatio - expected);
  if (result.won && Number(result.wrongCount) === 0 && Number(result.hintsUsed || 0) === 0) delta += 1;
  if (!result.won && difficulty > rating + 12) delta *= 0.45;
  const nextRating = clampHangmanRating(rating + delta);
  const mode = String(result.mode || 'medium');
  const durationMs = Math.max(0, Math.round(Number(result.durationMs) || 0));
  const candidateBest = {
    performance: Math.round(performanceRatio * 100),
    wrongCount: Math.max(0, Math.round(Number(result.wrongCount) || 0)),
    durationMs,
    difficulty,
  };
  const previousBest = current.bestByMode?.[mode];
  const won = Boolean(result.won);
  const perfect = won && candidateBest.wrongCount === 0 && Number(result.hintsUsed || 0) === 0;

  return {
    rating: nextRating,
    attempts: Math.max(0, Number(current.attempts) || 0) + 1,
    wins: Math.max(0, Number(current.wins) || 0) + (won ? 1 : 0),
    losses: Math.max(0, Number(current.losses) || 0) + (won ? 0 : 1),
    perfectGames: Math.max(0, Number(current.perfectGames) || 0) + (perfect ? 1 : 0),
    streak: won ? Math.max(0, Number(current.streak) || 0) + 1 : 0,
    bestByMode: {
      ...(current.bestByMode || {}),
      ...(won && isBetterHangmanResult(candidateBest, previousBest) ? { [mode]: candidateBest } : {}),
    },
    recentResults: [...(current.recentResults || []), {
      mode,
      won,
      difficulty,
      wrongCount: candidateBest.wrongCount,
      maxWrong: Math.max(1, Math.round(Number(result.maxWrong) || 6)),
      hintsUsed: Math.max(0, Math.round(Number(result.hintsUsed) || 0)),
      translationUsed: Boolean(result.translationUsed),
      performance: candidateBest.performance,
      durationMs,
      delta: nextRating - rating,
    }].slice(-20),
  };
};

