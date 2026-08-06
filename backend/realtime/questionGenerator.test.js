import { describe, it, expect } from 'vitest';
import { buildQuestion, serializeQuestionForClient, maskWord, GAME_TYPE_IDS, pickRandomGameType } from './questionGenerator.js';

describe('buildQuestion — todos os tipos com múltipla escolha', () => {
  for (const type of GAME_TYPE_IDS) {
    if (type === 'hangman') continue; // hangman não usa `options` — ver describe própria abaixo
    it(`${type}: a resposta certa está entre as opções, sem opção duplicada`, () => {
      const q = buildQuestion(type);
      expect(q.type).toBe(type === 'listening' || type === 'translation' ? type : type);
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBeGreaterThanOrEqual(2); // trueFalse tem 2, os demais têm 4
    });
  }

  it('trueFalse sempre tem exatamente as opções Verdadeiro/Falso', () => {
    const q = buildQuestion('trueFalse');
    expect(q.options.sort()).toEqual(['Falso', 'Verdadeiro']);
  });

  it('wordBuilder embaralha as letras (raramente igual ao original)', () => {
    const q = buildQuestion('wordBuilder');
    expect(q.prompt.scrambledText.replace(/ /g, '').length).toBe(q.correctAnswer.length);
  });

  it('respeita usedIndices para não repetir palavra na mesma partida', () => {
    const first = buildQuestion('translation');
    const used = new Set([first.wordIndex]);
    for (let i = 0; i < 20; i++) {
      const next = buildQuestion('translation', used);
      expect(next.wordIndex).not.toBe(first.wordIndex);
    }
  });
});

describe('buildQuestion — hangman', () => {
  it('nunca inclui options (a palavra certa não pode vazar por aí)', () => {
    const q = buildQuestion('hangman');
    expect(q).not.toHaveProperty('options');
  });

  it('wordTemplate tem o mesmo tamanho da resposta certa e mascara só letras', () => {
    const q = buildQuestion('hangman');
    const { wordTemplate } = q.prompt;
    expect(wordTemplate.length).toBe(q.correctAnswer.length);
    for (let i = 0; i < q.correctAnswer.length; i++) {
      const ch = q.correctAnswer[i];
      if (/[A-Za-z]/.test(ch)) expect(wordTemplate[i]).toBe('#');
      else expect(wordTemplate[i]).toBe(ch);
    }
  });
});

describe('maskWord', () => {
  it('mascara letras como #, preserva espaço e pontuação', () => {
    expect(maskWord('Hello')).toBe('#####');
    expect(maskWord('Good morning')).toBe('#### #######');
    expect(maskWord("I'm fine")).toBe("#'# ####");
    expect(maskWord('How are you?')).toBe('### ### ###?');
  });
});

describe('serializeQuestionForClient', () => {
  it('nunca inclui correctAnswer nem wordIndex', () => {
    const q = buildQuestion('memory');
    const serialized = serializeQuestionForClient(q);
    expect(serialized).not.toHaveProperty('correctAnswer');
    expect(serialized).not.toHaveProperty('wordIndex');
    expect(serialized).toEqual({ type: q.type, prompt: q.prompt, options: q.options });
  });

  it('para hangman, não inclui options nem qualquer letra da palavra', () => {
    const q = buildQuestion('hangman');
    const serialized = serializeQuestionForClient(q);
    expect(serialized).not.toHaveProperty('options');
    expect(serialized).not.toHaveProperty('correctAnswer');
    expect(serialized.prompt.wordTemplate).not.toMatch(/[A-Za-z]/);
  });
});

describe('pickRandomGameType', () => {
  it('sempre devolve um tipo válido', () => {
    for (let i = 0; i < 30; i++) {
      expect(GAME_TYPE_IDS).toContain(pickRandomGameType());
    }
  });
});
