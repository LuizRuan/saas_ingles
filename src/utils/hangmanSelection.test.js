import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { getHangmanWordKey, isHangmanPlayable } from './hangmanAudit';
import { getAllHangmanModes } from './hangmanModes';
import { appendRecentHangmanWords } from './hangmanRecent';
import { selectHangmanWord } from './hangmanSelection';

const seeded = (initial) => {
  let seed = initial >>> 0;
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
};

describe.each([
  ['inglês', 'en-pt', englishWords],
  ['espanhol', 'es-pt', spanishWords],
])('seleção adaptativa da Forca — %s', (_name, courseId, words) => {
  it.each([1, 25, 50, 75, 100])('seleciona palavras válidas nos três modos no nível %i', (level) => {
    getAllHangmanModes({ rating: level, attempts: 1 }, level).forEach((mode, index) => {
      const selected = selectHangmanWord({
        words,
        category: 'animais',
        courseId,
        targetDifficulty: mode.targetDifficulty,
        rng: seeded((level * 10) + index),
      });
      expect(isHangmanPlayable(selected.word)).toBe(true);
      expect(selected.word.category).toBe('animais');
      expect(selected.difficulty).toBeGreaterThanOrEqual(1);
      expect(selected.difficulty).toBeLessThanOrEqual(100);
    });
  });

  it('não repete imediatamente nem depois de esgotar o histórico da categoria', () => {
    const first = selectHangmanWord({ words, category: 'cumprimentos', courseId, targetDifficulty: 40, rng: seeded(10) });
    let recent = appendRecentHangmanWords([], [first.word]);
    const second = selectHangmanWord({ words, category: 'cumprimentos', courseId, targetDifficulty: 40, recentWordKeys: recent, rng: seeded(11) });
    expect(getHangmanWordKey(second.word)).not.toBe(getHangmanWordKey(first.word));
    recent = words.filter(word => word.category === 'cumprimentos' && isHangmanPlayable(word)).map(getHangmanWordKey);
    const afterExhaustion = selectHangmanWord({ words, category: 'cumprimentos', courseId, targetDifficulty: 40, recentWordKeys: recent, rng: seeded(12) });
    expect(getHangmanWordKey(afterExhaustion.word)).not.toBe(recent.at(-1));
  });

  it('produz dificuldade média progressiva entre os modos', () => {
    const averages = getAllHangmanModes({ rating: 50, attempts: 1 }, 50).map((mode, modeIndex) => {
      let total = 0;
      for (let seed = 1; seed <= 120; seed += 1) {
        total += selectHangmanWord({
          words,
          category: 'animais',
          courseId,
          targetDifficulty: mode.targetDifficulty,
          rng: seeded(seed + (modeIndex * 1000)),
        }).difficulty;
      }
      return total / 120;
    });
    expect(averages[0]).toBeLessThan(averages[1]);
    expect(averages[1]).toBeLessThan(averages[2]);
  });
});

describe('reforço de palavras problemáticas', () => {
  it('prioriza uma palavra com muitas derrotas quando sorteia o papel de reforço', () => {
    const pool = Array.from({ length: 50 }, (_, index) => ({
      en: `Word${String.fromCharCode(65 + (index % 26))}${index < 26 ? 'A' : 'B'}`,
      pt: `Palavra${index}`,
      category: 'animais',
      level: index + 1,
    }));
    const rngValues = [0.95, 0];
    const selected = selectHangmanWord({
      words: pool,
      category: 'animais',
      targetDifficulty: 50,
      hangmanStats: { wordba: { losses: 20, wrongLetters: 50 } },
      rng: () => rngValues.shift() ?? 0,
    });
    expect(selected.word.en).toBe('WordBA');
  });
});

describe('integração da revisão espaçada na seleção', () => {
  it('não repete imediatamente uma revisão vencida', () => {
    const dueWord = englishWords.find(word => word.category === 'animais' && isHangmanPlayable(word));
    const key = getHangmanWordKey(dueWord);
    const selected = selectHangmanWord({
      words: englishWords,
      category: 'animais',
      targetDifficulty: 40,
      recentWordKeys: [key],
      reviewQueue: [{ wordKey: key, dueGame: 1, wrongCount: 10 }],
      completedGames: 2,
      rng: () => 0,
    });
    expect(getHangmanWordKey(selected.word)).not.toBe(key);
  });

  it('usa revisões vencidas em aproximadamente 30% das sessões', () => {
    const dueWord = englishWords.find(word => word.category === 'animais' && isHangmanPlayable(word));
    const key = getHangmanWordKey(dueWord);
    const rng = seeded(2026);
    let reviews = 0;
    for (let game = 0; game < 1000; game += 1) {
      const selected = selectHangmanWord({
        words: englishWords,
        category: 'animais',
        targetDifficulty: 50,
        reviewQueue: [{ wordKey: key, dueGame: 1, wrongCount: 10 }],
        completedGames: 2,
        rng,
      });
      if (selected.role === 'spaced-review') reviews += 1;
    }
    expect(reviews).toBeGreaterThanOrEqual(250);
    expect(reviews).toBeLessThanOrEqual(350);
  });
});
