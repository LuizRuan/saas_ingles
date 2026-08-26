export const MEMORY_REVIEW_DELAYS = Object.freeze([1, 3, 7, 14]);
export const MEMORY_REVIEW_QUEUE_LIMIT = 60;

export const getDueMemoryReviews = (queue = [], completedGames = 0) => queue
  .filter(item => item.dueGame <= completedGames)
  .sort((a, b) => a.dueGame - b.dueGame || (b.wrongCount || 0) - (a.wrongCount || 0));

export const updateMemoryReviewQueue = (queue = [], wordResults = [], completedGames = 0) => {
  let next = [...queue];

  wordResults.forEach((result) => {
    const previous = next.find(item => item.wordKey === result.key);
    next = next.filter(item => item.wordKey !== result.key);

    if (result.needsReview) {
      next.push({
        wordKey: result.key,
        stage: 0,
        dueGame: completedGames + MEMORY_REVIEW_DELAYS[0],
        wrongCount: (previous?.wrongCount || 0) + 1,
        lastQuality: Math.round(result.quality * 100),
      });
      return;
    }

    if (!previous) return;
    const nextStage = Math.max(0, Number(previous.stage) || 0) + 1;
    if (nextStage >= MEMORY_REVIEW_DELAYS.length) return;
    next.push({
      ...previous,
      stage: nextStage,
      dueGame: completedGames + MEMORY_REVIEW_DELAYS[nextStage],
      lastQuality: Math.round(result.quality * 100),
    });
  });

  return next
    .sort((a, b) => a.dueGame - b.dueGame)
    .slice(0, MEMORY_REVIEW_QUEUE_LIMIT);
};
