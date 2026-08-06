import { describe, it, expect } from 'vitest';
import { closeRound, nextPhase, decideWinner, validateAnswer } from './round.js';

const makeMatch = (overrides = {}) => ({
  id: 'm1',
  players: [{ socketId: 'a', nickname: 'Ana' }, { socketId: 'b', nickname: 'Beto' }],
  roundIndex: 0,
  roundClosed: false,
  currentQuestion: { correctAnswer: 'azul', options: ['azul', 'verde'] },
  roundDeadline: 10_000,
  answers: new Map(),
  scores: new Map([['a', 0], ['b', 0]]),
  ...overrides,
});

describe('closeRound', () => {
  it('pontua quem acertou e não pontua quem errou', () => {
    const match = makeMatch();
    match.answers.set('a', { choice: 'azul', arrivedAt: 5_000 });  // certo, 5s restantes
    match.answers.set('b', { choice: 'verde', arrivedAt: 5_000 }); // errado

    const out = closeRound(match);
    expect(out.results.find(r => r.id === 'a').correct).toBe(true);
    expect(out.results.find(r => r.id === 'b').correct).toBe(false);
    expect(out.scores.a).toBe(150); // 100 + 5s * 10
    expect(out.scores.b).toBe(0);
  });

  it('quem não respondeu fica com 0 e choice null', () => {
    const match = makeMatch();
    const out = closeRound(match);
    expect(out.results.every(r => r.choice === null && r.pointsEarned === 0)).toBe(true);
  });

  // REGRESSÃO: endRound não avançava roundIndex nem limpava `answers`, então uma
  // resposta que chegasse na pausa entre rodadas passava por todos os guardas,
  // batia answers.size >= 2 e chamava endRound DE NOVO — somando pontos duas
  // vezes para os dois jogadores e agendando um segundo startRound, o que
  // pulava uma rodada.
  it('é idempotente: fechar duas vezes não pontua duas vezes', () => {
    const match = makeMatch();
    match.answers.set('a', { choice: 'azul', arrivedAt: 5_000 });

    const first = closeRound(match);
    expect(first).not.toBeNull();
    expect(first.scores.a).toBe(150);

    const second = closeRound(match);
    expect(second).toBeNull();                  // recusa
    expect(match.scores.get('a')).toBe(150);    // placar intacto
  });

  it('marca a rodada como fechada', () => {
    const match = makeMatch();
    closeRound(match);
    expect(match.roundClosed).toBe(true);
  });

  it('acumula com o placar de rodadas anteriores', () => {
    const match = makeMatch({ scores: new Map([['a', 200], ['b', 100]]) });
    match.answers.set('a', { choice: 'azul', arrivedAt: 9_000 }); // 100 + 1*10
    const out = closeRound(match);
    expect(out.scores.a).toBe(310);
    expect(out.scores.b).toBe(100);
  });

  // REGRESSÃO: words.json usa capitalização ("Hello", "Good morning"). No
  // Forca o jogador digita livremente (tende a minúsculas), e no Montar
  // Palavra online o cliente monta a resposta só com letras MAIÚSCULAS dos
  // blocos (ver makeTiles em DuelOnlineGame.jsx). Um `===` sensível a caixa
  // marcava as duas como erradas mesmo quando a palavra estava certa.
  it('ignora maiúsculas/minúsculas e espaços nas bordas ao comparar a resposta', () => {
    const match = makeMatch({
      currentQuestion: { correctAnswer: 'Good morning', options: [] },
    });
    match.answers.set('a', { choice: 'good morning', arrivedAt: 5_000 });  // Forca: digitado em minúsculas
    match.answers.set('b', { choice: 'GOODMORNING', arrivedAt: 5_000 });   // não deve "acidentalmente" bater

    const out = closeRound(match);
    expect(out.results.find(r => r.id === 'a').correct).toBe(true);
    expect(out.results.find(r => r.id === 'b').correct).toBe(false);
  });

  it('ignora maiúsculas/minúsculas com espaço entre letras, como o Montar Palavra online monta a resposta', () => {
    const match = makeMatch({
      currentQuestion: { correctAnswer: 'Hello', options: [] },
    });
    match.answers.set('a', { choice: 'HELLO', arrivedAt: 5_000 }); // blocos maiúsculos concatenados
    const out = closeRound(match);
    expect(out.results.find(r => r.id === 'a').correct).toBe(true);
  });
});

describe('nextPhase', () => {
  it('continua enquanto sobram rodadas', () => {
    expect(nextPhase(makeMatch({ roundIndex: 0 }), 5)).toBe('next');
    expect(nextPhase(makeMatch({ roundIndex: 3 }), 5)).toBe('next');
  });

  it('encerra na última rodada', () => {
    expect(nextPhase(makeMatch({ roundIndex: 4 }), 5)).toBe('end');
  });
});

describe('decideWinner', () => {
  it('devolve quem tem mais pontos', () => {
    expect(decideWinner(makeMatch({ scores: new Map([['a', 300], ['b', 100]]) }))).toBe('a');
    expect(decideWinner(makeMatch({ scores: new Map([['a', 100], ['b', 300]]) }))).toBe('b');
  });

  it('devolve null em empate', () => {
    expect(decideWinner(makeMatch({ scores: new Map([['a', 200], ['b', 200]]) }))).toBeNull();
  });
});

describe('validateAnswer', () => {
  it('aceita uma resposta válida', () => {
    const match = makeMatch();
    expect(validateAnswer(match, 'a', { roundIndex: 0, choice: 'azul' }).ok).toBe(true);
  });

  it('recusa se a partida não existe', () => {
    expect(validateAnswer(null, 'a', { roundIndex: 0, choice: 'azul' }).ok).toBe(false);
  });

  // A outra metade da regressão da pontuação dupla: durante a pausa, a rodada
  // está fechada mas o roundIndex ainda é o mesmo.
  it('recusa quando a rodada já está fechada, mesmo com o roundIndex igual', () => {
    const match = makeMatch({ roundClosed: true });
    const r = validateAnswer(match, 'a', { roundIndex: 0, choice: 'azul' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/encerrada/);
  });

  it('recusa rodada diferente', () => {
    expect(validateAnswer(makeMatch(), 'a', { roundIndex: 3, choice: 'azul' }).ok).toBe(false);
  });

  it('recusa resposta repetida do mesmo jogador', () => {
    const match = makeMatch();
    match.answers.set('a', { choice: 'azul', arrivedAt: 1 });
    expect(validateAnswer(match, 'a', { roundIndex: 0, choice: 'verde' }).ok).toBe(false);
  });

  it('recusa payload inválido', () => {
    const match = makeMatch();
    expect(validateAnswer(match, 'a', { roundIndex: 0, choice: 123 }).ok).toBe(false);
    expect(validateAnswer(match, 'a', { roundIndex: 0 }).ok).toBe(false);
    expect(validateAnswer(match, 'a', { roundIndex: 0, choice: 'x'.repeat(300) }).ok).toBe(false);
  });
});
