import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { auditHangmanCatalog } from './hangmanAudit';
import {
  calculateHangmanWordFeatures,
  getHangmanWordDifficulty,
  rankHangmanWords,
} from './hangmanDifficulty';

describe('complexidade intrínseca de palavras da Forca', () => {
  it('considera tamanho, letras únicas e letras raras', () => {
    const easy = calculateHangmanWordFeatures({ en: 'Cat', pt: 'Gato' }, 'en-pt');
    const hard = calculateHangmanWordFeatures({ en: 'Xylophone', pt: 'Xilofone' }, 'en-pt');
    expect(hard.letterCount).toBeGreaterThan(easy.letterCount);
    expect(hard.uniqueLetters).toBeGreaterThan(easy.uniqueLetters);
    expect(hard.rareLetterScore).toBeGreaterThan(easy.rareLetterScore);
    expect(hard.rawComplexity).toBeGreaterThan(easy.rawComplexity);
  });

  it('reconhece Ñ como letra rara própria do espanhol', () => {
    expect(calculateHangmanWordFeatures({ en: 'Araña', pt: 'Aranha' }, 'es-pt').rareLetterScore).toBeGreaterThan(0);
  });
});

describe.each([
  ['inglês', 'en-pt', englishWords],
  ['espanhol', 'es-pt', spanishWords],
])('escala relativa de dificuldade — %s', (_name, courseId, allWords) => {
  const playable = auditHangmanCatalog(allWords).playableWords;

  it('classifica todo o catálogo entre 1 e 100 sem perder palavras', () => {
    const ranked = rankHangmanWords(playable, courseId);
    expect(ranked).toHaveLength(playable.length);
    expect(ranked.every(item => item.difficulty >= 1 && item.difficulty <= 100)).toBe(true);
    expect(new Set(ranked.map(item => item.key)).size).toBe(playable.length);
  });

  it('faz a faixa final ser claramente mais difícil que a inicial', () => {
    const ranked = [...rankHangmanWords(playable, courseId)].sort((a, b) => a.difficulty - b.difficulty);
    const size = Math.max(10, Math.floor(ranked.length * 0.2));
    const average = items => items.reduce((sum, item) => sum + item.difficulty, 0) / items.length;
    expect(average(ranked.slice(-size))).toBeGreaterThan(average(ranked.slice(0, size)) + 40);
  });

  it('consulta a dificuldade de uma palavra específica', () => {
    const word = playable[Math.floor(playable.length / 2)];
    expect(getHangmanWordDifficulty(word, playable, courseId)).toBeGreaterThanOrEqual(1);
  });
});
