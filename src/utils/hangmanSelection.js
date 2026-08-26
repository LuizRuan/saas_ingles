import { isHangmanPlayable } from './hangmanAudit';
import { rankHangmanWords } from './hangmanDifficulty';
import { getDueHangmanReviews, HANGMAN_REVIEW_SESSION_RATE } from './hangmanReview';

const selectionCache = new WeakMap();
const clampDifficulty = value => Math.max(1, Math.min(100, Math.round(Number(value) || 1)));

const rankedPlayable = (words, courseId) => {
  let byCourse = selectionCache.get(words);
  if (byCourse?.has(courseId)) return byCourse.get(courseId);
  const ranked = rankHangmanWords(words.filter(word => isHangmanPlayable(word)), courseId);
  byCourse ||= new Map();
  byCourse.set(courseId, ranked);
  selectionCache.set(words, byCourse);
  return ranked;
};

const getRole = (rng) => {
  const roll = rng();
  if (roll < 0.55) return 'core';
  if (roll < 0.75) return 'review';
  if (roll < 0.90) return 'challenge';
  return 'struggle';
};

const desiredForRole = (role, target) => {
  if (role === 'review') return clampDifficulty(target - 14);
  if (role === 'challenge') return clampDifficulty(target + 12);
  return target;
};

const struggleScore = (item, stats) => {
  const wordStats = stats?.[item.key] || {};
  return (Math.max(0, Number(wordStats.losses) || 0) * 12)
    + (Math.max(0, Number(wordStats.wrongLetters) || 0) * 1.5)
    + (Math.max(0, Number(wordStats.hintsUsed) || 0) * 4)
    - (Math.max(0, Number(wordStats.wins) || 0) * 2);
};

/** Seleciona uma palavra no nível certo e evita as últimas palavras vistas. */
export const selectHangmanWord = ({
  words = [],
  category,
  courseId = 'en-pt',
  targetDifficulty = 1,
  recentWordKeys = [],
  hangmanStats = {},
  reviewQueue = [],
  completedGames = 0,
  rng = Math.random,
} = {}) => {
  const target = clampDifficulty(targetDifficulty);
  const categoryPool = rankedPlayable(words, courseId).filter(item => !category || item.word.category === category);
  if (categoryPool.length === 0) return { word: undefined, difficulty: target, targetDifficulty: target, role: 'core' };

  const recent = new Set(recentWordKeys);
  const previousKey = recentWordKeys.at(-1);
  const dueCandidates = getDueHangmanReviews(reviewQueue, completedGames)
    .map(review => categoryPool.find(item => item.key === review.wordKey))
    .filter(item => item && item.key !== previousKey);
  if (dueCandidates.length > 0 && rng() < HANGMAN_REVIEW_SESSION_RATE) {
    const selected = dueCandidates[0];
    return {
      word: selected.word,
      difficulty: selected.difficulty,
      targetDifficulty: target,
      role: 'spaced-review',
    };
  }

  const waitingReview = new Set(reviewQueue
    .filter(item => item.dueGame > completedGames)
    .map(item => item.wordKey));
  const fresh = categoryPool.filter(item => !recent.has(item.key) && !waitingReview.has(item.key));
  const withoutImmediateRepeat = categoryPool.filter(item => item.key !== previousKey);
  const pool = fresh.length > 0 ? fresh : (withoutImmediateRepeat.length > 0 ? withoutImmediateRepeat : categoryPool);
  const role = getRole(rng);
  const desired = desiredForRole(role, target);
  const ordered = [...pool].sort((left, right) => {
    const leftDistance = Math.abs(left.difficulty - desired);
    const rightDistance = Math.abs(right.difficulty - desired);
    if (role === 'struggle') {
      return (leftDistance - struggleScore(left, hangmanStats))
        - (rightDistance - struggleScore(right, hangmanStats));
    }
    return leftDistance - rightDistance;
  });
  const nearest = ordered.slice(0, Math.min(10, ordered.length));
  const selected = nearest[Math.floor(rng() * nearest.length)] || ordered[0];

  return {
    word: selected.word,
    difficulty: selected.difficulty,
    targetDifficulty: target,
    role,
  };
};
