import { describe, it, expect } from 'vitest';
import { buildQuestion, serializeQuestionForClient, GAME_TYPE_IDS, pickRandomGameType } from './questionGenerator.js';

describe('buildQuestion — todos os 8 tipos', () => {
  for (const type of GAME_TYPE_IDS) {
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

describe('serializeQuestionForClient', () => {
  it('nunca inclui correctAnswer nem wordIndex', () => {
    const q = buildQuestion('memory');
    const serialized = serializeQuestionForClient(q);
    expect(serialized).not.toHaveProperty('correctAnswer');
    expect(serialized).not.toHaveProperty('wordIndex');
    expect(serialized).toEqual({ type: q.type, prompt: q.prompt, options: q.options });
  });
});

describe('pickRandomGameType', () => {
  it('sempre devolve um tipo válido', () => {
    for (let i = 0; i < 30; i++) {
      expect(GAME_TYPE_IDS).toContain(pickRandomGameType());
    }
  });
});
