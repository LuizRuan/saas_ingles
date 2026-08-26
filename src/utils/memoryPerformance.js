import { getMemoryWordKey } from './memoryAudit';

export const calculateMemoryRecallQuality = ({ reveals = 2, associationMisses = 0 } = {}) => {
  const extraReveals = Math.max(0, (Number(reveals) || 0) - 2);
  const penalty = (Math.max(0, Number(associationMisses) || 0) * 0.22) + (extraReveals * 0.08);
  return Math.max(0, Math.min(1, 1 - penalty));
};

export const buildMemoryWordResults = (words = [], metricsByIndex = {}) => words.map((word, index) => {
  const metrics = metricsByIndex[index] || {};
  const reveals = Math.max(2, Math.round(Number(metrics.reveals) || 2));
  const associationMisses = Math.max(0, Math.round(Number(metrics.associationMisses) || 0));
  const quality = calculateMemoryRecallQuality({ reveals, associationMisses });
  return {
    word,
    key: getMemoryWordKey(word),
    reveals,
    associationMisses,
    quality,
    needsReview: quality < 0.65,
  };
});

export const updateMemoryStats = (currentStats = {}, wordResults = [], now = Date.now()) => {
  const next = { ...currentStats };
  wordResults.forEach((result) => {
    const previous = next[result.key] || {};
    next[result.key] = {
      matches: Math.max(0, Number(previous.matches) || 0) + 1,
      associationMisses: Math.max(0, Number(previous.associationMisses) || 0) + result.associationMisses,
      reveals: Math.max(0, Number(previous.reveals) || 0) + result.reveals,
      bestRecall: Math.max(Math.max(0, Number(previous.bestRecall) || 0), Math.round(result.quality * 100)),
      lastQuality: Math.round(result.quality * 100),
      lastSeen: now,
    };
  });
  return next;
};

