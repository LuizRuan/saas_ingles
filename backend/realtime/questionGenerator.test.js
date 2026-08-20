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

  it('wordBuilder embaralha as letras, sempre de uma palavra única', () => {
    // Rodado várias vezes de propósito: a palavra é sorteada, e o bug que isto
    // prende só aparecia quando calhava de sair uma entrada com espaço
    // ("Good morning"), o que dava ~1 em 6. Com uma amostra só, o teste
    // falhava em dias aleatórios e parecia instável em vez de errado.
    for (let i = 0; i < 40; i++) {
      const q = buildQuestion('wordBuilder');
      expect(q.correctAnswer).not.toMatch(/ /);
      expect(q.prompt.scrambledText.replace(/ /g, '').length).toBe(q.correctAnswer.length);
    }
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

// ───────────────────────────────────────────────────────────────────────────
// Viés por nível — a peça que faltava para o duelo humano: antes, TODA
// pergunta sorteava uniformemente das 1000 palavras, então um iniciante podia
// cair em vocabulário de nível 90+ na primeira rodada. Agora o pool ainda é o
// mesmo, mas a escolha se enviesa pro nível informado por cada jogador (não
// autoritativo — é só ritmo, ver o comentário em buildQuestion).
// ───────────────────────────────────────────────────────────────────────────
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildQuestionPerPlayer, buildMemoryGroupPerPlayer } from './questionGenerator.js';

const __dirname2 = dirname(fileURLToPath(import.meta.url));
const rawWords = JSON.parse(readFileSync(join(__dirname2, '..', 'data', 'words.json'), 'utf-8'));
const levelDoIndice = (i) => rawWords[i]?.level || 1;

describe('buildQuestion — viés por nível', () => {
  it('nível baixo favorece wordIndex de word.level baixo', () => {
    const AMOSTRAS = 150;
    let soma = 0;
    for (let i = 0; i < AMOSTRAS; i++) {
      soma += levelDoIndice(buildQuestion('translation', new Set(), 1).wordIndex);
    }
    // Sem viés a média seria ~50 (banco vai de nível 1 a 100).
    expect(soma / AMOSTRAS).toBeLessThan(25);
  });

  it('nível alto favorece wordIndex de word.level alto', () => {
    const AMOSTRAS = 150;
    let soma = 0;
    for (let i = 0; i < AMOSTRAS; i++) {
      soma += levelDoIndice(buildQuestion('translation', new Set(), 100).wordIndex);
    }
    expect(soma / AMOSTRAS).toBeGreaterThan(75);
  });

  it('sem targetLevel explícito, usa o padrão sem lançar exceção', () => {
    expect(() => buildQuestion('translation')).not.toThrow();
  });
});

describe('buildQuestionPerPlayer — nível é por jogador, não compartilhado', () => {
  it('cada jogador recebe pergunta enviesada pelo PRÓPRIO nível', () => {
    const AMOSTRAS = 100;
    let somaA = 0, somaB = 0;
    for (let i = 0; i < AMOSTRAS; i++) {
      const { questionA, questionB } = buildQuestionPerPlayer('translation', new Set(), new Set(), 1, 100);
      somaA += levelDoIndice(questionA.wordIndex);
      somaB += levelDoIndice(questionB.wordIndex);
    }
    // A (nível 1) deve sair bem mais fácil que B (nível 100), mesmo sendo a
    // MESMA chamada, o mesmo tipo de jogo, a mesma partida.
    expect(somaA / AMOSTRAS).toBeLessThan(somaB / AMOSTRAS - 20);
  });

  it('nunca repete a mesma palavra entre os dois jogadores', () => {
    for (let i = 0; i < 30; i++) {
      const { questionA, questionB } = buildQuestionPerPlayer('translation', new Set(), new Set(), 50, 50);
      expect(questionA.wordIndex).not.toBe(questionB.wordIndex);
    }
  });
});

describe('buildMemoryGroupPerPlayer — viés por nível', () => {
  it('grupo de A (nível baixo) sai mais fácil que o de B (nível alto)', () => {
    const { questionA, questionB } = buildMemoryGroupPerPlayer(new Set(), new Set(), 1, 100);
    const mediaA = questionA.wordIndices.reduce((s, i) => s + levelDoIndice(i), 0) / 4;
    const mediaB = questionB.wordIndices.reduce((s, i) => s + levelDoIndice(i), 0) / 4;
    expect(mediaA).toBeLessThan(mediaB);
  });

  it('os 4+4 índices de A e B nunca se sobrepõem', () => {
    const { questionA, questionB } = buildMemoryGroupPerPlayer(new Set(), new Set(), 50, 50);
    const setA = new Set(questionA.wordIndices);
    for (const i of questionB.wordIndices) expect(setA.has(i)).toBe(false);
    expect(questionA.wordIndices).toHaveLength(4);
    expect(questionB.wordIndices).toHaveLength(4);
  });
});
