import { getHangmanWordKey } from './hangmanAudit';

export const HANGMAN_RECENT_LIMIT = 40;

export const appendRecentHangmanWords = (current = [], wordsOrKeys = []) => {
  const added = wordsOrKeys
    .map(item => (typeof item === 'string' ? item : getHangmanWordKey(item)))
    .filter(Boolean);
  const addedSet = new Set(added);
  return [...current.filter(key => !addedSet.has(key)), ...added].slice(-HANGMAN_RECENT_LIMIT);
};

