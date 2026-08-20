// Sistema inteligente de revisão
// Prioriza palavras com mais erros nos próximos jogos
// Considera uma palavra "aprendida" após 3 acertos em momentos diferentes

import { resolveWordKey } from './wordKey';

export const LEARNED_THRESHOLD = 3; // Acertos necessários para considerar aprendida

export const getWordStatus = (wordStats) => {
  if (!wordStats) return 'nova';
  if (wordStats.learned || wordStats.correct >= LEARNED_THRESHOLD) return 'aprendida';
  if (wordStats.correct > 0 || wordStats.wrong > 0) return 'aprendendo';
  return 'nova';
};

export const getWordsToReview = (progress, allWords) => {
  const { wordStats = {} } = progress;

  // Uma palavra some da lista assim que a resposta MAIS RECENTE for um acerto
  // — não precisa atingir o limiar de "aprendida" (3 acertos). Antes, o
  // filtro exigia stats.correct < LEARNED_THRESHOLD, então acertar 1x durante
  // a revisão quase nunca tirava a palavra da lista (ainda faltava chegar a
  // 3 acertos totais), e a tela de "Revisão Concluída" não refletia nada.
  // Um erro novo depois disso volta a marcar a palavra pra revisão.
  const wordsWithErrors = allWords.filter(word => {
    const stats = wordStats[word.en];
    return stats && stats.wrong > 0 && stats.lastResult !== 'correct';
  });
  
  // Sort by error rate (most errors first)
  wordsWithErrors.sort((a, b) => {
    const statsA = wordStats[a.en];
    const statsB = wordStats[b.en];
    const errorRateA = statsA.wrong / (statsA.correct + statsA.wrong);
    const errorRateB = statsB.wrong / (statsB.correct + statsB.wrong);
    return errorRateB - errorRateA;
  });
  
  return wordsWithErrors;
};

// Regressão: jogos como Montar Frases, Tradução e Conversa gravam o erro com
// a FRASE inteira como chave (ex.: "I am happy."), não uma palavra do banco
// — resolveWordKey() não reconhece isso e manda pro balde phraseStats (ver
// recordWordResult). getWordsToReview só olha wordStats, então quem errava
// só em jogos de frase nunca via nada pra revisar, mesmo errando bastante.
export const getPhrasesToReview = (progress) => {
  const { phraseStats = {} } = progress;

  const entries = Object.entries(phraseStats).filter(
    ([, stats]) => stats && stats.wrong > 0 && stats.lastResult !== 'correct'
  );

  entries.sort(([, a], [, b]) => {
    const errorRateA = a.wrong / ((a.correct || 0) + a.wrong);
    const errorRateB = b.wrong / ((b.correct || 0) + b.wrong);
    return errorRateB - errorRateA;
  });

  return entries.map(([text, stats]) => ({ text, wrong: stats.wrong }));
};

/**
 * Calcula a urgência das revisões pendentes (palavras + frases).
 * - 'urgent'  → o item mais antigo foi visto há mais de 2 dias
 * - 'pending' → há itens para revisar, mas tudo recente
 * - 'none'    → nenhuma revisão pendente
 */
// Mesma contagem de getReviewUrgency, mas sem precisar do banco de palavras
// (`allWords`) — só dos dois baldes de estatística. Existe pra telas como a
// Home, que evitam de propósito importar words.js (~139 kB) no bundle
// principal e só precisam do NÚMERO de itens pendentes, não dos objetos de
// palavra em si (isso a página de Revisão já resolve, com o banco completo).
//
// Regressão: a Home tinha sua PRÓPRIA cópia inline deste cálculo, que só
// olhava wordStats — nunca phraseStats. Quem errava só em jogos de frase
// (Montar Frases, Tradução, Conversa) nunca via o botão aparecer na Home,
// mesmo com a página de Revisão já mostrando esses erros corretamente. Ter
// uma função só, testada, é o que impede as duas contagens (Home e
// ReviewErrors) de divergirem de novo no futuro.
export const getReviewUrgencyLite = (progress) => {
  const { wordStats = {}, phraseStats = {} } = progress || {};
  const comErro = (stats) => stats && stats.wrong > 0 && stats.lastResult !== 'correct';

  const itensComErro = [
    ...Object.values(wordStats).filter(comErro),
    ...Object.values(phraseStats).filter(comErro),
  ];
  const count = itensComErro.length;
  if (count === 0) return { level: 'none', daysOldest: 0, count: 0 };

  const now = Date.now();
  const MS_PER_DAY = 86_400_000;
  const VALID_TIMESTAMP_MIN = 1700000000000;
  const oldestMs = itensComErro.reduce((max, s) => {
    if (s.lastSeen && s.lastSeen > VALID_TIMESTAMP_MIN) {
      return Math.max(max, now - s.lastSeen);
    }
    return max;
  }, 0);

  const daysOldest = Math.floor(oldestMs / MS_PER_DAY);
  const level = daysOldest >= 2 ? 'urgent' : 'pending';
  return { level, daysOldest, count };
};

