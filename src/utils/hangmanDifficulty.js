import { getHangmanWordKey } from './hangmanAudit';
import { getHangmanWordTokens } from './hangmanCharacters';

const rankCache = new WeakMap();
const RARE_LETTER_WEIGHTS = Object.freeze({
  'en-pt': { Q: 3, Z: 3, X: 2.7, J: 2.4, K: 2.1, V: 1.5, W: 1.5, Y: 1.2 },
  'es-pt': { Ñ: 3, X: 2.8, J: 2.5, Z: 2.3, Q: 2, K: 2, W: 1.8, Y: 1.2 },
});

const clampDifficulty = value => Math.max(1, Math.min(100, Math.round(Number(value) || 1)));

const normalizeForSimilarity = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z]/gi, '')
  .toLocaleLowerCase();

const levenshteinDistance = (left, right) => {
  if (!left) return right.length;
  if (!right) return left.length;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
};

export const calculateHangmanWordFeatures = (word, courseId = 'en-pt') => {
  const tokens = getHangmanWordTokens(word?.en, courseId).filter(token => token.isLetter);
  const letters = tokens.map(token => token.guessKey);
  const uniqueLetters = new Set(letters).size;
  const repeatedLetters = Math.max(0, letters.length - uniqueLetters);
  const weights = RARE_LETTER_WEIGHTS[courseId] || RARE_LETTER_WEIGHTS['en-pt'];
  const rareLetterScore = [...new Set(letters)].reduce((sum, letter) => sum + (weights[letter] || 0), 0);
  const target = normalizeForSimilarity(word?.en);
  const source = normalizeForSimilarity(word?.pt);
  const maxLength = Math.max(1, target.length, source.length);
  const cognateSimilarity = Math.max(0, 1 - (levenshteinDistance(target, source) / maxLength));
  const specialCharacters = (String(word?.en || '').match(/['’-]/g) || []).length;
  const rawComplexity = (letters.length * 1.8)
    + (uniqueLetters * 2.6)
    + (rareLetterScore * 3.2)
    + (specialCharacters * 2)
    + ((1 - cognateSimilarity) * 8)
    - (repeatedLetters * 0.45);

  return {
    letterCount: letters.length,
    uniqueLetters,
    repeatedLetters,
    rareLetterScore,
    cognateSimilarity,
    specialCharacters,
    rawComplexity,
  };
};

const percentileBy = (items, valueOf) => {
  const sorted = [...items].sort((a, b) => valueOf(a) - valueOf(b));
  const ranks = new Map();
  sorted.forEach((item, index) => ranks.set(item, sorted.length <= 1 ? 1 : index / (sorted.length - 1)));
  return ranks;
};

/** Combina dificuldade pedagógica declarada e complexidade real da palavra. */
export const rankHangmanWords = (words = [], courseId = 'en-pt') => {
  if (words.length === 0) return [];
  const cachedByCourse = rankCache.get(words);
  if (cachedByCourse?.has(courseId)) return cachedByCourse.get(courseId);

  const items = words.map((word, index) => ({
    word,
    index,
    key: getHangmanWordKey(word),
    declaredLevel: Math.max(1, Number(word?.level) || 1),
    features: calculateHangmanWordFeatures(word, courseId),
  }));
  const levelRanks = percentileBy(items, item => item.declaredLevel);
  const complexityRanks = percentileBy(items, item => item.features.rawComplexity);
  const combined = items.map(item => ({
    ...item,
    difficulty: clampDifficulty(1 + (((levelRanks.get(item) * 0.52) + (complexityRanks.get(item) * 0.48)) * 99)),
  }));
  const nextCache = cachedByCourse || new Map();
  nextCache.set(courseId, combined);
  rankCache.set(words, nextCache);
  return combined;
};

export const getHangmanWordDifficulty = (word, words = [word], courseId = 'en-pt') =>
  rankHangmanWords(words, courseId).find(item => item.word === word)?.difficulty || 1;
