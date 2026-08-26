export const HANGMAN_CATEGORY_IDS = Object.freeze([
  'animais',
  'comidas',
  'cores',
  'familia',
  'casa',
  'escola',
  'corpo',
  'roupas',
  'bebidas',
  'cumprimentos',
  'numeros',
]);

export const normalizeHangmanKey = value => String(value || '')
  .normalize('NFC')
  .replace(/[’]/g, "'")
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase();

export const getHangmanWordKey = word => normalizeHangmanKey(word?.en);

const letterCount = value => (String(value || '').match(/\p{L}/gu) || []).length;
const hasUnsupportedCharacters = value => /[^\p{L}'’-]/u.test(String(value || ''));

export const getHangmanExclusionReason = (word, categoryIds = HANGMAN_CATEGORY_IDS) => {
  const target = String(word?.en || '').trim();
  if (!categoryIds.includes(word?.category)) return 'category';
  if (!target || !String(word?.pt || '').trim()) return 'missing-text';
  if (/\s/u.test(target)) return 'multiple-words';
  if (letterCount(target) < 3) return 'too-short';
  if (hasUnsupportedCharacters(target)) return 'unsupported-character';
  return null;
};

export const isHangmanPlayable = (word, categoryIds = HANGMAN_CATEGORY_IDS) =>
  getHangmanExclusionReason(word, categoryIds) === null;

export const auditHangmanCatalog = (words = [], categoryIds = HANGMAN_CATEGORY_IDS) => {
  const excludedByReason = {};
  const playableWords = [];
  const indexesByKey = new Map();

  words.forEach((word, index) => {
    const reason = getHangmanExclusionReason(word, categoryIds);
    if (reason) {
      excludedByReason[reason] = [...(excludedByReason[reason] || []), index];
      return;
    }
    playableWords.push(word);
    const key = getHangmanWordKey(word);
    indexesByKey.set(key, [...(indexesByKey.get(key) || []), index]);
  });

  const duplicateKeys = [...indexesByKey.entries()]
    .filter(([, indexes]) => indexes.length > 1)
    .map(([key]) => key);
  const categoryCounts = Object.fromEntries(categoryIds.map(categoryId => [
    categoryId,
    playableWords.filter(word => word.category === categoryId).length,
  ]));

  return {
    total: words.length,
    playable: playableWords.length,
    playableWords,
    duplicateKeys,
    excludedByReason,
    categoryCounts,
  };
};
