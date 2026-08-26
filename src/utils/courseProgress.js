// Progresso separado por curso.
//
// REGRA DE PRODUTO: cada idioma tem o próprio histórico. Quem está no nível 40
// em inglês e abre espanhol pela primeira vez começa no nível 1 — e ao voltar
// pro inglês encontra o nível 40 intacto, exatamente onde parou.
//
// COMO FUNCIONA (e por que não é um refatoramento de tudo):
// os campos "planos" do progresso (wordStats, wordsStudied, gamesCompleted…)
// continuam sendo a VISÃO DO CURSO ATIVO. Nenhum componente precisou mudar:
// `progress.wordsStudied` continua significando "palavras estudadas no curso
// que estou vendo agora". Os cursos inativos ficam estacionados em
// `progress.courseProgress[id]`, e trocar de curso é uma troca de lugar:
// guarda o ativo no mapa, tira o novo do mapa.
//
// INVARIANTE CENTRAL: o curso ATIVO nunca aparece em `courseProgress`.
// Ele vive só nos campos planos. Guardar nos dois lugares criaria duas
// verdades que divergem em silêncio — o tipo de bug que só aparece semanas
// depois, como progresso que "volta no tempo" ao trocar de idioma.
//
// O QUE É POR CURSO vs. O QUE É DA CONTA:
// aprendizado é por curso (vocabulário, nível, acertos, jogos completados).
// Economia e identidade são da conta e atravessam os idiomas (estrelas,
// itens da Loja, tema, avatar, conquistas, dias seguidos) — quem comprou um
// tema em inglês não o perde ao estudar espanhol, e as estrelas são uma
// carteira só.

export const DEFAULT_COURSE = 'en-pt';

// Campos que pertencem ao curso: são guardados/restaurados na troca.
// Qualquer campo NOVO de aprendizado precisa entrar aqui, senão ele vaza
// entre os idiomas (ex.: um contador de acertos que soma inglês + espanhol).
export const COURSE_SCOPED_FIELDS = [
  'currentLevel',
  'wordsLearned',
  'wordsStudied',
  'wordsReviewed',
  'totalCorrect',
  'totalWrong',
  'bestStreak',
  'currentStreak',
  'sentencesCompleted',
  'conversationsCompleted',
  'dailyChallengesCompleted',
  'categoriesExplored',
  'gamesCompleted',
  'wordStats',
  'phraseStats',
  'recentSentenceIds',
  'sentenceBuilderSkill',
  'sentenceReviewQueue',
  'memoryGameSkill',
  'recentMemoryWordKeys',
  'memoryStats',
  'memoryReviewQueue',
  'hangmanSkill',
  'recentHangmanWordKeys',
  'hangmanStats',
  'hangmanReviewQueue',
  'wordBuilderSkill',
  'recentWordBuilderKeys',
  'wordBuilderStats',
  'wordBuilderReviewQueue',
  'errorHistory',
  'exploredCategories',
  'lastGame',
  'lastDailyChallengeDate',
  'dailyChallengeProgress',
];

// Estado zerado de um curso nunca estudado. Precisa bater com os mesmos campos
// de COURSE_SCOPED_FIELDS — um teste pina isso.
export const emptyCourseSnapshot = () => ({
  currentLevel: 1,
  wordsLearned: 0,
  wordsStudied: 0,
  wordsReviewed: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
  currentStreak: 0,
  sentencesCompleted: 0,
  conversationsCompleted: 0,
  dailyChallengesCompleted: 0,
  categoriesExplored: 0,
  gamesCompleted: {},
  wordStats: {},
  phraseStats: {},
  recentSentenceIds: [],
  sentenceBuilderSkill: { rating: 1, attempts: 0, correct: 0, wrong: 0, streak: 0, recentResults: [] },
  sentenceReviewQueue: [],
  memoryGameSkill: { rating: 1, attempts: 0, perfectGames: 0, streak: 0, bestByMode: {}, recentResults: [] },
  recentMemoryWordKeys: [],
  memoryStats: {},
  memoryReviewQueue: [],
  hangmanSkill: { rating: 1, attempts: 0, wins: 0, losses: 0, perfectGames: 0, streak: 0, bestByMode: {}, recentResults: [] },
  recentHangmanWordKeys: [],
  hangmanStats: {},
  hangmanReviewQueue: [],
  wordBuilderSkill: { rating: 1, attempts: 0, correct: 0, wrong: 0, perfectGames: 0, streak: 0, bestByMode: {}, recentResults: [] },
  recentWordBuilderKeys: [],
  wordBuilderStats: {},
  wordBuilderReviewQueue: [],
  errorHistory: [],
  exploredCategories: [],
  lastGame: null,
  lastDailyChallengeDate: null,
  dailyChallengeProgress: null,
});

