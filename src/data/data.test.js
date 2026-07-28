// Integridade do conteúdo. Estes testes existem porque o conteúdo é editado à
// mão: uma categoria com nome errado ou uma palavra duplicada quebra em
// silêncio o progresso (wordStats é indexado pela grafia da palavra).
import { describe, it, expect } from 'vitest';
import { words } from './words';
import { categories, levels } from './categories';
import { sentences, fillBlanks, trueFalse, translationQuizzes } from './sentences';
import { conversations } from './conversations';
import { achievementsList } from './achievements';

describe('palavras', () => {
  it('não tem grafias duplicadas (a chave do progresso é word.en)', () => {
    const dupes = words.map(w => w.en).filter((v, i, a) => a.indexOf(v) !== i);
    expect(dupes).toEqual([]);
  });

  it('tem todos os campos que a UI mostra', () => {
    const incompletas = words
      .filter(w => !w.en || !w.pt || !w.category || !w.level || !w.pronunciation || !w.example || !w.examplePt || !w.tip)
      .map(w => w.en);
    expect(incompletas).toEqual([]);
  });

  it('só usa categorias declaradas em categories.js', () => {
    const ids = new Set(categories.map(c => c.id));
    expect(words.filter(w => !ids.has(w.category)).map(w => w.en)).toEqual([]);
  });

  it('tem pelo menos 4 palavras por categoria (para montar alternativas)', () => {
    const magras = categories
      .map(c => [c.id, words.filter(w => w.category === c.id).length])
      .filter(([, n]) => n < 4);
    expect(magras).toEqual([]);
  });
});

describe('níveis', () => {
  it('começa em 0 e cresce estritamente', () => {
    expect(levels[0].wordsNeeded).toBe(0);
    levels.forEach((l, i) => {
      if (i > 0) expect(l.wordsNeeded).toBeGreaterThan(levels[i - 1].wordsNeeded);
    });
  });

  it('o último nível cabe no acervo de vocabulário', () => {
    // Regressão: níveis 9 e 10 pediam 260 e 300 com apenas 239 palavras
    expect(levels[levels.length - 1].wordsNeeded).toBeLessThanOrEqual(words.length);
  });
});

describe('conquistas', () => {
  it('tem ids únicos', () => {
    const dupes = achievementsList.map(a => a.id).filter((v, i, a) => a.indexOf(v) !== i);
    expect(dupes).toEqual([]);
  });

  it('nenhuma condição quebra com progresso vazio', () => {
    achievementsList.forEach(a => expect(() => a.condition({})).not.toThrow());
  });

  it('todas são alcançáveis', () => {
    const tudo = {
      wordsStudied: 999, totalCorrect: 999, bestStreak: 99, sentencesCompleted: 99,
      conversationsCompleted: 99, dayStreak: 99, dailyChallengesCompleted: 99,
      currentLevel: 10, wordsReviewed: 99, totalScore: 99999, categoriesExplored: 99,
      shopPurchases: 9, gamesCompleted: { memory: 9, hangman: 9 },
    };
    const inalcancaveis = achievementsList.filter(a => !a.condition(tudo)).map(a => a.id);
    expect(inalcancaveis).toEqual([]);
  });
});

describe('frases e quizzes', () => {
  it('toda frase remonta a partir dos seus chips', () => {
    // O SentenceBuilder valida comparando os chips entre si, mas o enunciado
    // mostrado vem de `en`: divergir confunde o usuário.
    const limpa = (s) => s.replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    const divergentes = sentences
      .filter(s => limpa(s.words.map(w => w.en).join(' ')) !== limpa(s.en))
      .map(s => s.en);
    expect(divergentes).toEqual([]);
  });

  it('os bancos de exercício não estão vazios', () => {
    expect(fillBlanks.length).toBeGreaterThan(0);
    expect(trueFalse.length).toBeGreaterThan(0);
    expect(translationQuizzes.length).toBeGreaterThan(0);
  });

  it('a resposta certa existe entre as alternativas', () => {
    fillBlanks.forEach(q => expect(q.options).toContain(q.answer));
    translationQuizzes.forEach(q => expect(q.options).toContain(q.correct));
  });
});

describe('conversas', () => {
  it('todo turno do usuário tem ao menos uma opção correta', () => {
    const quebradas = conversations
      .filter(c => c.messages.some(m => m.role === 'user' && !(m.options || []).some(o => o.correct)))
      .map(c => c.id);
    expect(quebradas).toEqual([]);
  });
});
