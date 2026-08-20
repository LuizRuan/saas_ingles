import { useProgress } from './useProgress';
import { getCurrentLevel } from '../utils/levelSystem';
import { getLevels } from '../data/index';

/**
 * Nível do jogador no curso ativo, pronto para alimentar `pickByLevel`
 * (levelSelection.js). Existe pra não repetir
 * `getCurrentLevel(progress.wordsStudied, progress.activeCourse).level` +
 * `getLevels(courseId).length` em cada um dos jogos.
 */
const useUserLevel = () => {
  const { progress } = useProgress();
  const userLevel = getCurrentLevel(progress.wordsStudied || 0, progress.activeCourse).level;
  const maxLevel = getLevels(progress.activeCourse).length;
  return { userLevel, maxLevel };
};

export default useUserLevel;
