export const DEFAULT_MEMORY_SKILL = Object.freeze({
  rating: 1,
  attempts: 0,
  perfectGames: 0,
  streak: 0,
  bestByMode: {},
  recentResults: [],
});

export const clampMemoryRating = value => Math.max(1, Math.min(100, Math.round(Number(value) || 1)));

export const getMemorySkillRating = (skill, fallbackLevel = 1) =>
  skill?.attempts > 0 ? clampMemoryRating(skill.rating) : clampMemoryRating(fallbackLevel);

export const calculateMemoryEfficiency = (pairs, attempts) => {
  const safePairs = Math.max(1, Math.round(Number(pairs) || 1));
  const safeAttempts = Math.max(safePairs, Math.round(Number(attempts) || safePairs));
  return Math.max(0, Math.min(1, safePairs / safeAttempts));
};

export const isBetterMemoryResult = (candidate, previous) => !previous
  || candidate.efficiency > previous.efficiency
  || (candidate.efficiency === previous.efficiency && candidate.attempts < previous.attempts);

/** Atualização contínua tipo Elo: eficiência alta contra tabuleiro difícil sobe mais. */
export const updateMemorySkill = (currentSkill, result = {}) => {
  const current = { ...DEFAULT_MEMORY_SKILL, ...(currentSkill || {}) };
  const rating = current.attempts > 0
    ? clampMemoryRating(current.rating)
    : clampMemoryRating(result.fallbackRating || current.rating);
  const difficulty = clampMemoryRating(result.difficulty || rating);
  const pairs = Math.max(1, Math.round(Number(result.pairs) || 1));
  const attempts = Math.max(pairs, Math.round(Number(result.attempts) || pairs));
  const efficiency = calculateMemoryEfficiency(pairs, attempts);
  const expected = 1 / (1 + (10 ** ((difficulty - rating) / 30)));
  const perfect = attempts === pairs;
  let delta = 9 * (efficiency - expected);
  if (perfect) delta += 1;
  if (efficiency < 0.35 && difficulty > rating + 10) delta *= 0.5;
  const nextRating = clampMemoryRating(rating + delta);
  const successful = efficiency >= 0.65;
  const mode = String(result.mode || 'medium');
  const previousBest = current.bestByMode?.[mode];
  const candidateBest = {
    efficiency: Math.round(efficiency * 100),
    attempts,
    difficulty,
  };
  const isPersonalBest = isBetterMemoryResult(candidateBest, previousBest);

  return {
    rating: nextRating,
    attempts: Math.max(0, Number(current.attempts) || 0) + 1,
    perfectGames: Math.max(0, Number(current.perfectGames) || 0) + (perfect ? 1 : 0),
    streak: successful ? Math.max(0, Number(current.streak) || 0) + 1 : 0,
    bestByMode: {
      ...(current.bestByMode || {}),
      ...(isPersonalBest ? { [mode]: candidateBest } : {}),
    },
    recentResults: [...(current.recentResults || []), {
      mode,
      difficulty,
      pairs,
      attempts,
      efficiency: Math.round(efficiency * 100),
      durationMs: Math.max(0, Math.round(Number(result.durationMs) || 0)),
      delta: nextRating - rating,
    }].slice(-20),
  };
};
