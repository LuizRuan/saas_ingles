import { calculateMemoryEfficiency } from './memorySkill';

const MODE_MULTIPLIERS = Object.freeze({ easy: 0.9, medium: 1.15, hard: 1.45 });

export const getMemoryMedal = (pairs, attempts) => {
  const safePairs = Math.max(1, Math.round(Number(pairs) || 1));
  const safeAttempts = Math.max(safePairs, Math.round(Number(attempts) || safePairs));
  if (safeAttempts <= Math.ceil(safePairs * 1.2)) return { id: 'gold', icon: '🥇', label: 'Excelente' };
  if (safeAttempts <= Math.ceil(safePairs * 1.5)) return { id: 'silver', icon: '🥈', label: 'Muito bom' };
  return { id: 'bronze', icon: '🥉', label: 'Concluído' };
};

export const createMemoryGameResult = ({
  mode = 'medium',
  pairs = 3,
  attempts = pairs,
  difficulty = 1,
  durationMs = 0,
} = {}) => {
  const safePairs = Math.max(1, Math.round(Number(pairs) || 1));
  const safeAttempts = Math.max(safePairs, Math.round(Number(attempts) || safePairs));
  const safeDifficulty = Math.max(1, Math.min(100, Math.round(Number(difficulty) || 1)));
  const efficiency = calculateMemoryEfficiency(safePairs, safeAttempts);
  const multiplier = MODE_MULTIPLIERS[mode] || MODE_MULTIPLIERS.medium;
  const points = Math.max(30, Math.round(
    (safePairs * 8 * multiplier) + (safeDifficulty * 0.35) + (efficiency * 40),
  ));

  return {
    mode,
    pairs: safePairs,
    attempts: safeAttempts,
    idealAttempts: safePairs,
    difficulty: safeDifficulty,
    durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
    efficiency: Math.round(efficiency * 100),
    medal: getMemoryMedal(safePairs, safeAttempts),
    points,
  };
};

