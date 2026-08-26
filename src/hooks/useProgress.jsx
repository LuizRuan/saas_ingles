import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loadProgress, saveProgress, resetProgress as clearStorage, updateDayStreak, sanitizeProgress } from '../utils/storage';
import { switchCourse, withCourseStats } from '../utils/courseProgress';
import { calculatePoints, checkStreakBonus, POINTS } from '../utils/scoring';
import { recordWordResult } from '../utils/reviewSystem';
import { getCurrentLevel } from '../utils/levelSystem';
import { applyTheme } from '../utils/appearance';
import { achievementsList } from '../data/achievements';
import { getTodayDateString } from '../utils/dailyChallenge';
import { useAuthProfile } from './useAuthProfile';
import { updateProgressRequest } from '../utils/authClient';
import { appendRecentSentenceIds } from '../utils/sentenceCatalog';
import { updateSentenceSkill } from '../utils/sentenceSkill';
import { updateSentenceReviewQueue } from '../utils/sentenceReview';
import { splitSentenceIntoWords } from '../utils/sentenceWords';
import { appendRecentMemoryWords } from '../utils/memoryRecent';
import { appendRecentHangmanWords } from '../utils/hangmanRecent';
import { updateMemoryStats } from '../utils/memoryPerformance';
import { updateMemoryReviewQueue } from '../utils/memoryReview';
import { updateMemorySkill } from '../utils/memorySkill';
import { updateHangmanStats } from '../utils/hangmanPerformance';
import { updateHangmanSkill } from '../utils/hangmanSkill';
import { updateHangmanReviewQueue } from '../utils/hangmanReview';
import { appendRecentWordBuilderWords } from '../utils/wordBuilderRecent';
import { updateWordBuilderStats } from '../utils/wordBuilderPerformance';
import { updateWordBuilderSkill } from '../utils/wordBuilderSkill';
import { updateWordBuilderReviewQueue } from '../utils/wordBuilderReview';

const ProgressContext = createContext(null);

// Multiplicador da Loja: só vale enquanto restarem partidas (multiplierGames).
const activeMultiplier = (progress) =>
  (progress.multiplierGames || 0) > 0 ? (progress.pointsMultiplier || 1) : 1;

// Quanto vale cada uso do item "Tempo Extra" da Loja. progress.extraTimeAvailable
// guarda USOS, não segundos — é esta constante que os converte.
export const EXTRA_TIME_SECONDS = 10;

