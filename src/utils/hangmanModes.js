import { clampHangmanRating, getHangmanSkillRating } from './hangmanSkill';

export const HANGMAN_MODES = Object.freeze([
  {
    id: 'easy',
    label: 'Fácil',
    maxWrong: 8,
    minTarget: 1,
    maxTarget: 72,
    freeLetters: 1,
    freeTranslation: true,
    description: 'Uma letra inicial, dica traduzida e 8 chances',
  },
  {
    id: 'medium',
    label: 'Médio',
    maxWrong: 6,
    minTarget: 12,
    maxTarget: 88,
    freeLetters: 0,
    freeTranslation: false,
    description: 'Palavras próximas do seu nível e 6 chances',
  },
  {
    id: 'hard',
    label: 'Difícil',
    maxWrong: 5,
    minTarget: 26,
    maxTarget: 100,
    freeLetters: 0,
    freeTranslation: false,
    description: 'Palavras acima do seu nível e somente 5 chances',
  },
]);

export const getHangmanMode = (modeId = 'medium', skill, userLevel = 1) => {
  const mode = HANGMAN_MODES.find(item => item.id === modeId) || HANGMAN_MODES[1];
  const hangmanRating = getHangmanSkillRating(skill, userLevel);
  const blendedRating = clampHangmanRating((hangmanRating * 0.75) + (clampHangmanRating(userLevel) * 0.25));
  const progress = (blendedRating - 1) / 99;
  const targetDifficulty = Math.round(mode.minTarget + ((mode.maxTarget - mode.minTarget) * progress));
  return { ...mode, targetDifficulty, hangmanRating };
};

export const getAllHangmanModes = (skill, userLevel = 1) =>
  HANGMAN_MODES.map(mode => getHangmanMode(mode.id, skill, userLevel));

