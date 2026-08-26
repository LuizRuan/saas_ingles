export const WORD_BUILDER_MIN_LETTERS = 3;
export const WORD_BUILDER_MAX_LETTERS = 14;

export const normalizeWordBuilderKey = value => String(value || '')
  .normalize('NFC')
  .replace(/[’]/g, "'")
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase();

export const getWordBuilderKey = word => normalizeWordBuilderKey(word?.en);

export const getWordBuilderLetterCount = value =>
  (String(value || '').normalize('NFC').match(/\p{L}/gu) || []).length;

const hasUnsupportedCharacters = value => /[^\p{L}'’?!.,-]/u.test(String(value || ''));

export const getWordBuilderExclusionReason = (word) => {
  const target = String(word?.en || '').trim();
  if (!target || !String(word?.pt || '').trim()) return 'missing-text';
  if (/\s/u.test(target)) return 'multiple-words';
  const letters = getWordBuilderLetterCount(target);
  if (letters < WORD_BUILDER_MIN_LETTERS) return 'too-short';
  if (letters > WORD_BUILDER_MAX_LETTERS) return 'too-long';
  if (hasUnsupportedCharacters(target)) return 'unsupported-character';
  return null;
};

export const isWordBuilderPlayable = word => getWordBuilderExclusionReason(word) === null;

export const auditWordBuilderCatalog = (words = []) => {
  const playableWords = [];
  const excludedByReason = {};
  const indexesByKey = new Map();

  words.forEach((word, index) => {
    const reason = getWordBuilderExclusionReason(word);
    if (reason) {
      excludedByReason[reason] = [...(excludedByReason[reason] || []), index];
      return;
    }
    playableWords.push(word);
    const key = getWordBuilderKey(word);
    indexesByKey.set(key, [...(indexesByKey.get(key) || []), index]);
  });

  const duplicateKeys = [...indexesByKey.entries()]
    .filter(([, indexes]) => indexes.length > 1)
    .map(([key]) => key);
  const lengthCounts = {};
  playableWords.forEach((word) => {
    const length = getWordBuilderLetterCount(word.en);
    lengthCounts[length] = (lengthCounts[length] || 0) + 1;
  });

  return {
    total: words.length,
    playable: playableWords.length,
    playableWords,
    duplicateKeys,
    excludedByReason,
    lengthCounts,
  };
};