/** Extrai dos campos planos o retrato do curso que está ativo agora. */
export const snapshotCourse = (progress) => {
  const snap = {};
  for (const field of COURSE_SCOPED_FIELDS) {
    snap[field] = progress?.[field];
  }
  return snap;
};

/**
 * Troca o curso ativo, preservando o histórico dos dois lados.
 *
 * Pura: devolve um progresso novo, não mexe no que recebeu. Chamar de novo com
 * o mesmo curso é no-op (importa porque um clique repetido no seletor não pode
 * zerar nada).
 */
export const switchCourse = (progress, nextCourseId) => {
  const currentId = progress?.activeCourse || DEFAULT_COURSE;
  if (!nextCourseId || currentId === nextCourseId) return progress;

  const parked = { ...(progress?.courseProgress || {}) };

  // Guarda o curso que está saindo.
  parked[currentId] = snapshotCourse(progress);

  // Traz o que estiver guardado do curso que entra — ou um começo do zero,
  // que é o "primeira vez em espanhol → nível 1" da regra de produto.
  const incoming = parked[nextCourseId] || emptyCourseSnapshot();

  // Mantém a invariante: o curso ativo sai do mapa.
  delete parked[nextCourseId];

  return {
    ...progress,
    ...incoming,
    activeCourse: nextCourseId,
    courseProgress: parked,
  };
};

/**
 * Índice denormalizado `{ [courseId]: { wordsStudied } }` cobrindo TODOS os
 * cursos, inclusive o ativo.
 *
 * Existe por uma razão de servidor: o ranking é por idioma, e o Mongo precisa
 * ordenar por um campo REAL para usar índice. A contagem do curso ativo mora
 * nos campos planos e a dos inativos em `courseProgress` — ou seja, "quantas
 * palavras esta pessoa sabe em espanhol" fica em lugares diferentes conforme o
 * curso que ela deixou aberto, o que é impossível de indexar.
 *
 * Isto duplica um número que já existe, o que normalmente seria a "segunda
 * verdade" que courseProgress.js inteiro existe para evitar. A diferença é que
 * este mapa é DERIVADO, nunca editado à mão, e recalculado dentro de
 * sanitizeProgress a cada load/save — não há janela em que ele possa divergir.
 * Ninguém no cliente deve LER daqui: use os campos planos.
 */
/**
 * Devolve o progresso com o índice `courseStats` recalculado.
 *
 * Precisa ser aplicado em TODA ESCRITA, não só no saneamento: o app grava e
 * sincroniza a cada resposta certa (ver o efeito de save em useProgress.jsx) e
 * esse caminho não passa por sanitizeProgress. Sem isto o servidor receberia o
 * índice congelado no último load, e o ranking mostraria a contagem de horas
 * atrás — um bug pior que o original, porque pareceria funcionar.
 */
export const withCourseStats = (progress) =>
  progress ? { ...progress, courseStats: buildCourseStats(progress) } : progress;

export const buildCourseStats = (progress) => {
  const activeId = progress?.activeCourse || DEFAULT_COURSE;
  const stats = {};

  for (const [id, dados] of Object.entries(progress?.courseProgress || {})) {
    stats[id] = { wordsStudied: dados?.wordsStudied || 0 };
  }
  stats[activeId] = { wordsStudied: progress?.wordsStudied || 0 };

  return stats;
};

/**
 * Quanto progresso existe em cada curso — usado pelo seletor para mostrar
 * "Inglês · nível 12" ao lado de "Espanhol · novo" ANTES de a pessoa trocar,
 * para que a troca nunca pareça uma aposta às cegas.
 *
 * Devolve `{ [courseId]: { wordsStudied, totalCorrect, isActive, started } }`.
 */
export const summarizeCourses = (progress, courseIds = []) => {
  const activeId = progress?.activeCourse || DEFAULT_COURSE;
  const parked = progress?.courseProgress || {};
  const resumo = {};

  for (const id of courseIds) {
    const dados = id === activeId ? progress : parked[id];
    const wordsStudied = dados?.wordsStudied || 0;
    resumo[id] = {
      wordsStudied,
      totalCorrect: dados?.totalCorrect || 0,
      isActive: id === activeId,
      started: Boolean(dados) && wordsStudied > 0,
    };
  }

  return resumo;
};
