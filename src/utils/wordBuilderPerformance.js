import { getWordBuilderKey, getWordBuilderLetterCount } from './wordBuilderAudit';

export const calculateWordBuilderWordPerformance = ({
  won = false,
  attempts = 1,
  maxAttempts = 2,
  moves = 1,
  idealMoves = 1,
  hintsUsed = 0,
} = {}) => {
  if (!won) return 0;
  const safeMaxAttempts = Math.max(1, Math.round(Number(maxAttempts) || 1));
  const safeAttempts = Math.max(1, Math.min(safeMaxAttempts, Math.round(Number(attempts) || 1)));
  const attemptEfficiency = safeMaxAttempts <= 1
    ? 1
    : 1 - ((safeAttempts - 1) / (safeMaxAttempts - 1));
  const safeIdealMoves = Math.max(1, Math.round(Number(idealMoves) || 1));
  const moveEfficiency = Math.min(1, safeIdealMoves / Math.max(safeIdealMoves, Number(moves) || safeIdealMoves));
  const hintPenalty = Math.min(0.3, Math.max(0, Number(hintsUsed) || 0) * 0.08);
  return Math.max(0, Math.min(1, 0.55 + (attemptEfficiency * 0.25) + (moveEfficiency * 0.2) - hintPenalty));
};

export const buildWordBuilderWordResult = ({
  word,
  won = false,
  attempts = 1,
  maxAttempts = 2,
  moves = 0,
  hintsUsed = 0,
  freeLetters = 0,
  durationMs = 0,
  difficulty,
} = {}) => {
  const letterCount = getWordBuilderLetterCount(word?.en);
  const idealMoves = Math.max(1, letterCount - Math.max(0, Number(freeLetters) || 0));
  const performance = calculateWordBuilderWordPerformance({
    won,
    attempts,
    maxAttempts,
    moves,
    idealMoves,
    hintsUsed,
  });
  return {
    word,
    key: getWordBuilderKey(word),
    won: Boolean(won),
    attempts: Math.max(1, Math.round(Number(attempts) || 1)),
    maxAttempts: Math.max(1, Math.round(Number(maxAttempts) || 1)),
    moves: Math.max(0, Math.round(Number(moves) || 0)),
    idealMoves,
    hintsUsed: Math.max(0, Math.round(Number(hintsUsed) || 0)),
    durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
    difficulty: Math.max(1, Math.min(100, Math.round(Number(difficulty ?? word?.wordBuilderDifficulty) || 1))),
    performance: Math.round(performance * 100),
    needsReview: !won || performance < 0.65,
  };
};

export const updateWordBuilderStats = (currentStats = {}, wordResults = [], now = Date.now()) => {
  const next = { ...currentStats };
  wordResults.forEach((result) => {
    if (!result?.key) return;
    const previous = next[result.key] || {};
    next[result.key] = {
      rounds: Math.max(0, Number(previous.rounds) || 0) + 1,
      correct: Math.max(0, Number(previous.correct) || 0) + (result.won ? 1 : 0),
      wrong: Math.max(0, Number(previous.wrong) || 0) + (result.won ? 0 : 1),
      attempts: Math.max(0, Number(previous.attempts) || 0) + result.attempts,
      moves: Math.max(0, Number(previous.moves) || 0) + result.moves,
      hintsUsed: Math.max(0, Number(previous.hintsUsed) || 0) + result.hintsUsed,
      bestMoves: result.won
        ? Math.min(Math.max(1, Number(previous.bestMoves) || Number.MAX_SAFE_INTEGER), Math.max(1, result.moves))
        : Math.max(0, Number(previous.bestMoves) || 0),
      bestTime: result.won
        ? Math.min(Math.max(1, Number(previous.bestTime) || Number.MAX_SAFE_INTEGER), Math.max(1, result.durationMs))
        : Math.max(0, Number(previous.bestTime) || 0),
      bestPerformance: Math.max(Math.max(0, Number(previous.bestPerformance) || 0), result.performance),
      lastPerformance: result.performance,
      lastResult: result.won ? 'won' : 'lost',
      lastSeen: now,
    };
  });
  return next;
};
