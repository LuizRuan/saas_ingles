export const HANGMAN_REVIEW_DELAYS = Object.freeze([1, 3, 7, 14]);
export const HANGMAN_REVIEW_QUEUE_LIMIT = 60;
export const HANGMAN_REVIEW_SESSION_RATE = 0.3;

export const getDueHangmanReviews = (queue = [], completedGames = 0) => queue
  .filter(item => item.dueGame <= completedGames)
  .sort((left, right) => left.dueGame - right.dueGame || (right.wrongCount || 0) - (left.wrongCount || 0));

export const updateHangmanReviewQueue = (queue = [], result, completedGames = 0) => {
  if (!result?.key) return [...queue];
  const previous = queue.find(item => item.wordKey === result.key);
  const next = queue.filter(item => item.wordKey !== result.key);

  if (!result.won || result.needsReview) {
    const stage = result.won ? 1 : 0;
    next.push({
      wordKey: result.key,
      category: result.word?.category || previous?.category || 'geral',
      stage,
      dueGame: completedGames + HANGMAN_REVIEW_DELAYS[stage],
      wrongCount: (previous?.wrongCount || 0) + 1,
      lastPerformance: result.performance,
    });
  } else if (previous) {
    const nextStage = Math.max(0, Number(previous.stage) || 0) + 1;
    if (nextStage < HANGMAN_REVIEW_DELAYS.length) {
      next.push({
        ...previous,
        stage: nextStage,
        dueGame: completedGames + HANGMAN_REVIEW_DELAYS[nextStage],
        lastPerformance: result.performance,
      });
    }
  }

  return next
    .sort((left, right) => left.dueGame - right.dueGame)
    .slice(0, HANGMAN_REVIEW_QUEUE_LIMIT);
};

