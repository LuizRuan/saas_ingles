import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { auditWordBuilderCatalog, getWordBuilderKey } from './wordBuilderAudit';
import {
  createWordBuilderSlots,
  getWordBuilderTokens,
  isWordBuilderAnswerCorrect,
  makeWordBuilderTiles,
} from './wordBuilderCharacters';
import { getAllWordBuilderModes } from './wordBuilderModes';
import { buildWordBuilderWordResult, updateWordBuilderStats } from './wordBuilderPerformance';
import { appendRecentWordBuilderWords } from './wordBuilderRecent';
import { updateWordBuilderReviewQueue } from './wordBuilderReview';
import { createWordBuilderGameResult } from './wordBuilderScoring';
import { selectWordBuilderWords } from './wordBuilderSelection';
import { updateWordBuilderSkill } from './wordBuilderSkill';

const courses = [
  ['en-pt', englishWords],
  ['es-pt', spanishWords],
];
const seeded = (seed = 1) => {
  let value = seed >>> 0;
  return () => {
    value = ((value * 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
};
const sampleEvenly = (items, count) => {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_, index) => items[Math.floor(index * items.length / count)]);
};
const stressCatalog = (words) => {
  const playable = auditWordBuilderCatalog(words).playableWords;
  const groups = [
    playable.filter(word => getWordBuilderTokens(word.en).filter(token => token.isLetter).length <= 6),
    playable.filter(word => {
      const length = getWordBuilderTokens(word.en).filter(token => token.isLetter).length;
      return length >= 4 && length <= 10;
    }),
    playable.filter(word => getWordBuilderTokens(word.en).filter(token => token.isLetter).length >= 6),
  ];
  return [...new Map(groups.flatMap(group => sampleEvenly(group, 80)).map(word => [getWordBuilderKey(word), word])).values()];
};

describe('sistema completo do Montar Palavras', () => {
  it.each(courses)('gera sessões válidas em todos os níveis e modos — %s', (courseId, words) => {
    const catalog = stressCatalog(words);
    for (let level = 1; level <= 100; level += 1) {
      for (const mode of getAllWordBuilderModes({ rating: level, attempts: 1 }, level)) {
        const selection = selectWordBuilderWords({
          words: catalog,
          mode,
          courseId,
          rng: seeded((level * 10) + mode.rounds + mode.minLetters),
        });
        expect(selection.words, `${courseId}/${mode.id}/nível ${level}`).toHaveLength(mode.rounds);
        expect(new Set(selection.words.map(getWordBuilderKey)).size).toBe(mode.rounds);
        expect(selection.averageDifficulty).toBeGreaterThanOrEqual(1);
        expect(selection.averageDifficulty).toBeLessThanOrEqual(100);
      }
    }
  }, 20000);

  it.each(courses)('constrói exatamente todas as palavras Unicode e com literais — %s', (_courseId, words) => {
    const playable = auditWordBuilderCatalog(words).playableWords;
    const failures = [];
    for (const word of playable) {
      const slots = createWordBuilderSlots(word);
      const tiles = makeWordBuilderTiles(word, seeded(getWordBuilderKey(word).length));
      const remaining = [...tiles];
      getWordBuilderTokens(word.en).forEach((token) => {
        if (!token.isLetter) return;
        const tileIndex = remaining.findIndex(tile => tile.letter === token.character);
        if (tileIndex < 0) {
          failures.push(`${word.en}: letra ${token.character} ausente`);
          return;
        }
        slots[token.index] = remaining.splice(tileIndex, 1)[0];
      });
      if (remaining.length > 0 || !isWordBuilderAnswerCorrect(word, slots)) failures.push(word.en);
    }
    expect(failures).toEqual([]);
  }, 20000);

  it.each(courses)('a dificuldade média progride do nível 1 ao 100 — %s', (courseId, words) => {
    const catalog = stressCatalog(words);
    for (const modeId of ['easy', 'medium', 'hard']) {
      const averages = [1, 50, 100].map((level) => {
        const mode = getAllWordBuilderModes({ rating: level, attempts: 1 }, level).find(item => item.id === modeId);
        return selectWordBuilderWords({ words: catalog, mode, courseId, rng: seeded(42) }).averageDifficulty;
      });
      expect(averages[1], `${courseId}/${modeId}`).toBeGreaterThanOrEqual(averages[0]);
      expect(averages[2], `${courseId}/${modeId}`).toBeGreaterThanOrEqual(averages[1]);
    }
  }, 20000);

  it('mantém habilidade, histórico, estatísticas e revisão limitados após 150 partidas', () => {
    const catalog = stressCatalog(englishWords);
    let skill;
    let stats = {};
    let recent = [];
    let reviewQueue = [];
    for (let game = 0; game < 150; game += 1) {
      const level = skill?.rating || 25;
      const mode = getAllWordBuilderModes(skill, level)[game % 3];
      const selection = selectWordBuilderWords({
        words: catalog,
        mode,
        recentWordKeys: recent,
        wordBuilderStats: stats,
        reviewQueue,
        completedGames: game,
        rng: seeded(game + 1),
      });
      expect(selection.words[0] && getWordBuilderKey(selection.words[0])).not.toBe(recent.at(-1));
      const results = selection.words.map((word, index) => buildWordBuilderWordResult({
        word,
        won: (game + index) % 5 !== 0,
        attempts: ((game + index) % mode.maxAttempts) + 1,
        maxAttempts: mode.maxAttempts,
        moves: word.en.length + ((game + index) % 4),
        hintsUsed: (game + index) % 7 === 0 ? 1 : 0,
        difficulty: word.wordBuilderDifficulty,
      }));
      const gameResult = createWordBuilderGameResult({
        wordResults: results,
        mode: mode.id,
        difficulty: selection.averageDifficulty,
        fallbackRating: level,
      });
      skill = updateWordBuilderSkill(skill, gameResult);
      stats = updateWordBuilderStats(stats, results, game);
      reviewQueue = updateWordBuilderReviewQueue(reviewQueue, results, game);
      recent = appendRecentWordBuilderWords(recent, selection.words);
    }
    expect(skill.rating).toBeGreaterThanOrEqual(1);
    expect(skill.rating).toBeLessThanOrEqual(100);
    expect(skill.recentResults).toHaveLength(20);
    expect(recent.length).toBeLessThanOrEqual(40);
    expect(reviewQueue.length).toBeLessThanOrEqual(60);
    expect(Object.keys(stats).length).toBeGreaterThan(40);
  }, 20000);
});
