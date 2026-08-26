import { getWordBuilderLetterCount } from './wordBuilderAudit';

const MODE_MULTIPLIERS = Object.freeze({ easy: 0.85, medium: 1.1, hard: 1.4 });

export const getWordBuilderMedal = ({ accuracy = 0, performance = 0 } = {}) => {
  if (accuracy < 0.5) return { id: 'effort', icon: '💪', label: 'Continue praticando' };
  if (accuracy === 1 && performance >= 90) return { id: 'gold', icon: '🥇', label: 'Excelente' };
  if (accuracy >= 0.75 && performance >= 72) return { id: 'silver', icon: '🥈', label: 'Muito bom' };
  return { id: 'bronze', icon: '🥉', label: 'Bom trabalho' };
};

export const calculateWordBuilderWordPoints = (result, mode = 'medium') => {
  if (!result?.won) return 0;
  const multiplier = MODE_MULTIPLIERS[mode] || MODE_MULTIPLIERS.medium;
  const difficulty = Math.max(1, Math.min(100, Number(result.difficulty) || 1));
  const letters = Math.max(3, getWordBuilderLetterCount(result.word?.en));
  const performance = Math.max(0, Math.min(100, Number(result.performance) || 0)) / 100;
  return Math.max(5, Math.round(
    (8 + (difficulty * 0.22) + (letters * 1.5)) * multiplier * (0.55 + (performance * 0.45)),
  ));
};

export const createWordBuilderGameResult = ({
  wordResults = [],
  mode = 'medium',
  difficulty = 1,
  durationMs = 0,
  fallbackRating = 1,
} = {}) => {
  const totalRounds = wordResults.length;
  const correctCount = wordResults.filter(result => result.won).length;
  const accuracy = totalRounds > 0 ? correctCount / totalRounds : 0;
  const totalAttempts = wordResults.reduce((sum, result) => sum + result.attempts, 0);
  const totalHints = wordResults.reduce((sum, result) => sum + result.hintsUsed, 0);
  const totalIdealMoves = wordResults.reduce((sum, result) => sum + result.idealMoves, 0);
  const totalMoves = wordResults.reduce((sum, result) => sum + Math.max(result.idealMoves, result.moves), 0);
  const performance = totalRounds > 0
    ? Math.round(wordResults.reduce((sum, result) => sum + result.performance, 0) / totalRounds)
    : 0;
  const wordPoints = wordResults.reduce((sum, result) => sum + calculateWordBuilderWordPoints(result, mode), 0);
  const completionBonus = correctCount > 0
    ? Math.round(15 * (MODE_MULTIPLIERS[mode] || MODE_MULTIPLIERS.medium) * accuracy)
    : 0;
  const reviewCount = wordResults.filter(result => result.needsReview).length;

  return {
    mode,
    difficulty: Math.max(1, Math.min(100, Math.round(Number(difficulty) || 1))),
    totalRounds,
    correctCount,
    accuracy,
    averageAttempts: totalAttempts / Math.max(1, totalRounds),
    moveEfficiency: totalIdealMoves / Math.max(1, totalMoves),
    hintsUsed: totalHints,
    performance,
    durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
    fallbackRating,
    reviewCount,
    wordPoints,
    completionBonus,
    points: wordPoints + completionBonus,
    medal: getWordBuilderMedal({ accuracy, performance }),
  };
};

