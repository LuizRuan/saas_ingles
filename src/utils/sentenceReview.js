export const SENTENCE_REVIEW_DELAY_GAMES = 2;
export const SENTENCE_REVIEW_QUEUE_LIMIT = 30;

export const updateSentenceReviewQueue = (
  currentQueue = [],
  sentence,
  correct,
  completedGames = 0,
) => {
  const withoutCurrent = currentQueue.filter(item => item.sentenceId !== sentence.id);
  if (correct) return withoutCurrent;

  const previous = currentQueue.find(item => item.sentenceId === sentence.id);
  return [...withoutCurrent, {
    sentenceId: sentence.id,
    category: sentence.category || 'geral',
    difficulty: sentence.difficulty,
    dueGame: completedGames + SENTENCE_REVIEW_DELAY_GAMES,
    wrongCount: (previous?.wrongCount || 0) + 1,
  }].slice(-SENTENCE_REVIEW_QUEUE_LIMIT);
};

export const getDueSentenceReviews = (queue = [], completedGames = 0) =>
  queue.filter(item => item.dueGame <= completedGames);
