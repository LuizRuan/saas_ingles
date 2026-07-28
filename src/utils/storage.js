// Abstração do localStorage para persistência do progresso

import { resolveWordKey, mergeStats } from './wordKey';

const STORAGE_KEY = 'englishplay_progress';
const SETTINGS_KEY = 'englishplay_settings';

const defaultProgress = {
  totalScore: 0,
  currentLevel: 1,
  wordsLearned: 0,
  wordsStudied: 0,
  wordsReviewed: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
  currentStreak: 0,
  dayStreak: 0,
  lastStudyDate: null,
  sentencesCompleted: 0,
  conversationsCompleted: 0,
  dailyChallengesCompleted: 0,
  categoriesExplored: 0,
  achievements: [],
  gamesCompleted: {
    memory: 0,
    hangman: 0,
    wordBuilder: 0,
    sentenceBuilder: 0,
    translation: 0,
    fillBlanks: 0,
    trueFalse: 0,
    listening: 0,
  },
  // Vocabulário: { [word.en canônico]: { correct, wrong, lastSeen, timestamps, learned } }
  wordStats: {},
  // Frases e lacunas — mesmo formato, mas fora da contagem de "palavras estudadas"
  phraseStats: {},
  // Track error history for review
  errorHistory: [],
  // Categories the user has explored
  exploredCategories: [],
  // Last game accessed
  lastGame: null,
  // Daily challenge tracking
  lastDailyChallengeDate: null,
  dailyChallengeProgress: null,
  // Shop state
  shopItems: [],
  shopPurchases: 0,
  hintsAvailable: 0,
  selectedAvatar: null,
  selectedTheme: 'default',
  // Multiplicador comprado na Loja: vale pelas próximas `multiplierGames` partidas
  pointsMultiplier: 1,
  multiplierGames: 0,
};

const defaultSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  autoPronounce: true,
};

// Separa o balde antigo (que misturava palavras, frases e lacunas) em
// wordStats canônico + phraseStats, fundindo grafias duplicadas do mesmo item
// ("Good morning" e "Good morning!"). Idempotente: rodar de novo não muda nada.
const migrateStats = (progress) => {
  const wordStats = {};
  const phraseStats = { ...(progress.phraseStats || {}) };

  for (const [rawKey, stats] of Object.entries(progress.wordStats || {})) {
    const canonical = resolveWordKey(rawKey);
    if (canonical) {
      wordStats[canonical] = mergeStats(wordStats[canonical], stats);
    } else {
      phraseStats[rawKey] = mergeStats(phraseStats[rawKey], stats);
    }
  }

  return {
    ...progress,
    wordStats,
    phraseStats,
    wordsStudied: Object.keys(wordStats).length,
    wordsLearned: Object.values(wordStats).filter(s => (s.correct || 0) >= 3).length,
  };
};

export const loadProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...defaultProgress };
    const parsed = JSON.parse(data);
    return migrateStats({ ...defaultProgress, ...parsed });
  } catch {
    return { ...defaultProgress };
  }
};

export const saveProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
};

export const resetProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not reset progress:', e);
  }
};

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return { ...defaultSettings };

    // `theme` era uma chave morta aqui — o tema mora em progress.selectedTheme.
    // Desestruturar as duas antigas impede que voltem a ser gravadas.
    const { autoPronouce, theme: _theme, ...stored } = JSON.parse(data);
    const settings = { ...defaultSettings, ...stored };

    // Migração: a chave era gravada com erro de digitação ("autoPronouce").
    // Preserva a escolha de quem já usava o app antes da correção.
    if (typeof autoPronouce === 'boolean' && stored.autoPronounce === undefined) {
      settings.autoPronounce = autoPronouce;
    }

    return settings;
  } catch {
    return { ...defaultSettings };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings:', e);
  }
};

export const updateDayStreak = (progress) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (progress.lastStudyDate === today) {
    return progress; // Already studied today
  }
  
  const updated = { ...progress, lastStudyDate: today };
  
  if (progress.lastStudyDate === yesterday) {
    updated.dayStreak = (progress.dayStreak || 0) + 1;
  } else if (progress.lastStudyDate !== today) {
    updated.dayStreak = 1;
  }
  
  return updated;
};
