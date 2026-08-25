const GAME_NAMES = Object.freeze({
  whoKnowsMore: 'Quem Sabe Mais?',
  memory: 'Jogo da Memória',
  hangman: 'Jogo da Forca',
  wordBuilder: 'Montar Palavras',
  sentenceBuilder: 'Montar Frases',
  translation: 'Tradução',
  fillBlanks: 'Completar Frases',
  trueFalse: 'Verdadeiro ou Falso',
  listening: 'Jogo de Escuta',
  imageQuiz: 'Jogo da Imagem',
});

const finiteInteger = (value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

const combinedGameCounts = (gamesCompleted, courseProgress, activeCourse) => {
  const sources = [gamesCompleted];
  if (courseProgress && typeof courseProgress === 'object') {
    for (const [courseId, snapshot] of Object.entries(courseProgress)) {
      // O curso ativo mora nos campos planos. Se um payload antigo tiver uma
      // copia dele tambem em courseProgress, nao contamos as partidas duas vezes.
      if (courseId !== activeCourse) sources.push(snapshot?.gamesCompleted);
    }
  }

  return Object.fromEntries(Object.keys(GAME_NAMES).map((gameId) => [
    gameId,
    sources.reduce((total, source) => total + finiteInteger(source?.[gameId]), 0),
  ]));
};

export const getTopGames = (gamesCompleted, courseProgress = {}, activeCourse = 'en-pt') => {
  const totals = combinedGameCounts(gamesCompleted, courseProgress, activeCourse);
  return Object.entries(GAME_NAMES)
  .map(([id, name]) => ({
    id,
    name,
    plays: totals[id],
  }))
  .filter(game => game.plays > 0)
  .sort((a, b) => b.plays - a.plays || a.name.localeCompare(b.name, 'pt-BR'))
  .slice(0, 2);
};

/**
 * Monta a unica forma de usuario que a tela administrativa pode receber.
 * Campos grandes/sensiveis do progresso e passwordHash nunca entram aqui.
 */
export const toAdminUserSummary = (user) => {
  const progress = user?.progress && typeof user.progress === 'object' ? user.progress : {};

  return {
    id: String(user?._id ?? user?.id ?? ''),
    email: typeof user?.email === 'string' ? user.email : '',
    nickname: typeof user?.nickname === 'string' && user.nickname.trim()
      ? user.nickname.trim()
      : null,
    createdAt: user?.createdAt ?? null,
    activeCourse: typeof progress.activeCourse === 'string' ? progress.activeCourse : 'en-pt',
    level: finiteInteger(progress.currentLevel, 1, 1, 100),
    wordsStudied: finiteInteger(progress.wordsStudied),
    coins: finiteInteger(progress.totalScore),
    topGames: getTopGames(progress.gamesCompleted, progress.courseProgress, progress.activeCourse),
  };
};
