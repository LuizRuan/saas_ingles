import { getWordBuilderTokens } from './wordBuilderCharacters';
import { clampWordBuilderRating, getWordBuilderSkillRating } from './wordBuilderSkill';

export const WORD_BUILDER_MODES = Object.freeze([
  {
    id: 'easy', label: 'Fácil', rounds: 6, maxAttempts: 3,
    minLetters: 3, maxLetters: 6, minTarget: 1, maxTarget: 70,
    freeLetters: 1, distractorLetters: 0, showPositionFeedback: true,
    description: 'Uma letra revelada, até 3 tentativas e palavras menores',
  },
  {
    id: 'medium', label: 'Médio', rounds: 8, maxAttempts: 2,
    minLetters: 4, maxLetters: 10, minTarget: 12, maxTarget: 88,
    freeLetters: 0, distractorLetters: 0, showPositionFeedback: false,
    description: 'Palavras próximas do seu nível e até 2 tentativas',
  },
  {
    id: 'hard', label: 'Difícil', rounds: 8, maxAttempts: 2,
    minLetters: 6, maxLetters: 14, minTarget: 28, maxTarget: 100,
    freeLetters: 0, distractorLetters: 2, showPositionFeedback: false,
    description: 'Palavras maiores e 2 letras extras para confundir',
  },
]);

export const getWordBuilderMode = (modeId = 'medium', skill, userLevel = 1) => {
  const mode = WORD_BUILDER_MODES.find(item => item.id === modeId) || WORD_BUILDER_MODES[1];
  const wordBuilderRating = getWordBuilderSkillRating(skill, userLevel);
  const blendedRating = clampWordBuilderRating((wordBuilderRating * 0.75) + (clampWordBuilderRating(userLevel) * 0.25));
  const progress = (blendedRating - 1) / 99;
  const targetDifficulty = Math.round(mode.minTarget + ((mode.maxTarget - mode.minTarget) * progress));
  return { ...mode, targetDifficulty, wordBuilderRating };
};

export const getAllWordBuilderModes = (skill, userLevel = 1) =>
  WORD_BUILDER_MODES.map(mode => getWordBuilderMode(mode.id, skill, userLevel));

export const addWordBuilderDistractors = (
  tiles = [],
  word,
  count = 0,
  courseId = 'en-pt',
  rng = Math.random,
) => {
  const alphabet = courseId === 'es-pt' ? 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const wordLetters = new Set(getWordBuilderTokens(word?.en).filter(token => token.isLetter).map(token => token.character));
  const preferred = Array.from(alphabet).filter(letter => !wordLetters.has(letter));
  const pool = preferred.length > 0 ? preferred : Array.from(alphabet);
  const extras = Array.from({ length: Math.max(0, Math.round(Number(count) || 0)) }, (_, index) => ({
    letter: pool[Math.floor(rng() * pool.length)] || 'A',
    id: `distractor-${index}`,
    distractor: true,
  }));
  return [...tiles, ...extras].sort(() => rng() - 0.5);
};

