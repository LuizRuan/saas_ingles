import { describe, expect, it } from 'vitest';
import { getSentences } from '../data/index';
import { normalizeSentenceText } from './sentenceCatalog';
import { splitSentenceIntoWords } from './sentenceWords';

describe('blocos individuais do Montar Frases', () => {
  it('separa artigos, adjetivos e substantivos em botões diferentes', () => {
    const words = splitSentenceIntoWords({
      id: 'example',
      words: [{ en: 'We', pt: 'Nós' }, { en: 'have', pt: 'temos' }, { en: 'a black cat', pt: 'um gato preto' }],
    });
    expect(words.map(item => item.en)).toEqual(['We', 'have', 'a', 'black', 'cat']);
  });

  it('garante uma única palavra por botão em todo o catálogo e todas as dificuldades', () => {
    for (const courseId of ['en-pt', 'es-pt']) {
      for (const sentence of getSentences(courseId)) {
        const words = splitSentenceIntoWords(sentence);
        expect(words.length).toBeGreaterThan(0);
        expect(words.every(item => !/\s/.test(item.en))).toBe(true);
        expect(normalizeSentenceText(words.map(item => item.en).join(' '))).toBe(
          normalizeSentenceText(sentence.en),
        );
      }
    }
  });
});
