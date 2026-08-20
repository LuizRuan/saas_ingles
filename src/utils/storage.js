// Abstração do localStorage para persistência do progresso

import { resolveWordKey, mergeStats } from './wordKey';
import { emptyCourseSnapshot, buildCourseStats, withCourseStats, DEFAULT_COURSE } from './courseProgress';
import { AVAILABLE_COURSES } from '../data/index';

// Cursos que o saneamento aceita em `activeCourse`. Sai de AVAILABLE_COURSES
// para não existirem duas listas de idiomas que precisam ser lembradas juntas:
// antes esta era uma lista literal `['en-pt']`, e liberar o espanhol no seletor
// sem editá-la fazia a escolha voltar pro inglês no reload seguinte — o seletor
// parecia simplesmente não salvar.
//
// REGRESSÃO: NÃO filtrar por `available` aqui. `available: false` em
// AVAILABLE_COURSES é só uma flag visual (mostra "Em breve" no dropdown) —
// quando es-pt ganhou essa flag, filtrar por ela fazia CURSOS_VALIDOS virar
// ['en-pt'] sozinho, e saneiaProgresso() forçava `activeCourse` de volta pro
// inglês toda vez. O efeito colateral era pior do que parecia: quem estava
// em es-pt tinha o INGLÊS real apagado, porque saneiaCursosGuardados() então
// recebia esse 'en-pt' forçado como "curso ativo" e descartava a entrada de
// courseProgress com esse mesmo id — exatamente onde o progresso de inglês
// tinha sido estacionado pelo switchCourse(). Ver courseProgress.test.js.
const CURSOS_VALIDOS = AVAILABLE_COURSES.map(c => c.id);

const STORAGE_KEY = 'englishplay_progress';
const SETTINGS_KEY = 'englishplay_settings';

// Exportado para que outros módulos possam PINAR as chaves em teste (ver
// gamesCatalog.test.js, que confere se todo jogo do catálogo tem contador aqui).
// Não é para ser lido em runtime pelos componentes: quem quer o progresso atual
// usa loadProgress() ou o contexto de useProgress.
export const defaultProgress = {
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
    imageQuiz: 0,
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
  tipTranslationsAvailable: 0,
  // Usos de +10s guardados para o modo Contra o Relógio (não segundos soltos)
  extraTimeAvailable: 0,
  selectedAvatar: null,
  selectedTitle: null,
  selectedSoundPack: 'default',
  selectedTheme: 'default',
  // Apelido de convidado para o duelo humano de "Quem Sabe Mais?" — não tem
  // ligação com o sistema de Login/Cadastro (CLAUDE.md separa os dois de
  // propósito). null até a pessoa entrar na fila pela primeira vez.
  displayName: null,
  // Multiplicador comprado na Loja: vale pelas próximas `multiplierGames` partidas
  pointsMultiplier: 1,
  multiplierGames: 0,
  // Efeito visual ativo selecionado pelo usuário nas Configurações.
  // null = nenhum (desativado), 'confetti' ou 'fireworks' = o efeito escolhido.
  selectedEffect: null,
  // Curso ativo: identifica o par de idiomas que o usuário está estudando.
  // Formato: '<idioma-alvo>-<idioma-fonte>', ex: 'en-pt' = Inglês para Brasileiros.
  // Os stats de vocabulário (wordStats, phraseStats) pertencem a este curso.
  activeCourse: 'en-pt',
  // Histórico dos cursos INATIVOS. O curso ativo mora nos campos planos acima
  // e nunca aqui — ver a invariante em courseProgress.js.
  courseProgress: {},
  // Índice derivado { [curso]: { wordsStudied } } cobrindo TODOS os cursos.
  // Só existe para o servidor conseguir ordenar o ranking por idioma; é
  // recalculado a cada saneamento e nunca deve ser lido pelo cliente.
  courseStats: {},
  // Campeonato Mensal de Níveis (ver src/utils/monthlyReward.js e
  // MonthlyWinnerModal.jsx). `pendingMonthlyReward` é atribuído no fechamento
  // do mês (formato { month, rank, claimed }) e zerado ao resgatar via
  // claimMonthlyReward(); `lastMonthlyRewardMonth` guarda o mês do último
  // resgate para não deixar resgatar duas vezes.
  lastMonthlyRewardMonth: null,
  pendingMonthlyReward: null,
  isMonthlyChampion: false,
};

