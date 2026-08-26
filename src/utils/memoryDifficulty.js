import { clampMemoryRating, getMemorySkillRating } from './memorySkill';

export const MEMORY_DIFFICULTIES = Object.freeze([
  {
    id: 'easy', label: 'Fácil', minPairs: 3, maxPairs: 4, cols: 3,
    minTarget: 1, maxTarget: 80, previewMs: 1800, mismatchMs: 1300,
    description: 'Palavras abaixo do seu nível e uma prévia das cartas',
  },
  {
    id: 'medium', label: 'Médio', minPairs: 5, maxPairs: 7, cols: 4,
    minTarget: 8, maxTarget: 90, previewMs: 600, mismatchMs: 1000,
    description: 'Palavras próximas do seu nível',
  },
  {
    id: 'hard', label: 'Difícil', minPairs: 8, maxPairs: 10, cols: 5,
    minTarget: 20, maxTarget: 100, previewMs: 0, mismatchMs: 700,
    description: 'Palavras acima do seu nível e menos tempo para memorizar',
  },
]);

export const getMemoryDifficulty = (modeId = 'medium', skill, userLevel = 1) => {
  const mode = MEMORY_DIFFICULTIES.find(item => item.id === modeId) || MEMORY_DIFFICULTIES[1];
  const memoryRating = getMemorySkillRating(skill, userLevel);
  const blendedRating = clampMemoryRating((memoryRating * 0.75) + (clampMemoryRating(userLevel) * 0.25));
  const progress = (blendedRating - 1) / 99;
  const pairs = Math.round(mode.minPairs + ((mode.maxPairs - mode.minPairs) * progress));
  const targetDifficulty = Math.round(mode.minTarget + ((mode.maxTarget - mode.minTarget) * progress));

  return { ...mode, pairs, targetDifficulty, memoryRating };
};

export const getAllMemoryDifficulties = (skill, userLevel = 1) =>
  MEMORY_DIFFICULTIES.map(mode => getMemoryDifficulty(mode.id, skill, userLevel));

