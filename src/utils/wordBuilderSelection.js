import { getWordBuilderKey, getWordBuilderLetterCount, isWordBuilderPlayable } from './wordBuilderAudit';
import { rankWordBuilderWords } from './wordBuilderDifficulty';
import { getDueWordBuilderReviews, WORD_BUILDER_REVIEW_SESSION_RATE } from './wordBuilderReview';

const clampDifficulty = value => Math.max(1, Math.min(100, Math.round(Number(value) || 1)));

const shuffle = (items, rng) => {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng() * (index + 1));
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
};

const roleAt = (index, count) => {
  const ratio = (index + 0.5) / Math.max(1, count);
  if (ratio < 0.55) return 'core';
  if (ratio < 0.75) return 'easy-review';
  if (ratio < 0.90) return 'challenge';
  return 'struggle';
};

const desiredForRole = (role, target) => {
  if (role === 'easy-review') return clampDifficulty(target - 14);
  if (role === 'challenge') return clampDifficulty(target + 12);
  return target;
};

const struggleWeight = (item, stats) => {
  const wordStats = stats?.[item.key] || {};
  const wrong = Math.max(0, Number(wordStats.wrong) || 0);
  const attempts = Math.max(0, Number(wordStats.attempts) || 0);
  const hints = Math.max(0, Number(wordStats.hintsUsed) || 0);
  const correct = Math.max(0, Number(wordStats.correct) || 0);
  return Math.min(60, (wrong * 10) + (attempts * 1.5) + (hints * 3) - (correct * 2));
};

export const selectWordBuilderWords = ({
  words = [],
  mode,
  courseId = 'en-pt',
  recentWordKeys = [],
  wordBuilderStats = {},
  reviewQueue = [],
  completedGames = 0,
  rng = Math.random,
} = {}) => {
  if (!mode) return { words: [], averageDifficulty: 1, targetDifficulty: 1, roles: [] };
  const target = clampDifficulty(mode.targetDifficulty);
  const ranked = rankWordBuilderWords(words, courseId).filter(({ word }) => {
    const letters = getWordBuilderLetterCount(word?.en);
    return isWordBuilderPlayable(word) && letters >= mode.minLetters && letters <= mode.maxLetters;
  });
  if (ranked.length === 0) return { words: [], averageDifficulty: target, targetDifficulty: target, roles: [] };

  const count = Math.min(mode.rounds, ranked.length);
  const recent = new Set(recentWordKeys);
  const previousKey = recentWordKeys.at(-1);
  const waitingReview = new Set(reviewQueue
    .filter(item => item.dueGame > completedGames)
    .map(item => item.wordKey));
  const fresh = ranked.filter(item => !recent.has(item.key) && !waitingReview.has(item.key));
  const withoutImmediate = ranked.filter(item => item.key !== previousKey);
  const primaryPool = fresh.length >= count ? fresh : (withoutImmediate.length >= count ? withoutImmediate : ranked);
  const selected = [];
  const roles = [];

  const dueLimit = Math.floor(count * WORD_BUILDER_REVIEW_SESSION_RATE);
  const dueKeys = getDueWordBuilderReviews(reviewQueue, completedGames).map(item => item.wordKey);
  for (const key of dueKeys) {
    if (selected.length >= dueLimit) break;
    const candidate = ranked.find(item => item.key === key && item.key !== previousKey);
    if (candidate && !selected.some(item => item.key === key)) {
      selected.push(candidate);
      roles.push('spaced-review');
    }
  }

  for (let index = selected.length; index < count; index += 1) {
    const role = roleAt(index, count);
    const desired = desiredForRole(role, target);
    const available = primaryPool.filter(item => !selected.some(chosen => chosen.key === item.key));
    const fallback = ranked.filter(item => !selected.some(chosen => chosen.key === item.key));
    const candidates = available.length > 0 ? available : fallback;
    if (candidates.length === 0) break;
    const ordered = shuffle(candidates, rng).sort((left, right) => {
      const leftScore = Math.abs(left.difficulty - desired)
        - (role === 'struggle' ? struggleWeight(left, wordBuilderStats) : 0);
      const rightScore = Math.abs(right.difficulty - desired)
        - (role === 'struggle' ? struggleWeight(right, wordBuilderStats) : 0);
      return leftScore - rightScore;
    });
    const nearest = ordered.slice(0, Math.min(10, ordered.length));
    const chosen = role === 'struggle'
      ? ordered[0]
      : (nearest[Math.floor(rng() * nearest.length)] || ordered[0]);
    selected.push(chosen);
    roles.push(role);
  }

  const averageDifficulty = selected.length
    ? Math.round(selected.reduce((sum, item) => sum + item.difficulty, 0) / selected.length)
    : target;
  return {
    words: selected.map(item => ({
      ...item.word,
      wordBuilderDifficulty: item.difficulty,
      wordBuilderRole: roles[selected.indexOf(item)],
    })),
    averageDifficulty,
    targetDifficulty: target,
    roles,
  };
};

export const hasImmediateWordBuilderRepeat = (selectedWords = [], recentWordKeys = []) => {
  const previous = recentWordKeys.at(-1);
  return Boolean(previous && selectedWords[0] && getWordBuilderKey(selectedWords[0]) === previous);
};
