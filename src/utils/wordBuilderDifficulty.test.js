import { describe, expect, it } from 'vitest';
import { words as englishWords } from '../data/courses/en/words';
import { words as spanishWords } from '../data/courses/es/words';
import { auditWordBuilderCatalog } from './wordBuilderAudit';
import {
  calculateWordBuilderFeatures,
  getWordBuilderDifficulty,
  rankWordBuilderWords,
} from './wordBuilderDifficulty';

describe('complexidade intrínseca do Montar Palavras', () => {
  it('considera tamanho, combinações e letras raras', () => {
    const easy = calculateWordBuilderFeatures({ en: 'Cat', pt: 'Gato' }, 'en-pt');
    const hard = calculateWordBuilderFeatures({ en: 'Xylophone', pt: 'Xilofone' }, 'en-pt');
    expect(hard.letterCount).toBeGreaterThan(easy.letterCount);
    expect(hard.permutationComplexity).toBeGreaterThan(easy.permutationComplexity);
    expect(hard.rareLetterScore).toBeGreaterThan(easy.rareLetterScore);
    expect(hard.rawComplexity).toBeGreaterThan(easy.rawComplexity);
  });

  it('contabiliza repetição, acentos, Ñ e caracteres literais', () => {
    expect(calculateWordBuilderFeatures({ en: 'Letter', pt: 'Letra' }).repeatedLetters).toBeGreaterThan(0);
    expect(calculateWordBuilderFeatures({ en: 'Araña', pt: 'Aranha' }, 'es-pt').accentedLetters).toBeGreaterThan(0);
    expect(calculateWordBuilderFeatures({ en: 'T-shirt', pt: 'Camiseta' }).literalCharacters).toBe(1);
  });
});

describe.each([
  ['inglês', 'en-pt', englishWords],
  ['espanhol', 'es-pt', spanishWords],
])('escala de dificuldade — %s', (_course, courseId, allWords) => {
  const playable = auditWordBuilderCatalog(allWords).playableWords;

  it('classifica todo o catálogo entre 1 e 100', () => {
    const ranked = rankWordBuilderWords(playable, courseId);
    expect(ranked).toHaveLength(playable.length);
    expect(ranked.every(item => item.difficulty >= 1 && item.difficulty <= 100)).toBe(true);
    expect(new Set(ranked.map(item => item.key)).size).toBe(playable.length);
  });

  it('separa claramente as faixas inicial e avançada', () => {
    const ranked = [...rankWordBuilderWords(playable, courseId)].sort((left, right) => left.difficulty - right.difficulty);
    const size = Math.max(10, Math.floor(ranked.length * 0.2));
    const average = items => items.reduce((sum, item) => sum + item.difficulty, 0) / items.length;
    expect(average(ranked.slice(-size))).toBeGreaterThan(average(ranked.slice(0, size)) + 40);
  });

  it('consulta uma palavra específica', () => {
    const word = playable[Math.floor(playable.length / 2)];
    expect(getWordBuilderDifficulty(word, playable, courseId)).toBeGreaterThanOrEqual(1);
  });
});
