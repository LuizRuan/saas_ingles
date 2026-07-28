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
    whoKnowsMore: 0,
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
  // Usos de +10s guardados para o modo Contra o Relógio (não segundos soltos)
  extraTimeAvailable: 0,
  selectedAvatar: null,
  selectedTheme: 'default',
  // Apelido de convidado para o duelo humano de "Quem Sabe Mais?" — não tem
  // ligação com o sistema de Login/Cadastro (CLAUDE.md separa os dois de
  // propósito). null até a pessoa entrar na fila pela primeira vez.
  displayName: null,
  // Multiplicador comprado na Loja: vale pelas próximas `multiplierGames` partidas
  pointsMultiplier: 1,
  multiplierGames: 0,
};

const defaultSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  autoPronounce: true,
};

// ---------------------------------------------------------------------------
// Saneamento: o localStorage é ENTRADA NÃO CONFIÁVEL.
//
// Qualquer extensão do navegador, um XSS ou o próprio usuário pelo DevTools
// pode reescrever esse blob. Hoje o pior caso é alguém inflar a própria
// pontuação — irrelevante, porque não há servidor nem conta. O que importa é
// não deixar valores absurdos (NaN, Infinity, objetos onde se espera número,
// strings gigantes) chegarem à renderização e quebrarem a tela.
//
// Quando existir login, esta função NÃO substitui validação no servidor:
// nada que venha daqui pode virar decisão de autorização ou pontuação oficial.
// ---------------------------------------------------------------------------

const MAX_CHAVE = 200;      // tamanho de uma palavra/frase
const MAX_ENTRADAS = 5000;  // teto de itens por balde de estatística
const MAX_NUMERO = 1e12;

const numero = (v, padrao = 0, { min = 0, max = MAX_NUMERO } = {}) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return padrao;
  return Math.min(max, Math.max(min, n));
};

const inteiro = (v, padrao = 0, limites) => Math.trunc(numero(v, padrao, limites));

const booleano = (v, padrao) => (typeof v === 'boolean' ? v : padrao);

const texto = (v, padrao = null) =>
  typeof v === 'string' ? v.slice(0, MAX_CHAVE) : padrao;

const lista = (v) => (Array.isArray(v) ? v : []);

const objeto = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) ? v : {};

const saneiaEstatistica = (s) => {
  const o = objeto(s);
  return {
    correct: inteiro(o.correct, 0),
    wrong: inteiro(o.wrong, 0),
    lastSeen: o.lastSeen == null ? null : inteiro(o.lastSeen, 0),
    timestamps: lista(o.timestamps).slice(-500).map(t => inteiro(t, 0)),
    ...(o.learned ? { learned: true } : {}),
  };
};

const saneiaBalde = (v) => {
  const saneado = {};
  for (const [chave, valor] of Object.entries(objeto(v)).slice(0, MAX_ENTRADAS)) {
    if (typeof chave !== 'string' || !chave || chave.length > MAX_CHAVE) continue;
    saneado[chave] = saneiaEstatistica(valor);
  }
  return saneado;
};

const saneiaProgresso = (bruto) => {
  const p = objeto(bruto);
  const jogos = objeto(p.gamesCompleted);

  return {
    ...defaultProgress,
    totalScore: inteiro(p.totalScore, 0),
    currentLevel: inteiro(p.currentLevel, 1, { min: 1, max: 100 }),
    wordsLearned: inteiro(p.wordsLearned, 0),
    wordsStudied: inteiro(p.wordsStudied, 0),
    wordsReviewed: inteiro(p.wordsReviewed, 0),
    totalCorrect: inteiro(p.totalCorrect, 0),
    totalWrong: inteiro(p.totalWrong, 0),
    bestStreak: inteiro(p.bestStreak, 0),
    currentStreak: inteiro(p.currentStreak, 0),
    dayStreak: inteiro(p.dayStreak, 0),
    lastStudyDate: texto(p.lastStudyDate),
    sentencesCompleted: inteiro(p.sentencesCompleted, 0),
    conversationsCompleted: inteiro(p.conversationsCompleted, 0),
    dailyChallengesCompleted: inteiro(p.dailyChallengesCompleted, 0),
    categoriesExplored: inteiro(p.categoriesExplored, 0),
    achievements: lista(p.achievements).filter(a => typeof a === 'string').slice(0, 500),
    gamesCompleted: Object.fromEntries(
      Object.keys(defaultProgress.gamesCompleted).map(k => [k, inteiro(jogos[k], 0)])
    ),
    wordStats: saneiaBalde(p.wordStats),
    phraseStats: saneiaBalde(p.phraseStats),
    errorHistory: lista(p.errorHistory).slice(-100).map(e => ({
      word: texto(objeto(e).word, ''),
      timestamp: inteiro(objeto(e).timestamp, 0),
    })),
    exploredCategories: lista(p.exploredCategories).filter(c => typeof c === 'string').slice(0, 200),
    lastGame: texto(p.lastGame),
    lastDailyChallengeDate: texto(p.lastDailyChallengeDate),
    dailyChallengeProgress: p.dailyChallengeProgress ?? null,
    shopItems: lista(p.shopItems).filter(i => typeof i === 'string').slice(0, 500),
    shopPurchases: inteiro(p.shopPurchases, 0),
    hintsAvailable: inteiro(p.hintsAvailable, 0, { min: 0, max: 100000 }),
    extraTimeAvailable: inteiro(p.extraTimeAvailable, 0, { min: 0, max: 100000 }),
    selectedAvatar: texto(p.selectedAvatar),
    selectedTheme: texto(p.selectedTheme, 'default') ?? 'default',
    // Cap próprio de 20: este texto é mostrado a um estranho no duelo, não só
    // usado localmente — mais estreito que o MAX_CHAVE genérico de 200.
    displayName: texto(p.displayName)?.slice(0, 20) ?? null,
    // Multiplicador é o campo mais sensível a lixo: limitar a faixa evita
    // pontuação explodindo caso alguém escreva 1e9 aqui.
    pointsMultiplier: numero(p.pointsMultiplier, 1, { min: 1, max: 10 }),
    multiplierGames: inteiro(p.multiplierGames, 0, { min: 0, max: 100 }),
  };
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
    // Sanear ANTES de migrar: a migração assume tipos corretos
    return migrateStats(saneiaProgresso(JSON.parse(data)));
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
    const { autoPronouce, theme: _theme, ...stored } = objeto(JSON.parse(data));

    // Só booleanos entram: nada mais é aceito deste blob (entrada não confiável)
    const settings = {
      soundEnabled: booleano(stored.soundEnabled, defaultSettings.soundEnabled),
      animationsEnabled: booleano(stored.animationsEnabled, defaultSettings.animationsEnabled),
      autoPronounce: booleano(stored.autoPronounce, defaultSettings.autoPronounce),
    };

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
