import { getMemoryWordKey } from './memoryAudit';

export const MEMORY_RECENT_LIMIT = 40;

export const appendRecentMemoryWords = (current = [], wordsOrKeys = []) => {
  const added = wordsOrKeys
    .map(item => (typeof item === 'string' ? item : getMemoryWordKey(item)))
    .filter(Boolean);
  const addedSet = new Set(added);
  return [...current.filter(key => !addedSet.has(key)), ...added].slice(-MEMORY_RECENT_LIMIT);
};

