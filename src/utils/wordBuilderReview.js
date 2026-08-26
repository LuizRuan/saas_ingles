export const WORD_BUILDER_REVIEW_DELAYS = Object.freeze([1, 3, 7, 14]);
export const WORD_BUILDER_REVIEW_QUEUE_LIMIT = 60;
export const WORD_BUILDER_REVIEW_SESSION_RATE = 0.3;

export const getDueWordBuilderReviews = (queue = [], completedGames = 0) => queue
  .filter(item => item.dueGame <= completedGames)
  .sort((left, right) => left.dueGame - right.dueGame || (right.wrongCount || 0) - (left.wrongCount || 0));

export const updateWordBuilderReviewQueue = (queue = [], wordResults = [], completedGames = 0) => {
  let next = [...queue];
  wordResults.forEach((result) => {
    if (!result?.key) return;
    const previous = next.find(item => item.wordKey === result.key);
    next = next.filter(item => item.wordKey !== result.key);

    if (!result.won || result.needsReview) {
      const stage = result.won ? 1 : 0;
      next.push({
        wordKey: result.key,
        stage,
        dueGame: completedGames + WORD_BUILDER_REVIEW_DELAYS[stage],
        wrongCount: (previous?.wrongCount || 0) + 1,
        lastPerformance: result.performance,
      });
      return;
    }

    if (!previous) return;
    const nextStage = Math.max(0, Number(previous.stage) || 0) + 1;
    if (nextStage >= WORD_BUILDER_REVIEW_DELAYS.length) return;
    next.push({
      ...previous,
      stage: nextStage,
      dueGame: completedGames + WORD_BUILDER_REVIEW_DELAYS[nextStage],
      lastPerformance: result.performance,
    });
  });

  return next
    .sort((left, right) => left.dueGame - right.dueGame)
    .slice(0, WORD_BUILDER_REVIEW_QUEUE_LIMIT);
};

