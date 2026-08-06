// Teste de integração do duelo: dois clientes de socket REAIS contra o
// servidor real, numa porta efêmera.
//
// Existe porque os testes unitários não pegariam nada disto: a ordem dos
// eventos, os dois jogadores recebendo a MESMA pergunta, o vazamento de
// `correctAnswer`, e a pontuação dupla na janela de pausa entre rodadas. Os
// tempos são injetados para uma partida de 5 rodadas rodar em ~1s em vez de
// ~1 minuto.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'node:http';
import { io as ioClient } from 'socket.io-client';
import { app } from '../app.js';
import { attachRealtime } from './index.js';
import { waitingQueue, matches } from './state.js';
import { resetRateLimiter } from './rateLimiter.js';

const TIMING = {
  roundMs: 150,
  roundTimeoutMarginMs: 50,
  roundPauseMs: 80,
  matchIntroMs: 30,
  totalRounds: 5,
};

let httpServer;
let ioServer;
let url;

beforeAll(async () => {
  httpServer = http.createServer(app);
  ioServer = attachRealtime(httpServer, TIMING);
  await new Promise(resolve => httpServer.listen(0, resolve));
  url = `http://localhost:${httpServer.address().port}`;
});

afterAll(async () => {
  ioServer.close();
  await new Promise(resolve => httpServer.close(resolve));
});

beforeEach(() => {
  waitingQueue.length = 0;
  for (const id of [...matches.keys()]) matches.delete(id);
  resetRateLimiter();
});

// O servidor emite presence:count dentro do próprio handler de conexão, ou
// seja, ANTES de qualquer listener registrado depois do `connect` resolver.
// Por isso o coletor é anexado aqui, junto da criação do socket, e o último
// payload fica guardado em `s.lastPresence`.
const connect = () => new Promise((resolve, reject) => {
  const s = ioClient(url, { transports: ['websocket'], forceNew: true });
  s.lastPresence = null;
  s.on('presence:count', (p) => { s.lastPresence = p; });

  const t = setTimeout(() => reject(new Error('timeout ao conectar')), 4000);
  s.on('connect', () => { clearTimeout(t); resolve(s); });
  s.on('connect_error', (e) => { clearTimeout(t); reject(e); });
});

/** Espera até que uma condição seja verdadeira, ou estoure o tempo. */
const waitFor = async (predicate, ms = 3000) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (predicate()) return true;
    await new Promise(r => setTimeout(r, 20));
  }
  throw new Error('timeout esperando condição');
};

const once = (socket, event, ms = 4000) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error(`timeout esperando ${event}`)), ms);
  socket.once(event, (payload) => { clearTimeout(t); resolve(payload); });
});

const emitAck = (socket, event, payload) =>
  new Promise(resolve => socket.emit(event, payload, resolve));

/**
 * Pareia dois clientes. Registra TODOS os listeners antes de qualquer join: o
 * servidor pode emitir match:found no mesmo tick do segundo join, e um once()
 * registrado depois perde o evento.
 */
const pair = async () => {
  const p1 = await connect();
  const p2 = await connect();
  const found1 = once(p1, 'match:found');
  const found2 = once(p2, 'match:found');
  const round1 = once(p1, 'round:start');
  const round2 = once(p2, 'round:start');

  await emitAck(p1, 'queue:join', { nickname: 'Ana' });
  await emitAck(p2, 'queue:join', { nickname: 'Beto' });

  const [m1, m2] = await Promise.all([found1, found2]);
  const [r1, r2] = await Promise.all([round1, round2]);
  return { p1, p2, m1, m2, r1, r2 };
};