export const getReviewUrgency = (progress, allWords) => {
  const wordsToReview = getWordsToReview(progress, allWords);
  const phrasesToReview = getPhrasesToReview(progress);
  const count = wordsToReview.length + phrasesToReview.length;
  if (count === 0) return { level: 'none', daysOldest: 0, count: 0 };

  const { wordStats = {}, phraseStats = {} } = progress;
  const now = Date.now();
  const MS_PER_DAY = 86_400_000;
  const VALID_TIMESTAMP_MIN = 1700000000000;

  let oldestMs = 0;
  const trackOldest = (lastSeen) => {
    if (lastSeen && lastSeen > VALID_TIMESTAMP_MIN) {
      const age = Math.max(0, now - lastSeen);
      if (age > oldestMs) oldestMs = age;
    }
  };
  for (const word of wordsToReview) trackOldest(wordStats[word.en]?.lastSeen);
  for (const phrase of phrasesToReview) trackOldest(phraseStats[phrase.text]?.lastSeen);

  const daysOldest = Math.floor(oldestMs / MS_PER_DAY);
  const level = daysOldest >= 2 ? 'urgent' : 'pending';
  return { level, daysOldest, count };
};

export const getWordPriority = (wordStats) => {
  if (!wordStats) return 0;
  // Higher priority = should appear more often
  const errorRate = wordStats.wrong / Math.max(1, wordStats.correct + wordStats.wrong);
  return errorRate * 10;
};

// Mix review words into a game's word pool
export const mixReviewWords = (gameWords, reviewWords, ratio = 0.3) => {
  const reviewCount = Math.min(
    Math.floor(gameWords.length * ratio),
    reviewWords.length
  );
  
  if (reviewCount === 0) return gameWords;
  
  const selectedReview = reviewWords.slice(0, reviewCount);
  const remainingGame = gameWords.slice(0, gameWords.length - reviewCount);
  
  const mixed = [...remainingGame, ...selectedReview];
  // Shuffle
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  
  return mixed;
};

// PURA: não altera `progress` nem nada aninhado nele. A versão anterior fazia
// push direto em errorHistory/wordStats, que são compartilhados com o estado
// anterior — sob StrictMode o updater roda duas vezes e duplicava o registro.
export const recordWordResult = (progress, rawKey, isCorrect) => {
  // Resolve contra o banco do curso ATIVO. Sem isto, quem estuda espanhol
  // responde "Hola", a palavra não é achada no banco inglês, e a resposta cai
  // em phraseStats — o balde que não conta pra wordsStudied. Resultado: nível
  // travado no 1 pra sempre, sem nenhum erro visível.
  const canonical = resolveWordKey(rawKey, progress?.activeCourse);
  // Frases e lacunas não são vocabulário: vão para um balde separado, senão
  // inflam "palavras estudadas" e distorcem o nível.
  const bucketName = canonical ? 'wordStats' : 'phraseStats';
  const key = canonical ?? String(rawKey);

  const bucket = { ...(progress[bucketName] || {}) };
  const prev = bucket[key] || { correct: 0, wrong: 0, lastSeen: null, timestamps: [] };
  const now = Date.now();

  const stats = {
    ...prev,
    correct: (prev.correct || 0) + (isCorrect ? 1 : 0),
    wrong: (prev.wrong || 0) + (isCorrect ? 0 : 1),
    timestamps: isCorrect ? [...(prev.timestamps || []), now] : [...(prev.timestamps || [])],
    lastSeen: now,
    lastResult: isCorrect ? 'correct' : 'wrong',
  };

  // "Aprendida": acertos suficientes em pelo menos 2 dias distintos
  if (stats.correct >= LEARNED_THRESHOLD) {
    const uniqueDays = new Set(stats.timestamps.map(t => new Date(t).toDateString()));
    if (uniqueDays.size >= 2) stats.learned = true;
  }
  bucket[key] = stats;

  const updated = { ...progress, [bucketName]: bucket };

  if (isCorrect) {
    updated.totalCorrect = (progress.totalCorrect || 0) + 1;
    updated.currentStreak = (progress.currentStreak || 0) + 1;
    updated.bestStreak = Math.max(progress.bestStreak || 0, updated.currentStreak);
  } else {
    updated.totalWrong = (progress.totalWrong || 0) + 1;
    updated.currentStreak = 0;
    updated.errorHistory = [...(progress.errorHistory || []), { word: key, timestamp: now }].slice(-100);
  }

  // Só vocabulário conta como palavra estudada/aprendida
  const vocab = updated.wordStats || {};
  updated.wordsLearned = Object.values(vocab).filter(s => s.learned || s.correct >= LEARNED_THRESHOLD).length;
  updated.wordsStudied = Object.keys(vocab).length;

  return updated;
};