const defaultSettings = {
  soundEnabled: true,
  musicEnabled: true,
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
// REGRESSÃO: 1e12 ms desde a época é setembro de 2001 — qualquer timestamp
// real de hoje (Date.now() já passa de 1,78e12) era CLAMPADO pra baixo disso
// e depois reprovava o teste de VALID_TIMESTAMP_MIN (nov/2023) logo abaixo,
// virando `null` silenciosamente. Isso quebrava a data "há X dias" da revisão
// E a regra de "aprendida em 2 dias distintos" (`timestamps[]` também passa
// por este teto — todo timestamp clampado colapsa pro MESMO valor, então a
// checagem de dias diferentes nunca via mais de 1 dia distinto depois de
// qualquer reload). 1e15 ms cobre datas até o ano 33658 — grande o bastante
// pra nunca mais estourar, ainda funcionando como teto contra lixo/abuso.
const MAX_NUMERO = 1e15;

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

const VALID_TIMESTAMP_MIN = 1700000000000;

const saneiaEstatistica = (s) => {
  const o = objeto(s);
  const rawLastSeen = o.lastSeen == null ? null : inteiro(o.lastSeen, 0);
  const lastSeen = (rawLastSeen && rawLastSeen > VALID_TIMESTAMP_MIN) ? rawLastSeen : null;

  return {
    correct: inteiro(o.correct, 0),
    wrong: inteiro(o.wrong, 0),
    lastSeen,
    timestamps: lista(o.timestamps).slice(-500).map(t => inteiro(t, 0)),
    ...(o.learned ? { learned: true } : {}),
    // Usado por getWordsToReview pra saber se a resposta mais recente foi um
    // acerto — sem isto, essa informação some a cada reload (ver reviewSystem.js).
    ...(o.lastResult === 'correct' || o.lastResult === 'wrong' ? { lastResult: o.lastResult } : {}),
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

// Saneia UM curso estacionado. Os cursos inativos são entrada não confiável
// igual ao resto do blob, e por serem N eles têm um teto próprio de tamanho —
// senão alguém poderia inflar o localStorage inventando 500 cursos.
const MAX_CURSOS_GUARDADOS = 12;

const saneiaCursoGuardado = (bruto) => {
  const c = objeto(bruto);
  const jogos = objeto(c.gamesCompleted);
  const vazio = emptyCourseSnapshot();

  return {
    ...vazio,
    currentLevel: inteiro(c.currentLevel, 1, { min: 1, max: 100 }),
    wordsLearned: inteiro(c.wordsLearned, 0),
    wordsStudied: inteiro(c.wordsStudied, 0),
    wordsReviewed: inteiro(c.wordsReviewed, 0),
    totalCorrect: inteiro(c.totalCorrect, 0),
    totalWrong: inteiro(c.totalWrong, 0),
    bestStreak: inteiro(c.bestStreak, 0),
    currentStreak: inteiro(c.currentStreak, 0),
    sentencesCompleted: inteiro(c.sentencesCompleted, 0),
    conversationsCompleted: inteiro(c.conversationsCompleted, 0),
    dailyChallengesCompleted: inteiro(c.dailyChallengesCompleted, 0),
    categoriesExplored: inteiro(c.categoriesExplored, 0),
    gamesCompleted: Object.fromEntries(
      Object.keys(defaultProgress.gamesCompleted).map(k => [k, inteiro(jogos[k], 0)])
    ),
    wordStats: saneiaBalde(c.wordStats),
    phraseStats: saneiaBalde(c.phraseStats),
    errorHistory: lista(c.errorHistory).slice(-100).map(e => ({
      word: texto(objeto(e).word, ''),
      timestamp: inteiro(objeto(e).timestamp, 0),
    })),
    exploredCategories: lista(c.exploredCategories).filter(x => typeof x === 'string').slice(0, 200),
    lastGame: texto(c.lastGame),
    lastDailyChallengeDate: texto(c.lastDailyChallengeDate),
    dailyChallengeProgress: c.dailyChallengeProgress ?? null,
  };
};

const saneiaCursosGuardados = (bruto, cursoAtivo) => {
  const saneado = {};
  for (const [id, dados] of Object.entries(objeto(bruto)).slice(0, MAX_CURSOS_GUARDADOS)) {
    // Só cursos que existem de verdade, e nunca o ativo — mantém a invariante
    // de courseProgress.js mesmo se o blob salvo estiver corrompido.
    if (!CURSOS_VALIDOS.includes(id) || id === cursoAtivo) continue;
    saneado[id] = saneiaCursoGuardado(dados);
  }
  return saneado;
};

const getTodayStr = () => new Date().toDateString();

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
};

// pendingMonthlyReward controla uma recompensa em moedas/título — validado
// com mais rigor que um campo qualquer, mesmo sem nada no código hoje
// atribuindo um valor legítimo a ele ainda (ver monthlyReward.js): sem isto,
// alguém poderia forjar `{ rank: 1, month: qualquer coisa }` via devtools.
const saneiaPendingMonthlyReward = (bruto) => {
  if (!bruto || typeof bruto !== 'object') return null;
  const month = texto(bruto.month);
  const rank = inteiro(bruto.rank, 0);
  if (!month || rank < 1 || rank > 3) return null;
  return { month, rank, claimed: booleano(bruto.claimed, false) };
};

const saneiaProgresso = (bruto) => {
  const p = objeto(bruto);
  const jogos = objeto(p.gamesCompleted);

  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const lastStudy = texto(p.lastStudyDate);
  let dayStreak = inteiro(p.dayStreak, 0);

  // Se o último dia de estudo for mais antigo que ontem, o streak expira e volta para 0
  if (lastStudy && lastStudy !== today && lastStudy !== yesterday) {
    dayStreak = 0;
  }

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
    dayStreak,
    lastStudyDate: lastStudy,
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
    tipTranslationsAvailable: inteiro(p.tipTranslationsAvailable, 0, { min: 0, max: 100000 }),
    extraTimeAvailable: inteiro(p.extraTimeAvailable, 0, { min: 0, max: 100000 }),
    selectedAvatar: texto(p.selectedAvatar),
    selectedTitle: texto(p.selectedTitle),
    selectedSoundPack: ['default', 'retro', 'scifi', 'orchestra'].includes(p.selectedSoundPack) ? p.selectedSoundPack : 'default',
    selectedTheme: texto(p.selectedTheme, 'default') ?? 'default',
    // Cap próprio de 20: este texto é mostrado a um estranho no duelo, não só
    // usado localmente — mais estreito que o MAX_CHAVE genérico de 200.
    displayName: texto(p.displayName)?.slice(0, 20) ?? null,
    // Multiplicador é o campo mais sensível a lixo: limitar a faixa evita
    // pontuação explodindo caso alguém escreva 1e9 aqui.
    pointsMultiplier: numero(p.pointsMultiplier, 1, { min: 1, max: 10 }),
    multiplierGames: inteiro(p.multiplierGames, 0, { min: 0, max: 100 }),
    selectedEffect: ['confetti', 'fireworks', 'stars', 'hearts', 'coins', 'rainbow', 'bubbles'].includes(p.selectedEffect) ? p.selectedEffect : null,
    // activeCourse: aceita apenas cursos marcados como disponíveis em
    // AVAILABLE_COURSES (ver CURSOS_VALIDOS no topo). Um curso removido/
    // bloqueado depois volta pro padrão em vez de deixar a pessoa presa
    // num curso sem dados.
    activeCourse: CURSOS_VALIDOS.includes(p.activeCourse) ? p.activeCourse : DEFAULT_COURSE,
    courseProgress: saneiaCursosGuardados(
      p.courseProgress,
      CURSOS_VALIDOS.includes(p.activeCourse) ? p.activeCourse : DEFAULT_COURSE
    ),
    lastMonthlyRewardMonth: texto(p.lastMonthlyRewardMonth),
    pendingMonthlyReward: saneiaPendingMonthlyReward(p.pendingMonthlyReward),
    isMonthlyChampion: booleano(p.isMonthlyChampion, false),
  };
};

// Separa o balde antigo (que misturava palavras, frases e lacunas) em
// wordStats canônico + phraseStats, fundindo grafias duplicadas do mesmo item
// ("Good morning" e "Good morning!"). Idempotente: rodar de novo não muda nada.
const migrateStats = (progress) => {
  // O curso importa: "Hola" é vocabulário em es-pt e lixo em en-pt. Resolver
  // sempre contra o inglês mandava todo o vocabulário espanhol pra phraseStats,
  // que é o balde que NÃO conta para wordsStudied/nível.
  const courseId = progress.activeCourse || DEFAULT_COURSE;
  const wordStats = {};
  const phraseStats = { ...(progress.phraseStats || {}) };

  for (const [rawKey, stats] of Object.entries(progress.wordStats || {})) {
    const canonical = resolveWordKey(rawKey, courseId);
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

export const getDefaultProgress = () => ({ ...defaultProgress });

export const sanitizeProgress = (data) => {
  try {
    if (!data) return getDefaultProgress();
    const sanitized = migrateStats(saneiaProgresso(data));
    // Por último, e sempre: derivar aqui (em vez de deixar quem chama montar)
    // é o que garante que o índice nunca fica velho — migrateStats acabou de
    // recontar wordsStudied, então este é o único ponto em que os dois lados
    // com certeza concordam.
    return { ...sanitized, courseStats: buildCourseStats(sanitized) };
  } catch {
    return getDefaultProgress();
  }
};

export const loadProgress = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultProgress();
    // Sanear ANTES de migrar: a migração assume tipos corretos
    return sanitizeProgress(JSON.parse(data));
  } catch {
    return getDefaultProgress();
  }
};

// Deriva `courseStats` na hora de gravar e DEVOLVE o objeto normalizado, pra
// quem sincroniza com o servidor mandar exatamente o que foi salvo. O índice
// não pode ser calculado só no saneamento: entre um load e outro a pessoa
// responde dezenas de perguntas, e cada uma dessas gravações passa por aqui.
export const saveProgress = (progress) => {
  const normalizado = withCourseStats(progress);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizado));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
  return normalizado;
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
      musicEnabled: booleano(stored.musicEnabled, defaultSettings.musicEnabled),
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
  if (!progress) return progress;
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  
  if (progress.lastStudyDate === today) {
    return progress; // Já estudou e atualizou hoje
  }
  
  const updated = { ...progress, lastStudyDate: today };
  
  if (progress.lastStudyDate === yesterday) {
    updated.dayStreak = (progress.dayStreak || 0) + 1;
  } else {
    updated.dayStreak = 1;
  }
  
  return updated;
};