describe('duelo — pareamento e primeira rodada', () => {
  it('pareia os dois no mesmo matchId, com um tipo de jogo válido', async () => {
    const { p1, p2, m1, m2 } = await pair();
    expect(m1.matchId).toBe(m2.matchId);
    expect(m1.totalRounds).toBe(5);
    expect(m1.players).toHaveLength(2);
    expect([
      'translation', 'trueFalse', 'listening', 'wordBuilder',
      'sentenceBuilder', 'fillBlanks', 'hangman', 'memory',
    ]).toContain(m1.gameType);
    p1.disconnect(); p2.disconnect();
  });

  it('cada jogador recebe uma pergunta DIFERENTE, mas do mesmo tipo e com o mesmo prazo', async () => {
    const { p1, p2, r1, r2 } = await pair();
    // Tipo de jogo é o mesmo para os dois
    expect(r1.question.type).toBe(r2.question.type);
    // Prazo e metadados de sincronização são compartilhados
    expect(r1.roundDeadline).toBe(r2.roundDeadline);
    expect(r1.roundMs).toBe(r2.roundMs);
    // As perguntas em si devem ser diferentes (palavras e opções distintas)
    expect(r1.question).not.toEqual(r2.question);
    p1.disconnect(); p2.disconnect();
  });

  it('nunca manda correctAnswer antes da rodada fechar', async () => {
    const { p1, p2, r1 } = await pair();
    expect(r1.question).not.toHaveProperty('correctAnswer');
    expect(JSON.stringify(r1)).not.toContain('correctAnswer');
    p1.disconnect(); p2.disconnect();
  });

  it('manda serverNow para o cliente medir defasagem de relógio', async () => {
    const { p1, p2, r1 } = await pair();
    expect(typeof r1.serverNow).toBe('number');
    expect(typeof r1.roundMs).toBe('number');
    p1.disconnect(); p2.disconnect();
  });
});

describe('duelo — pontuação', () => {
  // REGRESSÃO: resposta chegando na pausa entre rodadas fazia endRound rodar de
  // novo, somando pontos duas vezes e agendando um segundo startRound.
  it('resposta atrasada na pausa entre rodadas não pontua nem duplica o resultado', async () => {
    const { p1, p2, m1, r1 } = await pair();

    const results = [];
    p1.on('round:result', (r) => results.push(r));

    // Tipo sorteado pode ser hangman (sem `options`) — a resposta em si não
    // importa pra este teste, só o comportamento de fechamento/duplicação.
    const anyChoice = r1.question.options?.[0] ?? 'x';

    // Só p1 responde; p2 fica calado para a rodada fechar por tempo.
    await emitAck(p1, 'round:answer', { matchId: m1.matchId, roundIndex: 0, choice: anyChoice });
    const firstResult = await once(p1, 'round:result');
    const scoresAfterFirst = { ...firstResult.scores };

    // p2 responde DEPOIS de fechada, dentro da janela de pausa.
    const late = await emitAck(p2, 'round:answer', { matchId: m1.matchId, roundIndex: 0, choice: anyChoice });
    expect(late.ok).toBe(false);
    expect(late.error).toMatch(/encerrada/);

    // Espera o suficiente para um segundo round:result indevido aparecer.
    await new Promise(r => setTimeout(r, TIMING.roundPauseMs + 60));
    const resultsForRound0 = results.filter(r => r.roundIndex === 0);
    expect(resultsForRound0).toHaveLength(1);
    expect(resultsForRound0[0].scores).toEqual(scoresAfterFirst);

    p1.disconnect(); p2.disconnect();
  });

  it('joga as 5 rodadas e encerra uma única vez com reason completed', async () => {
    const { p1, p2, m1 } = await pair();

    const ends = [];
    p1.on('match:end', (e) => ends.push(e));

    // Responde automaticamente cada rodada nos dois clientes. O tipo sorteado
    // pode ser hangman, que não tem `options` (a resposta em si não importa
    // pra este teste — só fechar as 5 rodadas).
    const autoAnswer = (socket) => socket.on('round:start', (r) => {
      socket.emit('round:answer', { matchId: r.matchId, roundIndex: r.roundIndex, choice: r.question.options?.[0] ?? 'x' }, () => {});
    });
    autoAnswer(p1);
    autoAnswer(p2);
    // A rodada 0 já começou antes dos listeners; responde manualmente.
    p1.emit('round:answer', { matchId: m1.matchId, roundIndex: 0, choice: 'x' }, () => {});
    p2.emit('round:answer', { matchId: m1.matchId, roundIndex: 0, choice: 'y' }, () => {});

    const end = await once(p1, 'match:end', 6000);
    expect(end.reason).toBe('completed');
    expect(Object.keys(end.scores)).toHaveLength(2);

    await new Promise(r => setTimeout(r, 200));
    expect(ends).toHaveLength(1);

    p1.disconnect(); p2.disconnect();
  });
});

