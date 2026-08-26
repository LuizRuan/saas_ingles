import { getMemoryWordKey, normalizeMemoryText } from './memoryAudit';
import { getDueMemoryReviews } from './memoryReview';

const clampDifficulty = value => Math.max(1, Math.min(100, Math.round(Number(value) || 1)));
const rankCache = new WeakMap();

const shuffle = (items, rng) => {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng() * (index + 1));
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
};

export const rankMemoryWords = (words = []) => {
  if (words.length === 0) return [];
  if (rankCache.has(words)) return rankCache.get(words);
  const levels = words.map(word => Number(word?.level) || 1);
  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);
  const span = Math.max(1, maxLevel - minLevel);
  const ranked = words.map((word, index) => ({
    word,
    index,
    key: getMemoryWordKey(word),
    targetText: normalizeMemoryText(word?.en),
    sourceText: normalizeMemoryText(word?.pt),
    difficulty: clampDifficulty(1 + ((((Number(word?.level) || minLevel) - minLevel) / span) * 99)),
  }));
  rankCache.set(words, ranked);
  return ranked;
};

const desiredForRole = (role, target) => {
  if (role === 'easy') return clampDifficulty(target - 10);
  if (role === 'challenge') return clampDifficulty(target + 8);
  return target;
};

const roleAt = (index, count) => {
  const ratio = index / Math.max(1, count);
  if (ratio < 0.55) return 'core';
  if (ratio < 0.75) return 'easy';
  if (ratio < 0.90) return 'challenge';
  return 'struggle';
};

const isCompatible = (candidate, selected) => {
  return !selected.some(item =>
    item.key === candidate.key
    || item.targetText === candidate.targetText
    || item.sourceText === candidate.sourceText);
};

const difficultyScore = (candidate, desired, role, memoryStats) => {
  const stats = memoryStats?.[candidate.key] || {};
  const misses = Math.max(0, Number(stats.associationMisses) || 0);
  const matches = Math.max(0, Number(stats.matches) || 0);
  const struggle = Math.max(0, misses - matches);
  return Math.abs(candidate.difficulty - desired) - (role === 'struggle' ? Math.min(60, struggle * 6) : 0);
};

/** Seleciona um tabuleiro adaptativo, completo, sem pares visuais ambíguos. */
export const selectMemoryWords = ({
  words = [],
  targetDifficulty = 1,
  count = 3,
  recentWordKeys = [],
  memoryStats = {},
  reviewQueue = [],
  completedGames = 0,
  rng = Math.random,
} = {}) => {
  const target = clampDifficulty(targetDifficulty);
  const ranked = rankMemoryWords(words);
  const recent = new Set(recentWordKeys);
  const waitingReviewKeys = new Set(
    reviewQueue.filter(item => item.dueGame > completedGames).map(item => item.wordKey),
  );
  const fresh = ranked.filter(item => !recent.has(item.key) && !waitingReviewKeys.has(item.key));
  const base = fresh.length >= count * 3 ? fresh : ranked;
  const selected = [];

  const dueLimit = Math.max(1, Math.floor(count * 0.3));
  const dueKeys = getDueMemoryReviews(reviewQueue, completedGames).map(item => item.wordKey);
  for (const key of dueKeys) {
    if (selected.length >= dueLimit) break;
    const candidate = ranked.find(item => item.key === key);
    if (candidate && isCompatible(candidate, selected)) selected.push(candidate);
  }

  for (let index = selected.length; index < count; index += 1) {
    const role = roleAt(index, count);
    const desired = desiredForRole(role, target);
    const compatible = base.filter(item => !selected.includes(item) && isCompatible(item, selected));
    const fallback = ranked.filter(item => !selected.includes(item) && isCompatible(item, selected));
    const candidates = compatible.length > 0 ? compatible : fallback;
    if (candidates.length === 0) break;

    const ordered = shuffle(candidates, rng).sort((a, b) =>
      difficultyScore(a, desired, role, memoryStats) - difficultyScore(b, desired, role, memoryStats));
    const nearest = ordered.slice(0, Math.max(8, count * 2));
    selected.push(role === 'struggle'
      ? ordered[0]
      : (nearest[Math.floor(rng() * nearest.length)] || ordered[0]));
  }

  const averageDifficulty = selected.length
    ? Math.round(selected.reduce((sum, item) => sum + item.difficulty, 0) / selected.length)
    : target;

  return {
    words: shuffle(selected.map(item => item.word), rng),
    averageDifficulty,
    targetDifficulty: target,
  };
};
