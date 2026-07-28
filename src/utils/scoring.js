// Sistema de pontuação — nunca subtrai pontos

export const POINTS = {
  FIRST_TRY: 10,
  SECOND_TRY: 5,
  WITH_HINT: 3,
  STREAK_BONUS: 20,       // 5 acertos seguidos
  PHASE_COMPLETION: 50,   // Conclusão de uma fase/rodada
  DAILY_CHALLENGE: 100,   // Completar desafio diário
};

export const calculatePoints = (attempt, usedHint = false) => {
  if (usedHint) return POINTS.WITH_HINT;
  if (attempt === 1) return POINTS.FIRST_TRY;
  if (attempt === 2) return POINTS.SECOND_TRY;
  return POINTS.WITH_HINT;
};

export const checkStreakBonus = (currentStreak) => {
  if (currentStreak > 0 && currentStreak % 5 === 0) {
    return POINTS.STREAK_BONUS;
  }
  return 0;
};

// Format score with + sign for display
export const formatScore = (points) => {
  return `+${points}`;
};
