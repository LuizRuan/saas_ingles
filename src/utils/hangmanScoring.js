import { calculateHangmanPerformance } from './hangmanSkill';

const MODE_MULTIPLIERS = Object.freeze({ easy: 0.9, medium: 1.15, hard: 1.45 });

export const getHangmanMedal = ({ won, performance }) => {
  if (!won) return { id: 'effort', icon: '💪', label: 'Continue tentando' };
  if (performance >= 90) return { id: 'gold', icon: '🥇', label: 'Excelente' };
  if (performance >= 72) return { id: 'silver', icon: '🥈', label: 'Muito bom' };
  return { id: 'bronze', icon: '🥉', label: 'Concluído' };
};

export const createHangmanGameResult = ({
  mode = 'medium',
  won = false,
  difficulty = 1,
  wrongCount = 0,
  maxWrong = 6,
  hintsUsed = 0,
  translationUsed = false,
  durationMs = 0,
  letterCount = 3,
} = {}) => {
  const safeDifficulty = Math.max(1, Math.min(100, Math.round(Number(difficulty) || 1)));
  const safeMax = Math.max(1, Math.round(Number(maxWrong) || 6));
  const safeWrong = Math.max(0, Math.min(safeMax, Math.round(Number(wrongCount) || 0)));
  const safeHints = Math.max(0, Math.round(Number(hintsUsed) || 0));
  const performance = Math.round(calculateHangmanPerformance({
    won,
    wrongCount: safeWrong,
    maxWrong: safeMax,
    hintsUsed: safeHints,
    translationUsed,
  }) * 100);
  const multiplier = MODE_MULTIPLIERS[mode] || MODE_MULTIPLIERS.medium;
  const points = won ? Math.max(30, Math.round(
    ((30 + (safeDifficulty * 0.5) + (Math.max(3, Number(letterCount) || 3) * 4))
      * (0.55 + (performance / 100 * 0.45))) * multiplier,
  )) : 0;

  return {
    mode,
    won: Boolean(won),
    difficulty: safeDifficulty,
    wrongCount: safeWrong,
    maxWrong: safeMax,
    remainingAttempts: Math.max(0, safeMax - safeWrong),
    hintsUsed: safeHints,
    translationUsed: Boolean(translationUsed),
    durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
    performance,
    points,
    medal: getHangmanMedal({ won, performance }),
  };
};

