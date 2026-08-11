import { describe, it, expect } from 'vitest';
import { generateSimilarDistractors, generateTranslationDistractors } from './distractorGenerator';

describe('distractorGenerator', () => {
  it('gera exatamente 3 distratores parecidos e diferentes da palavra original', () => {
    const distractors = generateSimilarDistractors('Noise');
    expect(distractors).toHaveLength(3);
    expect(distractors).not.toContain('Noise');
    for (const d of distractors) {
      expect(d.toLowerCase()).not.toBe('noise');
    }
  });

  it('gera distratores com plurais e trocas fonéticas válidas para "Noise"', () => {
    const distractors = generateSimilarDistractors('Noise');
    expect(distractors.length).toBe(3);
  });

  it('funciona para palavras curtas e longas', () => {
    expect(generateSimilarDistractors('Cat')).toHaveLength(3);
    expect(generateSimilarDistractors('Embassy')).toHaveLength(3);
    expect(generateSimilarDistractors('Recycling')).toHaveLength(3);
  });

  it('gera 4 opções para o quiz de tradução onde 1 é a correta e 3 são parecidas', () => {
    const quiz = {
      direction: 'pt-en',
      question: 'A árvore projeta uma sombra.',
      correct: 'The tree casts a shadow.',
      options: ['The tree casts a shadow.', 'I go to bed at nine.', 'I put butter on my bread.', 'The cake is delicious.'],
    };
    const options = generateTranslationDistractors(quiz, []);
    expect(options).toHaveLength(4);
    expect(options).toContain('The tree casts a shadow.');
    expect(options).not.toContain('I put butter on my bread.');
  });
});
