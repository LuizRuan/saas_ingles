import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { auditHangmanCatalog, getHangmanWordKey, HANGMAN_CATEGORY_IDS } from './hangmanAudit';
import { getHangmanAlphabet, getHangmanWordTokens } from './hangmanCharacters';
import { buildHangmanWordResult, updateHangmanStats } from './hangmanPerformance';
import { getAllHangmanModes, getHangmanMode } from './hangmanModes';
import { appendRecentHangmanWords, HANGMAN_RECENT_LIMIT } from './hangmanRecent';
import { HANGMAN_REVIEW_QUEUE_LIMIT, updateHangmanReviewQueue } from './hangmanReview';
import { createHangmanGameResult } from './hangmanScoring';
import { selectHangmanWord } from './hangmanSelection';
import { updateHangmanSkill } from './hangmanSkill';

const seeded = (initial) => {
  let seed = initial >>> 0;
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
};

const courses = [
  ['inglês', 'en-pt', englishWords],
  ['espanhol', 'es-pt', spanishWords],
];

describe.each(courses)('auditoria completa da Forca — %s', (_name, courseId, words) => {
  it('permite digitar todas as letras de todas as palavras jogáveis', () => {
    const alphabet = new Set(getHangmanAlphabet(courseId));
    const playable = auditHangmanCatalog(words).playableWords;
    for (const word of playable) {
      const keys = getHangmanWordTokens(word.en, courseId)
        .filter(token => token.isLetter)
        .map(token => token.guessKey);
      expect(keys.every(key => alphabet.has(key)), word.en).toBe(true);
    }
  });

  it('seleciona uma rodada válida em todos os 100 níveis e três modos', () => {
    for (let level = 1; level <= 100; level += 1) {
      getAllHangmanModes({ rating: level, attempts: 1 }, level).forEach((mode, modeIndex) => {
        const category = HANGMAN_CATEGORY_IDS[(level + modeIndex) % HANGMAN_CATEGORY_IDS.length];
        const selection = selectHangmanWord({
          words,
          category,
          courseId,
          targetDifficulty: mode.targetDifficulty,
          rng: seeded((level * 101) + modeIndex),
        });
        expect(selection.word, `${level}/${mode.id}/${category}`).toBeDefined();
        expect(selection.word.category).toBe(category);
        expect(selection.difficulty).toBeGreaterThanOrEqual(1);
        expect(selection.difficulty).toBeLessThanOrEqual(100);
      });
    }
  });
});

describe('simulação integrada de progressão da Forca', () => {
  it('mantém todos os históricos consistentes por 180 partidas', () => {
    let skill = { rating: 25, attempts: 1, wins: 0, losses: 0, bestByMode: {}, recentResults: [] };
    let recent = [];
    let stats = {};
    let reviewQueue = [];
    let previousKey = null;

    for (let game = 0; game < 180; game += 1) {
      const modeId = ['easy', 'medium', 'hard'][game % 3];
      const category = HANGMAN_CATEGORY_IDS[game % HANGMAN_CATEGORY_IDS.length];
      const mode = getHangmanMode(modeId, skill, skill.rating);
      const selection = selectHangmanWord({
        words: englishWords,
        category,
        courseId: 'en-pt',
        targetDifficulty: mode.targetDifficulty,
        recentWordKeys: recent,
        hangmanStats: stats,
        reviewQueue,
        completedGames: game,
        rng: seeded(8000 + game),
      });
      const key = getHangmanWordKey(selection.word);
      expect(key).not.toBe(previousKey);

      const won = game % 5 !== 0;
      const wrongCount = won ? game % mode.maxWrong : mode.maxWrong;
      const wordResult = buildHangmanWordResult({
        word: selection.word,
        won,
        wrongCount,
        maxWrong: mode.maxWrong,
        hintsUsed: game % 11 === 0 ? 1 : 0,
        translationUsed: game % 17 === 0,
        durationMs: 15000 + game,
      });
      const result = createHangmanGameResult({
        mode: modeId,
        won,
        difficulty: selection.difficulty,
        wrongCount,
        maxWrong: mode.maxWrong,
        hintsUsed: wordResult.hintsUsed,
        translationUsed: wordResult.translationUsed,
        durationMs: wordResult.durationMs,
        letterCount: getHangmanWordTokens(selection.word.en).filter(token => token.isLetter).length,
      });

      skill = updateHangmanSkill(skill, result);
      stats = updateHangmanStats(stats, wordResult, game + 1);
      reviewQueue = updateHangmanReviewQueue(reviewQueue, wordResult, game + 1);
      recent = appendRecentHangmanWords(recent, [selection.word]);
      previousKey = key;

      expect(skill.rating).toBeGreaterThanOrEqual(1);
      expect(skill.rating).toBeLessThanOrEqual(100);
      expect(skill.recentResults.length).toBeLessThanOrEqual(20);
      expect(recent.length).toBeLessThanOrEqual(HANGMAN_RECENT_LIMIT);
      expect(reviewQueue.length).toBeLessThanOrEqual(HANGMAN_REVIEW_QUEUE_LIMIT);
    }

    expect(skill.attempts).toBe(181);
    expect(skill.wins + skill.losses).toBe(180);
    expect(Object.keys(skill.bestByMode).sort()).toEqual(['easy', 'hard', 'medium']);
    expect(Object.keys(stats).length).toBeGreaterThan(40);
  });
});
