import { describe, it, expect } from 'vitest';
import { tokenizeText, normalizeWord } from './storyTokenizer';

describe('tokenizeText', () => {
  it('reconstrói o texto original juntando os tokens', () => {
    const fixtures = [
      "Ana has a small black cat.",
      "The cat's name is Max.",
      'Don\'t worry, Tom! Where is the dog?',
      '  a   b  ',
      '',
      'Well-known and self-made.',
    ];
    for (const original of fixtures) {
      const tokens = tokenizeText(original);
      expect(tokens.map((t) => t.text).join('')).toBe(original);
    }
  });

  it('separa uma contração como um único token de palavra', () => {
    const tokens = tokenizeText("Don't stop.");
    expect(tokens[0]).toEqual({ type: 'word', text: "Don't" });
  });

  it('separa pontuação colada à palavra em um token de gap próprio', () => {
    const tokens = tokenizeText('dog.');
    expect(tokens).toEqual([
      { type: 'word', text: 'dog' },
      { type: 'gap', text: '.' },
    ]);
  });

  it('trata dígitos como não-palavra (gap)', () => {
    const tokens = tokenizeText('I have 3 cats.');
    const digitToken = tokens.find((t) => t.text.includes('3'));
    expect(digitToken.type).toBe('gap');
  });

  it('devolve array vazio para string vazia', () => {
    expect(tokenizeText('')).toEqual([]);
  });

  it('lida com espaços múltiplos e nas bordas sem quebrar', () => {
    const tokens = tokenizeText('  a   b  ');
    expect(tokens.filter((t) => t.type === 'word').map((t) => t.text)).toEqual(['a', 'b']);
  });
});

describe('normalizeWord', () => {
  it('põe em minúsculas', () => {
    expect(normalizeWord('The')).toBe('the');
  });

  it('remove pontuação de borda', () => {
    expect(normalizeWord('"cat,"')).toBe('cat');
  });

  it('preserva contrações da lista de exceção', () => {
    expect(normalizeWord("Don't")).toBe("don't");
    expect(normalizeWord("It's")).toBe("it's");
    expect(normalizeWord("I'm")).toBe("i'm");
  });

  it('remove possessivo, reaproveitando a entrada da palavra base', () => {
    expect(normalizeWord("Ana's")).toBe('ana');
    expect(normalizeWord("dog's")).toBe('dog');
    expect(normalizeWord("cats'")).toBe('cats');
  });

  it('devolve string vazia para entrada só de pontuação/espaço', () => {
    expect(normalizeWord('...')).toBe('');
    expect(normalizeWord('   ')).toBe('');
  });

  it('nunca lança para entrada nula ou indefinida', () => {
    expect(() => normalizeWord(null)).not.toThrow();
    expect(() => normalizeWord(undefined)).not.toThrow();
  });
});
