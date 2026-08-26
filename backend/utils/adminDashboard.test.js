import { describe, expect, it } from 'vitest';
import { getTopGames, toAdminUserSummary } from './adminDashboard.js';

describe('getTopGames', () => {
  it('retorna somente os dois jogos mais jogados em ordem', () => {
    expect(getTopGames({ memory: 7, sentenceBuilder: 12, listening: 4, hangman: 0 })).toEqual([
      { id: 'sentenceBuilder', name: 'Montar Frases', plays: 12 },
      { id: 'memory', name: 'Jogo da Memória', plays: 7 },
    ]);
  });

  it('ignora contadores inválidos, jogos desconhecidos e jogos nunca usados', () => {
    expect(getTopGames({ memory: -2, hangman: '3', inventado: 999, translation: Infinity })).toEqual([
      { id: 'hangman', name: 'Jogo da Forca', plays: 3 },
    ]);
  });

  it('soma as partidas dos cursos inativos sem duplicar o curso ativo', () => {
    expect(getTopGames(
      { memory: 4, listening: 2 },
      {
        'en-pt': { gamesCompleted: { memory: 999 } },
        'es-pt': { gamesCompleted: { memory: 3, listening: 7 } },
      },
      'en-pt',
    )).toEqual([
      { id: 'listening', name: 'Jogo de Escuta', plays: 9 },
      { id: 'memory', name: 'Jogo da Memória', plays: 7 },
    ]);
  });
});

describe('toAdminUserSummary', () => {
  it('expõe apenas os dados necessários para o Dashboard', () => {
    const result = toAdminUserSummary({
      _id: 'user-1',
      nickname: 'Ana',
      passwordHash: 'nunca-pode-vazar',
      createdAt: '2026-08-25T12:00:00.000Z',
      progress: {
        totalScore: 1840,
        currentLevel: 9,
        wordsStudied: 175,
        activeCourse: 'en-pt',
        gamesCompleted: { memory: 8, translation: 5, listening: 2 },
        wordStats: { secret: { correct: 100 } },
      },
    });

    expect(result).toEqual({
      id: 'user-1',
      nickname: 'Ana',
      createdAt: '2026-08-25T12:00:00.000Z',
      activeCourse: 'en-pt',
      level: 9,
      wordsStudied: 175,
      coins: 1840,
      topGames: [
        { id: 'memory', name: 'Jogo da Memória', plays: 8 },
        { id: 'translation', name: 'Tradução', plays: 5 },
      ],
    });
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('wordStats');
    expect(result).not.toHaveProperty('progress');
  });

  it('usa padrões seguros quando ainda não existe progresso', () => {
    expect(toAdminUserSummary({ _id: 'new-user', email: 'new@example.com', progress: null })).toMatchObject({
      id: 'new-user',
      level: 1,
      wordsStudied: 0,
      coins: 0,
      activeCourse: 'en-pt',
      topGames: [],
    });
  });
});
