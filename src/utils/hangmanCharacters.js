const LATIN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const getHangmanAlphabet = (courseId = 'en-pt') =>
  courseId === 'es-pt' ? [...LATIN_ALPHABET, 'Ñ'] : [...LATIN_ALPHABET];

export const getHangmanGuessKey = (character, courseId = 'en-pt') => {
  const upper = String(character || '').normalize('NFC').toLocaleUpperCase();
  if (courseId === 'es-pt' && upper === 'Ñ') return 'Ñ';
  return upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0);
};

export const getHangmanWordTokens = (value, courseId = 'en-pt') =>
  Array.from(String(value || '').normalize('NFC').toLocaleUpperCase()).map(character => ({
    character,
    isLetter: /\p{L}/u.test(character),
    guessKey: getHangmanGuessKey(character, courseId),
  }));

export const doesHangmanGuessMatch = (value, guess, courseId = 'en-pt') =>
  getHangmanWordTokens(value, courseId).some(token => token.isLetter && token.guessKey === guess);

export const isHangmanWordSolved = (value, guesses = [], courseId = 'en-pt') => {
  const guessed = new Set(guesses);
  return getHangmanWordTokens(value, courseId)
    .every(token => !token.isLetter || guessed.has(token.guessKey));
};

export const getUnrevealedHangmanLetters = (value, guesses = [], courseId = 'en-pt') => {
  const guessed = new Set(guesses);
  return [...new Set(getHangmanWordTokens(value, courseId)
    .filter(token => token.isLetter && !guessed.has(token.guessKey))
    .map(token => token.guessKey))];
};

