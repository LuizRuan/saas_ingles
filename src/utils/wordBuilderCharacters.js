export const getWordBuilderTokens = value =>
  Array.from(String(value || '').normalize('NFC').toLocaleUpperCase()).map((character, index) => ({
    character,
    index,
    isLetter: /\p{L}/u.test(character),
  }));

export const getWordBuilderTarget = value =>
  getWordBuilderTokens(value).map(token => token.character).join('');

const shuffle = (items, rng) => {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng() * (index + 1));
    [output[index], output[other]] = [output[other], output[index]];
  }
  return output;
};

export const makeWordBuilderTiles = (word, rng = Math.random) => {
  const targetLetters = getWordBuilderTokens(word?.en).filter(token => token.isLetter);
  const target = targetLetters.map(token => token.character).join('');
  const tiles = shuffle(targetLetters.map((token, index) => ({
    letter: token.character,
    id: `letter-${index}`,
  })), rng);

  if (tiles.length > 1 && tiles.map(tile => tile.letter).join('') === target) {
    const swapIndex = tiles.findIndex((tile, index) => index > 0 && tile.letter !== tiles[0].letter);
    if (swapIndex > 0) [tiles[0], tiles[swapIndex]] = [tiles[swapIndex], tiles[0]];
  }
  return tiles;
};

export const createWordBuilderSlots = word =>
  getWordBuilderTokens(word?.en).map(token => (token.isLetter ? null : {
    letter: token.character,
    id: `literal-${token.index}`,
    literal: true,
  }));

export const isWordBuilderAnswerCorrect = (word, slots = []) =>
  slots.every(Boolean)
  && slots.map(slot => slot.letter).join('') === getWordBuilderTarget(word?.en);

