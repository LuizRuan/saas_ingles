// Sistema de níveis — calcula nível baseado em palavras estudadas
import { levels } from '../data/categories';

export const getCurrentLevel = (wordsStudied) => {
  let currentLevel = levels[0];
  for (const level of levels) {
    if (wordsStudied >= level.wordsNeeded) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

export const getNextLevel = (wordsStudied) => {
  for (const level of levels) {
    if (wordsStudied < level.wordsNeeded) {
      return level;
    }
  }
  return null; // Max level reached
};

export const getLevelProgress = (wordsStudied) => {
  const current = getCurrentLevel(wordsStudied);
  const next = getNextLevel(wordsStudied);
  
  if (!next) return 100; // Max level
  
  const progressInLevel = wordsStudied - current.wordsNeeded;
  const totalNeeded = next.wordsNeeded - current.wordsNeeded;
  
  return Math.min(100, Math.round((progressInLevel / totalNeeded) * 100));
};