describe('duelo — saída de um jogador', () => {
  it('desconexão encerra com opponent_left e o sobrevivente como winnerId', async () => {
    const { p1, p2, m1 } = await pair();
    const endPromise = once(p1, 'match:end');
    p2.disconnect();

    const end = await endPromise;
    expect(end.reason).toBe('opponent_left');
    expect(end.matchId).toBe(m1.matchId);
    // O cliente é quem decide não pagar estrelas nesse caso (duelReward.js).
    expect(end.winnerId).toBeTruthy();

    p1.disconnect();
  });

  it('duel:leave se comporta igual a uma desconexão', async () => {
    const { p1, p2, m1 } = await pair();
    const endPromise = once(p1, 'match:end');
    await emitAck(p2, 'duel:leave', { matchId: m1.matchId });

    const end = await endPromise;
    expect(end.reason).toBe('opponent_left');

    p1.disconnect(); p2.disconnect();
  });

  it('a partida sai do Map depois de encerrada (sem vazamento)', async () => {
    const { p1, p2, m1 } = await pair();
    const endPromise = once(p1, 'match:end');
    await emitAck(p2, 'duel:leave', { matchId: m1.matchId });
    await endPromise;

    expect(matches.has(m1.matchId)).toBe(false);
    p1.disconnect(); p2.disconnect();
  });
});

describe('duelo — presença', () => {
  it('presence:count informa sockets e tamanho da fila', async () => {
    const p1 = await connect();

    await waitFor(() => p1.lastPresence !== null);
    expect(typeof p1.lastPresence.sockets).toBe('number');
    expect(p1.lastPresence.sockets).toBeGreaterThanOrEqual(1);
    expect(p1.lastPresence.queue).toBe(0);

    await emitAck(p1, 'queue:join', { nickname: 'Ana' });
    await waitFor(() => p1.lastPresence.queue === 1);
    expect(p1.lastPresence.queue).toBe(1);

    p1.disconnect();
  });

  it('recusa entrar na fila duas vezes', async () => {
    const p1 = await connect();
    const first = await emitAck(p1, 'queue:join', { nickname: 'Ana' });
    const second = await emitAck(p1, 'queue:join', { nickname: 'Ana' });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    p1.disconnect();
  });
});

describe('duelo — forca (hangman letra a letra)', () => {
  const pairHangman = async () => {
    const p1 = await connect();
    const p2 = await connect();
    const found1 = once(p1, 'match:found');
    const found2 = once(p2, 'match:found');
    const round1 = once(p1, 'round:start');
    const round2 = once(p2, 'round:start');

    await emitAck(p1, 'queue:join', { nickname: 'Ana', gameTypePreference: 'hangman' });
    await emitAck(p2, 'queue:join', { nickname: 'Beto', gameTypePreference: 'hangman' });

    const [m1, m2] = await Promise.all([found1, found2]);
    const [r1, r2] = await Promise.all([round1, round2]);
    return { p1, p2, m1, m2, r1, r2 };
  };

  it('resolve hangman quando os dois pedem, sem vazar options nem correctAnswer', async () => {
    const { p1, p2, m1, r1 } = await pairHangman();
    expect(m1.gameType).toBe('hangman');
    expect(r1.question.type).toBe('hangman');
    expect(r1.question).not.toHaveProperty('options');
    expect(r1.question).not.toHaveProperty('correctAnswer');
    expect(typeof r1.question.prompt.wordTemplate).toBe('string');
    expect(r1.question.prompt.wordTemplate).not.toMatch(/[A-Za-z]/);
    p1.disconnect(); p2.disconnect();
  });

  it('chutar uma letra devolve posições consistentes com o template', async () => {
    const { p1, p2, m1, r1 } = await pairHangman();
    const template = r1.question.prompt.wordTemplate;
    const res = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(res.ok).toBe(true);
    if (res.inWord) {
      expect(res.positions.length).toBeGreaterThan(0);
      for (const pos of res.positions) expect(template[pos]).toBe('#');
    } else {
      expect(res.positions).toEqual([]);
    }
    p1.disconnect(); p2.disconnect();
  });

  it('recusa letra repetida', async () => {
    const { p1, p2, m1 } = await pairHangman();
    const first = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(first.ok).toBe(true);
    const second = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(second.ok).toBe(false);
    p1.disconnect(); p2.disconnect();
  });

  it('recusa formato de letra inválido', async () => {
    const { p1, p2, m1 } = await pairHangman();
    const lower = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'a' });
    expect(lower.ok).toBe(false);
    const multi = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'AB' });
    expect(multi.ok).toBe(false);
    p1.disconnect(); p2.disconnect();
  });

  it('recusa chute de letra depois que o jogador já enviou a palavra final', async () => {
    const { p1, p2, m1 } = await pairHangman();
    await emitAck(p1, 'round:answer', { matchId: m1.matchId, roundIndex: 0, choice: 'qualquer coisa' });
    const afterAnswer = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(afterAnswer.ok).toBe(false);
    p1.disconnect(); p2.disconnect();
  });
});
