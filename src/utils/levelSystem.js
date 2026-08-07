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

export const getUserTitle = (level) => {
  const lvl = Number(level) || 1;
  if (lvl >= 100) return { title: 'Supremo Mestre',    tag: '👑 Supremo Mestre',    minLevel: 100 };
  if (lvl >= 90)  return { title: 'Imortal do Idioma', tag: '🏛️ Imortal do Idioma', minLevel: 90 };
  if (lvl >= 80)  return { title: 'Lenda do Inglês',   tag: '🌟 Lenda do Inglês',   minLevel: 80 };
  if (lvl >= 70)  return { title: 'Fluente Épico',     tag: '💎 Fluente Épico',     minLevel: 70 };
  if (lvl >= 60)  return { title: 'Mestre das Frases', tag: '⚡ Mestre das Frases', minLevel: 60 };
  if (lvl >= 50)  return { title: 'Sábio',             tag: '🧠 Sábio',             minLevel: 50 };
  if (lvl >= 40)  return { title: 'Especialista',      tag: '🎓 Especialista',      minLevel: 40 };
  if (lvl >= 30)  return { title: 'Poliglota',         tag: '🚀 Poliglota',         minLevel: 30 };
  if (lvl >= 20)  return { title: 'Conversador',       tag: '🗣️ Conversador',       minLevel: 20 };
  if (lvl >= 10)  return { title: 'Estudante',         tag: '📚 Estudante',         minLevel: 10 };
  return                 { title: 'Iniciante',         tag: '🐣 Iniciante',         minLevel: 1 };
};