const CELEBRATION_DURATION_MS = {
  confetti: 2100,
  stars: 2200,
  hearts: 2500,
  coins: 2000,
  fireworks: 2400,
  rainbow: 2300,
  bubbles: 2700,
};

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
      CELEBRATION_DURATION_MS[tipo] ?? 2000,
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

  // ─── Sincronização do Progresso com a Nuvem (MongoDB) ───────────────────────
  useEffect(() => {
    if (entryChoice === 'account' && userAccount) {
      if (lastSyncedUserIdRef.current !== userId) {
        lastSyncedUserIdRef.current = userId;

        // Ao criar conta ou logar, o progresso mostrado é sempre o da CONTA.
        // O streak é atualizado imediatamente na entrada do site e salvo no banco.
        const initial = sanitizeProgress(userAccount.progress);
        const withStreak = updateDayStreak(initial);
        const withAchievements = checkAchievements(withStreak);
        setProgress(withAchievements);

        // Se o dia avançou ou o streak mudou, persiste no banco imediatamente
        if (withAchievements.lastStudyDate !== initial.lastStudyDate || withAchievements.dayStreak !== initial.dayStreak) {
          updateProgressRequest(withCourseStats(withAchievements)).catch(() => {});
        }
      }
    } else if (entryChoice !== 'account' && lastSyncedUserIdRef.current !== null) {
      lastSyncedUserIdRef.current = null;
      const initial = loadProgress();
      const withStreak = updateDayStreak(initial);
      const withAchievements = checkAchievements(withStreak);
      setProgress(withAchievements);
    }
  }, [entryChoice, userAccount, userId, checkAchievements]);

  // ─── Verificação Diária Automática por Acesso (Login / Virada de Meia-Noite) ───
  useEffect(() => {
    const handleDailyCheck = () => {
      setProgress(prev => {
        const today = new Date().toDateString();
        if (prev.lastStudyDate === today) return prev;
        const updated = updateDayStreak(prev);
        const finalProgress = checkAchievements(updated);
        if (entryChoice === 'account' && lastSyncedUserIdRef.current) {
          updateProgressRequest(withCourseStats(finalProgress)).catch(() => {});
        }
        return finalProgress;
      });
    };

    handleDailyCheck();

    document.addEventListener('visibilitychange', handleDailyCheck);
    window.addEventListener('focus', handleDailyCheck);
    return () => {
      document.removeEventListener('visibilitychange', handleDailyCheck);
      window.removeEventListener('focus', handleDailyCheck);
    };
  }, [entryChoice, checkAchievements]);

  // Save to localStorage e envia alterações ao servidor em background (debounce)
  useEffect(() => {
    saveProgress(progress);

    if (entryChoice === 'account' && lastSyncedUserIdRef.current) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        // withCourseStats aqui também: o que sobe pro servidor alimenta o
        // ranking por idioma, e mandar o índice defasado faria a tabela
        // mostrar a contagem do último carregamento da página.
        updateProgressRequest(withCourseStats(progressRef.current)).catch(() => {});
      }, 1500);
    }
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [progress, entryChoice]);

  // Keep the document in sync with the theme bought in the Shop
  useEffect(() => {
    applyTheme(progress.selectedTheme);
  }, [progress.selectedTheme]);

  const addPoints = useCallback((points) => {
    setScorePopup(points * activeMultiplier(progressRef.current));
    setTimeout(() => setScorePopup(null), 1200);

    setProgress(prev => {
      const updated = {
        ...prev,
        totalScore: prev.totalScore + points * activeMultiplier(prev),
      };
      // Update level
      const level = getCurrentLevel(updated.wordsStudied, updated.activeCourse);
      updated.currentLevel = level.level;
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const handleCorrectAnswer = useCallback((word, attempt = 1, usedHint = false, pointsOverride = null) => {
    const points = calculatePoints(attempt, usedHint, pointsOverride);

    setProgress(prev => {
      const multiplier = activeMultiplier(prev);
      let updated = recordWordResult(prev, word, true);
      updated = updateDayStreak(updated);
      updated.totalScore += points * multiplier;

      // Check streak bonus
      const streakBonus = checkStreakBonus(updated.currentStreak);
      if (streakBonus > 0) {
        updated.totalScore += streakBonus * multiplier;
      }

      const level = getCurrentLevel(updated.wordsStudied, updated.activeCourse);
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

  const completeGame = useCallback((gameType, bonusOverride = null) => {
    const currentMultiplier = activeMultiplier(progressRef.current);
    const completionBonus = (typeof bonusOverride === 'number') ? bonusOverride : POINTS.PHASE_COMPLETION;

    setProgress(prev => {
      const multiplier = activeMultiplier(prev);
      const gamesCompleted = { ...prev.gamesCompleted };
      gamesCompleted[gameType] = (gamesCompleted[gameType] || 0) + 1;

      // Esta partida consome uma das partidas do multiplicador comprado
      const remainingMultiplierGames = Math.max(0, (prev.multiplierGames || 0) - 1);

      let updated = {
        ...prev,
        gamesCompleted,
        totalScore: prev.totalScore + completionBonus * multiplier,
        lastGame: gameType,
        multiplierGames: remainingMultiplierGames,
        pointsMultiplier: remainingMultiplierGames > 0 ? prev.pointsMultiplier : 1,
      };

      updated = updateDayStreak(updated);
      updated = checkAchievements(updated);
      return updated;
    });

    setScorePopup(completionBonus * currentMultiplier);
    setTimeout(() => setScorePopup(null), 1200);
    dispararCelebracao('fireworks');
  }, [checkAchievements, dispararCelebracao]);

  const completeSentence = useCallback(() => {
    setProgress(prev => {
      let updated = { ...prev, sentencesCompleted: (prev.sentencesCompleted || 0) + 1 };
      updated = updateDayStreak(updated);
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const rememberSentenceIds = useCallback((sentenceIds) => {
    setProgress(prev => ({
      ...prev,
      recentSentenceIds: appendRecentSentenceIds(prev.recentSentenceIds, sentenceIds),
    }));
  }, []);

  const recordSentenceBuilderResult = useCallback((sentence, correct, metrics = {}) => {
    setProgress(prev => {
      const result = {
        sentenceId: sentence.id,
        difficulty: sentence.difficulty,
        wordCount: splitSentenceIntoWords(sentence).length,
        correct,
        ...metrics,
      };
      return {
        ...prev,
        sentenceBuilderSkill: updateSentenceSkill(prev.sentenceBuilderSkill, result),
        sentenceReviewQueue: updateSentenceReviewQueue(
          prev.sentenceReviewQueue,
          sentence,
          correct,
          prev.gamesCompleted?.sentenceBuilder || 0,
        ),
      };
    });
  }, []);

  const rememberMemoryWords = useCallback((words) => {
    setProgress(prev => ({
      ...prev,
      recentMemoryWordKeys: appendRecentMemoryWords(prev.recentMemoryWordKeys, words),
    }));
  }, []);

  const rememberHangmanWords = useCallback((words) => {
    setProgress(prev => ({
      ...prev,
      recentHangmanWordKeys: appendRecentHangmanWords(prev.recentHangmanWordKeys, words),
    }));
  }, []);

  const rememberWordBuilderWords = useCallback((words) => {
    setProgress(prev => ({
      ...prev,
      recentWordBuilderKeys: appendRecentWordBuilderWords(prev.recentWordBuilderKeys, words),
    }));
  }, []);

  const completeWordBuilderGame = useCallback((wordResults, result) => {
    const currentMultiplier = activeMultiplier(progressRef.current);
    const points = Math.max(0, Number(result.points) || 0);
    setProgress(prev => {
      let updated = {
        ...prev,
        wordBuilderStats: updateWordBuilderStats(prev.wordBuilderStats, wordResults),
        wordBuilderSkill: updateWordBuilderSkill(prev.wordBuilderSkill, result),
        wordBuilderReviewQueue: updateWordBuilderReviewQueue(
          prev.wordBuilderReviewQueue,
          wordResults,
          prev.gamesCompleted?.wordBuilder || 0,
        ),
      };
      for (const wordResult of wordResults) {
        if (!wordResult.won || wordResult.needsReview) {
          updated = recordWordResult(updated, wordResult.word.en, false);
        }
        if (wordResult.won) updated = recordWordResult(updated, wordResult.word.en, true);
      }
      const gamesCompleted = { ...updated.gamesCompleted };
      gamesCompleted.wordBuilder = (gamesCompleted.wordBuilder || 0) + 1;
      const remainingMultiplierGames = Math.max(0, (updated.multiplierGames || 0) - 1);
      updated = {
        ...updated,
        gamesCompleted,
        totalScore: updated.totalScore + (points * activeMultiplier(updated)),
        lastGame: 'wordBuilder',
        multiplierGames: remainingMultiplierGames,
        pointsMultiplier: remainingMultiplierGames > 0 ? updated.pointsMultiplier : 1,
      };
      updated.currentLevel = getCurrentLevel(updated.wordsStudied, updated.activeCourse).level;
      updated = updateDayStreak(updated);
      return checkAchievements(updated);
    });
    if (points > 0) {
      setScorePopup(points * currentMultiplier);
      setTimeout(() => setScorePopup(null), 1200);
    }
    if (result.correctCount > 0) dispararCelebracao('fireworks');
  }, [checkAchievements, dispararCelebracao]);

  const completeHangmanGame = useCallback((wordResult, result) => {
    const currentMultiplier = activeMultiplier(progressRef.current);
    const points = Math.max(0, Number(result.points) || 0);
    setProgress(prev => {
      let updated = {
        ...prev,
        hangmanStats: updateHangmanStats(prev.hangmanStats, wordResult),
        hangmanSkill: updateHangmanSkill(prev.hangmanSkill, result),
        hangmanReviewQueue: updateHangmanReviewQueue(
          prev.hangmanReviewQueue,
          wordResult,
          prev.gamesCompleted?.hangman || 0,
        ),
      };
      if (!wordResult.won || wordResult.needsReview) {
        updated = recordWordResult(updated, wordResult.word.en, false);
      }
      if (wordResult.won) updated = recordWordResult(updated, wordResult.word.en, true);

      const gamesCompleted = { ...updated.gamesCompleted };
      gamesCompleted.hangman = (gamesCompleted.hangman || 0) + 1;
      const remainingMultiplierGames = Math.max(0, (updated.multiplierGames || 0) - 1);
      updated = {
        ...updated,
        gamesCompleted,
        totalScore: updated.totalScore + (points * activeMultiplier(updated)),
        lastGame: 'hangman',
        multiplierGames: remainingMultiplierGames,
        pointsMultiplier: remainingMultiplierGames > 0 ? updated.pointsMultiplier : 1,
      };
      updated.currentLevel = getCurrentLevel(updated.wordsStudied, updated.activeCourse).level;
      updated = updateDayStreak(updated);
      return checkAchievements(updated);
    });
    if (points > 0) {
      setScorePopup(points * currentMultiplier);
      setTimeout(() => setScorePopup(null), 1200);
    }
    if (result.won) dispararCelebracao('fireworks');
  }, [checkAchievements, dispararCelebracao]);

  const completeMemoryGame = useCallback((wordResults, result) => {
    const currentMultiplier = activeMultiplier(progressRef.current);
    setProgress(prev => {
      let updated = {
        ...prev,
        memoryStats: updateMemoryStats(prev.memoryStats, wordResults),
        memoryReviewQueue: updateMemoryReviewQueue(
          prev.memoryReviewQueue,
          wordResults,
          prev.gamesCompleted?.memory || 0,
        ),
        memoryGameSkill: updateMemorySkill(prev.memoryGameSkill, result),
      };
      for (const result of wordResults) {
        // Uma associação difícil registra o erro de memória e, em seguida, o
        // acerto final. Assim a palavra foi estudada sem fingir desempenho perfeito.
        if (result.needsReview) updated = recordWordResult(updated, result.word.en, false);
        updated = recordWordResult(updated, result.word.en, true);
      }
      const gamesCompleted = { ...updated.gamesCompleted };
      gamesCompleted.memory = (gamesCompleted.memory || 0) + 1;
      const remainingMultiplierGames = Math.max(0, (updated.multiplierGames || 0) - 1);
      updated = {
        ...updated,
        gamesCompleted,
        totalScore: updated.totalScore + (result.points * activeMultiplier(updated)),
        lastGame: 'memory',
        multiplierGames: remainingMultiplierGames,
        pointsMultiplier: remainingMultiplierGames > 0 ? updated.pointsMultiplier : 1,
      };
      updated.currentLevel = getCurrentLevel(updated.wordsStudied, updated.activeCourse).level;
      updated = updateDayStreak(updated);
      return checkAchievements(updated);
    });
    setScorePopup(result.points * currentMultiplier);
    setTimeout(() => setScorePopup(null), 1200);
    dispararCelebracao('fireworks');
  }, [checkAchievements, dispararCelebracao]);

  const completeConversation = useCallback(() => {
    setProgress(prev => {
      let updated = { ...prev, conversationsCompleted: (prev.conversationsCompleted || 0) + 1 };
      updated = updateDayStreak(updated);
      return checkAchievements(updated);
    });
  }, [checkAchievements]);

  const completeDailyChallenge = useCallback(() => {
    let awarded = false;
    setProgress(prev => {
      const today = getTodayDateString();
      if (prev.lastDailyChallengeDate === today) return prev;
      awarded = true;
      let updated = {
        ...prev,
        dailyChallengesCompleted: (prev.dailyChallengesCompleted || 0) + 1,
        lastDailyChallengeDate: today,
        totalScore: prev.totalScore + POINTS.DAILY_CHALLENGE,
      };
      updated = updateDayStreak(updated);
      return checkAchievements(updated);
    });
    
    if (awarded) {
      setScorePopup(POINTS.DAILY_CHALLENGE);
      setTimeout(() => setScorePopup(null), 1200);
    }
  }, [checkAchievements]);

  const incrementReviewed = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      wordsReviewed: (prev.wordsReviewed || 0) + 1,
    }));
  }, []);

  const buyShopItem = useCallback((item) => {
    setProgress(prev => {
      const isConsumable = item.category === 'powerup' || item.type === 'hints' || item.category === 'coringa';
      if (!isConsumable && (prev.shopItems || []).includes(item.id)) return prev;
      if (item.category === 'coringa') {
        const ownedCount = (prev.shopItems || []).filter(id => id === item.id).length;
        if (ownedCount >= 3) return prev;
      }
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
      if (item.type === 'title') {
        updated.selectedTitle = item.value;
      }
      if (item.type === 'soundpack') {
        updated.selectedSoundPack = item.value;
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
        updated.pointsMultiplier = Math.max(prev.pointsMultiplier || 1, item.value);
        updated.multiplierGames = (prev.multiplierGames || 0) + 1;
      }
      // type === 'wildcard': apenas armazena em shopItems (cada compra adiciona 1 uso)
      // O consumo é feito durante a partida — useWildcard() remove 1 id de shopItems
      
      updated = checkAchievements(updated);
      return updated;
    });
  }, [checkAchievements]);

  // Marca o prêmio mensal como resgatado. Só grava os 3 campos de
  // rastreamento — moedas e título já foram concedidos por addPoints()/
  // buyShopItem() antes desta chamada, no próprio MonthlyWinnerModal.
  //
  // REGRESSÃO: MonthlyWinnerModal.handleClaim() gravava esses 3 campos direto
  // em localStorage.setItem(), sem passar por setProgress(). O useEffect de
  // auto-persistência do provider (que roda a cada mudança de `progress`,
  // inclusive as disparadas por addPoints/buyShopItem no mesmo clique)
  // sobrescrevia o localStorage com o estado em memória logo em seguida — que
  // não tinha os 3 campos — desfazendo o resgate no ato. Ver storage.js:
  // defaultProgress e saneiaProgresso() também precisaram aprender esses 3
  // campos, senão sanitizeProgress() os apagava em todo load.
  const claimMonthlyReward = useCallback((winnerInfo) => {
    setProgress(prev => ({
      ...prev,
      lastMonthlyRewardMonth: winnerInfo.month,
      pendingMonthlyReward: null,
      isMonthlyChampion: winnerInfo.rank === 1,
    }));
  }, []);

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

  // Remove 1 uso de um coringa do inventário (consome o item).
  // Retorna true se havia pelo menos 1 para consumir.
  const useWildcard = useCallback((wildcardId) => {
    const items = progressRef.current?.shopItems || [];
    const idx = items.indexOf(wildcardId);
    if (idx === -1) return false;

    setProgress(prev => {
      const currentItems = [...(prev.shopItems || [])];
      const i = currentItems.indexOf(wildcardId);
      if (i === -1) return prev;
      currentItems.splice(i, 1); // remove apenas 1 ocorrência
      return { ...prev, shopItems: currentItems };
    });
    return true;
  }, []);

  const resetAllProgress = useCallback(() => {
    clearStorage();
    setProgress(loadProgress());
  }, []);

  const setSelectedAvatar = useCallback((avatar) => {
    setProgress(prev => ({ ...prev, selectedAvatar: avatar }));
  }, []);

  const setSelectedTitle = useCallback((title) => {
    setProgress(prev => ({ ...prev, selectedTitle: title }));
  }, []);

  const setSelectedSoundPack = useCallback((soundPack) => {
    setProgress(prev => ({ ...prev, selectedSoundPack: soundPack }));
  }, []);

  // Troca de idioma. Guarda o progresso do curso que sai e restaura o do que
  // entra (ver courseProgress.js) — quem está no nível 40 em inglês encontra o
  // nível 40 ao voltar, e o espanhol começa do 1 na primeira vez.
  //
  // O `isSwitchingCourse` existe porque a troca precisa terminar de gravar no
  // servidor ANTES de a tela repintar com os números do outro idioma. Sem essa
  // espera, a pessoa via o nível cair pra 1 e — se fechasse o app naquele
  // instante — o servidor ainda teria o estado antigo, misturando os dois.
  const [isSwitchingCourse, setIsSwitchingCourse] = useState(false);

  const setActiveCourse = useCallback(async (courseId) => {
    const atual = progressRef.current;
    if ((atual.activeCourse || 'en-pt') === courseId) return;

    setIsSwitchingCourse(true);
    try {
      // 1) Persiste o curso que está saindo, para nada do que foi jogado nos
      //    últimos segundos se perder no meio da troca (o save normal é
      //    debounced em 1,5s e poderia não ter rodado ainda).
      if (entryChoice === 'account' && lastSyncedUserIdRef.current) {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        await updateProgressRequest(withCourseStats(atual)).catch(() => {});
      }

      // 2) Faz a troca e re-saneia: sanitizeProgress roda migrateStats de novo,
      //    agora resolvendo o vocabulário contra o banco do curso que entrou.
      const trocado = sanitizeProgress(switchCourse(atual, courseId));
      setProgress(trocado);
      saveProgress(trocado);

      // 3) Sobe o estado novo já com os dois históricos dentro.
      if (entryChoice === 'account' && lastSyncedUserIdRef.current) {
        await updateProgressRequest(trocado).catch(() => {});
      }
    } finally {
      setIsSwitchingCourse(false);
    }
  }, [entryChoice]);

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
    rememberSentenceIds,
    recordSentenceBuilderResult,
    rememberMemoryWords,
    rememberHangmanWords,
    rememberWordBuilderWords,
    completeWordBuilderGame,
    completeHangmanGame,
    completeMemoryGame,
    completeConversation,
    completeDailyChallenge,
    incrementReviewed,
    buyShopItem,
    claimMonthlyReward,
    setTheme,
    setSelectedEffect,
    setSelectedAvatar,
    setSelectedTitle,
    setSelectedSoundPack,
    setActiveCourse,
    isSwitchingCourse,
    setDisplayName,
    consumeHint,
    consumeExtraTime,
    consumeTipTranslation,
    useWildcard,
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
