import { getWordBuilderKey } from './wordBuilderAudit';
import { getWordBuilderTokens } from './wordBuilderCharacters';

const rankCache = new WeakMap();
const RARE_LETTER_WEIGHTS = Object.freeze({
  'en-pt': { Q: 3, Z: 3, X: 2.7, J: 2.4, K: 2.1, V: 1.5, W: 1.5, Y: 1.2 },
  'es-pt': { Ñ: 3, X: 2.8, J: 2.5, Z: 2.3, Q: 2, K: 2, W: 1.8, Y: 1.2 },
});

const clampDifficulty = value => Math.max(1, Math.min(100, Math.round(Number(value) || 1)));
const logFactorial = (value) => {
  let total = 0;
  for (let current = 2; current <= value; current += 1) total += Math.log2(current);
  return total;
};
const normalizePlain = value => String(value || '')
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

export const calculateWordBuilderFeatures = (word, courseId = 'en-pt') => {
  const tokens = getWordBuilderTokens(word?.en);
  const letters = tokens.filter(token => token.isLetter).map(token => token.character);
  const counts = new Map();
  letters.forEach(letter => counts.set(letter, (counts.get(letter) || 0) + 1));
  const uniqueLetters = counts.size;
  const repeatedLetters = letters.length - uniqueLetters;
  const permutationComplexity = Math.max(0,
    logFactorial(letters.length) - [...counts.values()].reduce((sum, count) => sum + logFactorial(count), 0));
  const weights = RARE_LETTER_WEIGHTS[courseId] || RARE_LETTER_WEIGHTS['en-pt'];
  const rareLetterScore = [...counts.keys()].reduce((sum, letter) => sum + (weights[letter] || 0), 0);
  const accentedLetters = letters.filter(letter => letter.normalize('NFD').length > 1 || letter === 'Ñ').length;
  const literalCharacters = tokens.filter(token => !token.isLetter).length;
  const target = normalizePlain(word?.en);
  const source = normalizePlain(word?.pt);
  const maxLength = Math.max(1, target.length, source.length);
  const cognateSimilarity = Math.max(0, 1 - (levenshteinDistance(target, source) / maxLength));
  const rawComplexity = (letters.length * 1.5)
    + (uniqueLetters * 1.6)
    + (permutationComplexity * 1.35)
    + (rareLetterScore * 2.5)
    + (repeatedLetters * 0.8)
    + (accentedLetters * 1.4)
    + (literalCharacters * 1.2)
    + ((1 - cognateSimilarity) * 7);

  return {
    letterCount: letters.length,
    uniqueLetters,
    repeatedLetters,
    permutationComplexity,
    rareLetterScore,
    accentedLetters,
    literalCharacters,
    cognateSimilarity,
    rawComplexity,
  };
};

const percentileBy = (items, valueOf) => {
  const sorted = [...items].sort((left, right) => valueOf(left) - valueOf(right));
  const ranks = new Map();
  sorted.forEach((item, index) => ranks.set(item, sorted.length <= 1 ? 1 : index / (sorted.length - 1)));
  return ranks;
};

export const rankWordBuilderWords = (words = [], courseId = 'en-pt') => {
  if (words.length === 0) return [];
  const cachedByCourse = rankCache.get(words);
  if (cachedByCourse?.has(courseId)) return cachedByCourse.get(courseId);
  const items = words.map((word, index) => ({
    word,
    index,
    key: getWordBuilderKey(word),
    declaredLevel: Math.max(1, Number(word?.level) || 1),
    features: calculateWordBuilderFeatures(word, courseId),
  }));
  const levelRanks = percentileBy(items, item => item.declaredLevel);
  const complexityRanks = percentileBy(items, item => item.features.rawComplexity);
  const ranked = items.map(item => ({
    ...item,
    difficulty: clampDifficulty(1 + (((levelRanks.get(item) * 0.5) + (complexityRanks.get(item) * 0.5)) * 99)),
  }));
  const nextCache = cachedByCourse || new Map();
  nextCache.set(courseId, ranked);
  rankCache.set(words, nextCache);
  return ranked;
};

export const getWordBuilderDifficulty = (word, words = [word], courseId = 'en-pt') =>
  rankWordBuilderWords(words, courseId).find(item => item.word === word)?.difficulty || 1;

