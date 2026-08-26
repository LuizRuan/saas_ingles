import { getHangmanWordKey } from './hangmanAudit';
import { calculateHangmanPerformance } from './hangmanSkill';

export const buildHangmanWordResult = ({
  word,
  won = false,
  wrongGuesses = [],
  wrongCount = wrongGuesses.length,
  maxWrong = 6,
  hintsUsed = 0,
  translationUsed = false,
  durationMs = 0,
} = {}) => {
  const performance = calculateHangmanPerformance({ won, wrongCount, maxWrong, hintsUsed, translationUsed });
  const safeMax = Math.max(1, Math.round(Number(maxWrong) || 6));
  const safeWrong = Math.max(0, Math.min(safeMax, Math.round(Number(wrongCount) || 0)));
  return {
    word,
    key: getHangmanWordKey(word),
    won: Boolean(won),
    wrongGuesses: [...new Set(wrongGuesses.map(value => String(value || '').toLocaleUpperCase()).filter(Boolean))],
    wrongCount: safeWrong,
    maxWrong: safeMax,
    remainingAttempts: Math.max(0, safeMax - safeWrong),
    hintsUsed: Math.max(0, Math.round(Number(hintsUsed) || 0)),
    translationUsed: Boolean(translationUsed),
    durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
    performance: Math.round(performance * 100),
    needsReview: !won || performance < 0.65,
  };
};

export const updateHangmanStats = (currentStats = {}, result, now = Date.now()) => {
  if (!result?.key) return { ...currentStats };
  const previous = currentStats[result.key] || {};
  return {
    ...currentStats,
    [result.key]: {
      games: Math.max(0, Number(previous.games) || 0) + 1,
      wins: Math.max(0, Number(previous.wins) || 0) + (result.won ? 1 : 0),
      losses: Math.max(0, Number(previous.losses) || 0) + (result.won ? 0 : 1),
      wrongLetters: Math.max(0, Number(previous.wrongLetters) || 0) + result.wrongCount,
      hintsUsed: Math.max(0, Number(previous.hintsUsed) || 0) + result.hintsUsed,
      translationsUsed: Math.max(0, Number(previous.translationsUsed) || 0) + (result.translationUsed ? 1 : 0),
      bestRemainingAttempts: Math.max(
        Math.max(0, Number(previous.bestRemainingAttempts) || 0),
        result.won ? result.remainingAttempts : 0,
      ),
      bestPerformance: Math.max(Math.max(0, Number(previous.bestPerformance) || 0), result.performance),
      lastPerformance: result.performance,
      lastResult: result.won ? 'won' : 'lost',
      lastSeen: now,
    },
  };
};

