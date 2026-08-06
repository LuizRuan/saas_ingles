import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loadProgress, saveProgress, resetProgress as clearStorage, updateDayStreak, sanitizeProgress, getDefaultProgress } from '../utils/storage';
import { calculatePoints, checkStreakBonus, POINTS } from '../utils/scoring';
import { recordWordResult } from '../utils/reviewSystem';
import { getCurrentLevel } from '../utils/levelSystem';
import { applyTheme } from '../utils/appearance';
import { achievementsList } from '../data/achievements';
import { getTodayDateString } from '../utils/dailyChallenge';
import { useAuthProfile } from './useAuthProfile';
import { updateProgressRequest } from '../utils/authClient';

const ProgressContext = createContext(null);

// Multiplicador da Loja: só vale enquanto restarem partidas (multiplierGames).
const activeMultiplier = (progress) =>
  (progress.multiplierGames || 0) > 0 ? (progress.pointsMultiplier || 1) : 1;

// Quanto vale cada uso do item "Tempo Extra" da Loja. progress.extraTimeAvailable
// guarda USOS, não segundos — é esta constante que os converte.
export const EXTRA_TIME_SECONDS = 10;

export const ProgressProvider = ({ children }) => {
  const auth = useAuthProfile();
  const [progress, setProgress] = useState(() => loadProgress());
  const [newAchievement, setNewAchievement] = useState(null);
  const [scorePopup, setScorePopup] = useState(null);
  const [celebration, setCelebration] = useState(null);

  // Leitura síncrona do progresso atual para as ações abaixo.
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const entryChoice = auth?.entryChoice;
  const userAccount = auth?.profile;
  const userId = userAccount?.id;
  const lastSyncedUserIdRef = useRef(null);
  const syncTimerRef = useRef(null);

  // ─── Sincronização do Progresso com a Nuvem (MongoDB) ───────────────────────
  useEffect(() => {
    if (entryChoice === 'account' && userAccount) {
      if (lastSyncedUserIdRef.current !== userId) {
        lastSyncedUserIdRef.current = userId;
        if (userAccount.progress) {
          // Restaura o progresso do usuário vindo da nuvem/banco de dados
          const cloudProg = sanitizeProgress(userAccount.progress);
          setProgress(cloudProg);
        } else {
          // Conta existente criada antes da nuvem: se tiver progresso no navegador,
          // MIGRA o progresso para a conta e salva imediatamente no banco de dados (MongoDB)!
          const currentLocal = loadProgress();
          const hasExistingProgress = (currentLocal.totalScore || 0) > 0 ||
                                     (currentLocal.currentLevel || 1) > 1 ||
                                     Object.keys(currentLocal.wordStats || {}).length > 0;
          if (hasExistingProgress) {
            setProgress(currentLocal);
            updateProgressRequest(currentLocal).catch(() => {});
          } else {
            // Conta realmente nova e sem histórico prévio: reseta para estado limpo (0)
            const fresh = getDefaultProgress();
            setProgress(fresh);
            updateProgressRequest(fresh).catch(() => {});
          }
        }
      }
    } else if (entryChoice !== 'account' && lastSyncedUserIdRef.current !== null) {
      lastSyncedUserIdRef.current = null;
      setProgress(loadProgress());
    }
  }, [entryChoice, userAccount, userId]);

  // Save to localStorage e envia alterações ao servidor em background (debounce)
  useEffect(() => {
    saveProgress(progress);

    if (entryChoice === 'account' && lastSyncedUserIdRef.current) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        updateProgressRequest(progressRef.current).catch(() => {});
      }, 1500);
    }
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [progress, entryChoice]);

  // Update day streak on mount
  useEffect(() => {
    setProgress(prev => updateDayStreak(prev));
  }, []);

  // Keep the document in sync with the theme bought in the Shop
  useEffect(() => {
    applyTheme(progress.selectedTheme);
  }, [progress.selectedTheme]);

  // Efeitos comprados na Loja. Disparados SEMPRE fora do updater do setProgress:
  // o updater é reexecutado pelo StrictMode e precisa continuar puro.
  const celebrationTimer = useRef(null);
  const idCelebracao = useRef(0);
  const dispararCelebracao = useCallback((tipoFallback) => {
    const p = progressRef.current;
    const comprados = p.shopItems || [];

    // O usuário escolhe qual efeito usar nas Configurações; se não escolheu,
    // usa o tipo passado pelo jogo (comportamento original).
    const tipo = p.selectedEffect || tipoFallback;

    // Só dispara se o efeito escolhido foi comprado
    if (!comprados.includes(tipo)) return;

    if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    setCelebration({ tipo, id: idCelebracao.current++ });
    celebrationTimer.current = setTimeout(
      () => setCelebration(null),
      tipo === 'fireworks' ? 2400 : 2000,
    );
  }, []);

  useEffect(() => () => clearTimeout(celebrationTimer.current), []);

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
    dispararCelebracao('confetti');
  }, [checkAchievements, dispararCelebracao]);

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
    dispararCelebracao('fireworks');
  }, [checkAchievements, dispararCelebracao]);

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
        lastDailyChallengeDate: getTodayDateString(),
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
      if (item.type === 'timer') {
        updated.extraTimeAvailable = (updated.extraTimeAvailable || 0) + item.value;
      }
      if (item.type === 'tip_translation') {
        updated.tipTranslationsAvailable = (updated.tipTranslationsAvailable || 0) + item.value;
      }
      // type === 'effect' (confetti/fireworks) não grava nada além do id em
      // shopItems: quem lê é dispararCelebracao(), que checa a posse ao animar.
      if (item.type === 'avatar') {
        updated.selectedAvatar = item.value;
      }
      if (item.type === 'theme') {
        updated.selectedTheme = item.value;
      }
      // Efeito: ativa imediatamente ao comprar — usuário não precisa ir em
      // Configurações para equipar (pode desativar de lá depois, se quiser).
      if (item.type === 'effect') {
        updated.selectedEffect = item.value;
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

  // Define o efeito visual ativo. Null = desativado.
  const setSelectedEffect = useCallback((effectId) => {
    setProgress(prev => ({ ...prev, selectedEffect: effectId }));
  }, []);

  // Apelido de convidado para o duelo humano — não tem ligação com Login/Cadastro
  const setDisplayName = useCallback((name) => {
    setProgress(prev => ({ ...prev, displayName: name }));
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

  // Gasta um uso do Tempo Extra e devolve quantos segundos o jogo deve somar
  // (0 quando não há estoque). Mesma forma de consumeHint, de propósito.
  const consumeExtraTime = useCallback(() => {
    if ((progressRef.current.extraTimeAvailable || 0) <= 0) return 0;
    setProgress(prev => ({
      ...prev,
      extraTimeAvailable: Math.max(0, (prev.extraTimeAvailable || 0) - 1),
    }));
    return EXTRA_TIME_SECONDS;
  }, []);

  // Gasta um uso de Tradução de Dica. Retorna true se havia estoque, false caso contrário.
  const consumeTipTranslation = useCallback(() => {
    if ((progressRef.current.tipTranslationsAvailable || 0) <= 0) return false;
    setProgress(prev => ({
      ...prev,
      tipTranslationsAvailable: Math.max(0, (prev.tipTranslationsAvailable || 0) - 1),
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
    celebration,
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
    setSelectedEffect,
    setDisplayName,
    consumeHint,
    consumeExtraTime,
    consumeTipTranslation,
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
