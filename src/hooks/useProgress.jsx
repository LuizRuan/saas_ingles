import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loadProgress, saveProgress, resetProgress as clearStorage, updateDayStreak } from '../utils/storage';
import { calculatePoints, checkStreakBonus, POINTS } from '../utils/scoring';
import { recordWordResult } from '../utils/reviewSystem';
import { getCurrentLevel } from '../utils/levelSystem';
import { applyTheme } from '../utils/appearance';
import { achievementsList } from '../data/achievements';

const ProgressContext = createContext(null);

// Multiplicador da Loja: só vale enquanto restarem partidas (multiplierGames).
const activeMultiplier = (progress) =>
  (progress.multiplierGames || 0) > 0 ? (progress.pointsMultiplier || 1) : 1;

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(() => loadProgress());
  const [newAchievement, setNewAchievement] = useState(null);
  const [scorePopup, setScorePopup] = useState(null);

  // Leitura síncrona do progresso atual para as ações abaixo.
  // IMPORTANTE: as ações NÃO podem depender de `progress` diretamente — telas de
  // fim de jogo chamam completeGame() dentro de um useEffect que tem a própria
  // ação nas dependências, então uma identidade instável vira loop infinito.
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Save to localStorage whenever progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Update day streak on mount
  useEffect(() => {
    setProgress(prev => updateDayStreak(prev));
  }, []);

  // Keep the document in sync with the theme bought in the Shop
  useEffect(() => {
    applyTheme(progress.selectedTheme);
  }, [progress.selectedTheme]);

  // Check for new achievements
  const checkAchievements = useCallback((updatedProgress) => {
    const current = updatedProgress.achievements || [];
    const newlyUnlocked = [];
    
    for (const achievement of achievementsList) {
      if (!current.includes(achievement.id) && achievement.condition(updatedProgress)) {
        newlyUnlocked.push(achievement);
      }
    }
    
    if (newlyUnlocked.length > 0) {
      const newAchievementIds = newlyUnlocked.map(a => a.id);
      // Show the first new achievement as toast
      setNewAchievement(newlyUnlocked[0]);
      setTimeout(() => setNewAchievement(null), 4000);
      return { ...updatedProgress, achievements: [...current, ...newAchievementIds] };
    }
    
    return updatedProgress;
  }, []);

  const addPoints = useCallback((points) => {
    setScorePopup(points * activeMultiplier(progressRef.current));
    setTimeout(() => setScorePopup(null), 1200);

    setProgress(prev => {
      const updated = {
        ...prev,
        totalScore: prev.totalScore + points * activeMultiplier(prev),
      };
      // Update level
      const level = getCurrentLevel(updated.wordsStudied);
      updated.currentLevel = level.level;
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const handleCorrectAnswer = useCallback((word, attempt = 1, usedHint = false) => {
    const points = calculatePoints(attempt, usedHint);

    setProgress(prev => {
      const multiplier = activeMultiplier(prev);
      let updated = recordWordResult(prev, word, true);
      updated.totalScore += points * multiplier;

      // Check streak bonus
      const streakBonus = checkStreakBonus(updated.currentStreak);
      if (streakBonus > 0) {
        updated.totalScore += streakBonus * multiplier;
      }

      const level = getCurrentLevel(updated.wordsStudied);
      updated.currentLevel = level.level;
      updated = checkAchievements(updated);

      return updated;
    });

    const currentProgress = progressRef.current;
    const streakBonusNow = checkStreakBonus((currentProgress.currentStreak || 0) + 1);
    setScorePopup((points + streakBonusNow) * activeMultiplier(currentProgress));
    setTimeout(() => setScorePopup(null), 1200);
  }, [checkAchievements]);

  const handleWrongAnswer = useCallback((word) => {
    setProgress(prev => {
      let updated = recordWordResult(prev, word, false);
      return updated;
    });
  }, []);

  const addExploredCategory = useCallback((categoryId) => {
    setProgress(prev => {
      const explored = prev.exploredCategories || [];
      if (explored.includes(categoryId)) return prev;
      const updated = {
        ...prev,
        exploredCategories: [...explored, categoryId],
        categoriesExplored: explored.length + 1,
      };
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const completeGame = useCallback((gameType) => {
    setProgress(prev => {
      const multiplier = activeMultiplier(prev);
      const gamesCompleted = { ...prev.gamesCompleted };
      gamesCompleted[gameType] = (gamesCompleted[gameType] || 0) + 1;

      // Esta partida consome uma das partidas do multiplicador comprado
      const remainingMultiplierGames = Math.max(0, (prev.multiplierGames || 0) - 1);

      let updated = {
        ...prev,
        gamesCompleted,
        totalScore: prev.totalScore + POINTS.PHASE_COMPLETION * multiplier,
        lastGame: gameType,
        multiplierGames: remainingMultiplierGames,
        pointsMultiplier: remainingMultiplierGames > 0 ? prev.pointsMultiplier : 1,
      };

      updated = checkAchievements(updated);
      return updated;
    });

    setScorePopup(POINTS.PHASE_COMPLETION * activeMultiplier(progressRef.current));
    setTimeout(() => setScorePopup(null), 1200);
  }, [checkAchievements]);

  const completeSentence = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, sentencesCompleted: (prev.sentencesCompleted || 0) + 1 };
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const completeConversation = useCallback(() => {
    setProgress(prev => {
      const updated = { ...prev, conversationsCompleted: (prev.conversationsCompleted || 0) + 1 };
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const completeDailyChallenge = useCallback(() => {
    setProgress(prev => {
      const updated = {
        ...prev,
        dailyChallengesCompleted: (prev.dailyChallengesCompleted || 0) + 1,
        lastDailyChallengeDate: new Date().toDateString(),
        totalScore: prev.totalScore + POINTS.DAILY_CHALLENGE,
      };
      return checkAchievements(updated);
    });
    
    setScorePopup(POINTS.DAILY_CHALLENGE);
    setTimeout(() => setScorePopup(null), 1200);
  }, [checkAchievements]);

  const incrementReviewed = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      wordsReviewed: (prev.wordsReviewed || 0) + 1,
    }));
  }, []);

  const buyShopItem = useCallback((item) => {
    setProgress(prev => {
      const isConsumable = item.category === 'powerup' || item.type === 'hints';
      if (!isConsumable && (prev.shopItems || []).includes(item.id)) return prev;
      if (prev.totalScore < item.price) return prev;
      
      let updated = {
        ...prev,
        totalScore: prev.totalScore - item.price,
        shopItems: [...(prev.shopItems || []), item.id],
        shopPurchases: (prev.shopPurchases || 0) + 1,
      };
      
      // Apply item effects
      if (item.type === 'hints') {
        updated.hintsAvailable = (updated.hintsAvailable || 0) + item.value;
      }
      if (item.type === 'avatar') {
        updated.selectedAvatar = item.value;
      }
      if (item.type === 'theme') {
        updated.selectedTheme = item.value;
      }
      if (item.type === 'multiplier') {
        updated.pointsMultiplier = item.value;
        updated.multiplierGames = 1; // Lasts for 1 game
      }
      
      updated = checkAchievements(updated);
      return updated;
    });
  }, [checkAchievements]);

  // Troca entre os temas já adquiridos (o padrão está sempre liberado)
  const setTheme = useCallback((themeId) => {
    setProgress(prev => ({ ...prev, selectedTheme: themeId }));
  }, []);

  // Lê pelo ref para manter a identidade estável, como as demais ações
  const consumeHint = useCallback(() => {
    if ((progressRef.current.hintsAvailable || 0) <= 0) return false;
    setProgress(prev => ({
      ...prev,
      hintsAvailable: Math.max(0, (prev.hintsAvailable || 0) - 1),
    }));
    return true;
  }, []);

  const resetAllProgress = useCallback(() => {
    clearStorage();
    setProgress(loadProgress());
  }, []);

  const value = {
    progress,
    newAchievement,
    scorePopup,
    addPoints,
    handleCorrectAnswer,
    handleWrongAnswer,
    addExploredCategory,
    completeGame,
    completeSentence,
    completeConversation,
    completeDailyChallenge,
    incrementReviewed,
    buyShopItem,
    setTheme,
    consumeHint,
    resetAllProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export default useProgress;
