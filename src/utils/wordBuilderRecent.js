import { getWordBuilderKey } from './wordBuilderAudit';

export const WORD_BUILDER_RECENT_LIMIT = 40;

export const appendRecentWordBuilderWords = (current = [], wordsOrKeys = []) => {
  const added = wordsOrKeys
    .map(item => (typeof item === 'string' ? item : getWordBuilderKey(item)))
    .filter(Boolean);
  const addedSet = new Set(added);
  return [...current.filter(key => !addedSet.has(key)), ...added].slice(-WORD_BUILDER_RECENT_LIMIT);
};

