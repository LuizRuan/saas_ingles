import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { waitingQueue, matches, tryMatch, createMatch, removeFromQueue, findMatchBySocket, destroyMatch } from './state.js';
import { buildQuestion, serializeQuestionForClient, pickRandomGameType } from './questionGenerator.js';
import { sanitizeNickname } from './nicknames.js';
import { isRateLimited } from './rateLimiter.js';
import { scoreFor } from './scoring.js';

const ROUND_MS = 10_000;         // mesma duração de rodada do modo Bot
const ROUND_TIMEOUT_MARGIN_MS = 1_500; // tolerância de rede além do prazo
const ROUND_PAUSE_MS = 2_200;    // mesma pausa de "revelar resultado" do modo Bot
const TOTAL_ROUNDS = 5;

const roomName = (matchId) => `match:${matchId}`;

export const attachRealtime = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: env.frontendOrigin, credentials: false },
    // O duelo é anônimo (apelido descartável, não o cookie de sessão) —
    // credentials:false de propósito, ver CLAUDE.md.
  });

  const broadcastPresence = () => {
    io.emit('presence:count', io.engine.clientsCount);
  };

  const startRound = (match) => {
    match.roundIndex += 1;
    const usedIndices = new Set(match.usedIndices || []);
    const question = buildQuestion(match.gameType, usedIndices);
    match.usedIndices = [...usedIndices, question.wordIndex];
    match.currentQuestion = question;
    match.answers = new Map();
    match.roundDeadline = Date.now() + ROUND_MS;

    io.to(roomName(match.id)).emit('round:start', {
      matchId: match.id,
      roundIndex: match.roundIndex,
      totalRounds: TOTAL_ROUNDS,
      roundDeadline: match.roundDeadline,
      question: serializeQuestionForClient(question),
    });

    if (match.roundTimer) clearTimeout(match.roundTimer);
    match.roundTimer = setTimeout(() => endRound(match), ROUND_MS + ROUND_TIMEOUT_MARGIN_MS);
  };

  const endRound = (match) => {
    if (!matches.has(match.id)) return; // já encerrada (oponente saiu, etc.)
    if (match.roundTimer) clearTimeout(match.roundTimer);

    const results = match.players.map((p) => {
      const answer = match.answers.get(p.socketId);
      const isCorrect = Boolean(answer) && answer.choice === match.currentQuestion.correctAnswer;
      const points = answer ? scoreFor(isCorrect, match.roundDeadline, answer.arrivedAt) : 0;
      match.scores.set(p.socketId, (match.scores.get(p.socketId) || 0) + points);
      return { id: p.socketId, choice: answer?.choice ?? null, correct: isCorrect, pointsEarned: points };
    });

    io.to(roomName(match.id)).emit('round:result', {
      matchId: match.id,
      roundIndex: match.roundIndex,
      correctAnswer: match.currentQuestion.correctAnswer,
      answers: results,
      scores: Object.fromEntries(match.scores),
    });

    if (match.roundIndex + 1 < TOTAL_ROUNDS) {
      setTimeout(() => {
        if (matches.has(match.id)) startRound(match);
      }, ROUND_PAUSE_MS);
    } else {
      const [p1, p2] = match.players;
      const s1 = match.scores.get(p1.socketId) || 0;
      const s2 = match.scores.get(p2.socketId) || 0;
      const winnerId = s1 === s2 ? null : (s1 > s2 ? p1.socketId : p2.socketId);
      io.to(roomName(match.id)).emit('match:end', {
        matchId: match.id,
        scores: Object.fromEntries(match.scores),
        winnerId,
        reason: 'completed',
      });
      destroyMatch(match.id);
    }
  };

  const startMatchIfPossible = () => {
    const { pair, rest } = tryMatch(waitingQueue);
    if (!pair) return;
    waitingQueue.length = 0;
    waitingQueue.push(...rest);

    const [a, b] = pair;
    const players = [
      { socketId: a.socketId, nickname: a.nickname },
      { socketId: b.socketId, nickname: b.nickname },
    ];
    const match = createMatch(players, pickRandomGameType());
    // players/socketId é o formato interno (state.js); o que sai pela rede
    // usa `id`, mais limpo para o cliente consumir.
    const publicPlayers = players.map(p => ({ id: p.socketId, nickname: p.nickname }));

    for (const p of players) {
      const s = io.sockets.sockets.get(p.socketId);
      s?.join(roomName(match.id));
    }

    io.to(roomName(match.id)).emit('match:found', {
      matchId: match.id,
      gameType: match.gameType,
      totalRounds: TOTAL_ROUNDS,
      players: publicPlayers,
    });

    startRound(match);
  };

  io.on('connection', (socket) => {
    broadcastPresence();

    socket.on('queue:join', (payload, ack) => {
      if (isRateLimited(`join:${socket.handshake.address}`, { windowMs: 10_000, max: 5 })) {
        return ack?.({ ok: false, error: 'Muitas tentativas. Aguarde um instante.' });
      }
      if (waitingQueue.some(p => p.socketId === socket.id) || findMatchBySocket(socket.id)) {
        return ack?.({ ok: false, error: 'Você já está na fila ou em uma partida.' });
      }
      const nickname = sanitizeNickname(payload?.nickname);
      waitingQueue.push({ socketId: socket.id, nickname, joinedAt: Date.now() });
      ack?.({ ok: true });
      startMatchIfPossible();
    });

    socket.on('queue:leave', (_payload, ack) => {
      removeFromQueue(socket.id);
      ack?.({ ok: true });
    });

    socket.on('round:answer', (payload, ack) => {
      if (isRateLimited(`answer:${socket.id}`, { windowMs: 1_000, max: 5 })) {
        return ack?.({ ok: false, error: 'Muitas respostas em pouco tempo.' });
      }
      const match = matches.get(payload?.matchId);
      if (!match) return ack?.({ ok: false, error: 'Partida não encontrada.' });
      if (payload?.roundIndex !== match.roundIndex) {
        return ack?.({ ok: false, error: 'Rodada já encerrada.' });
      }
      if (match.answers.has(socket.id)) {
        return ack?.({ ok: false, error: 'Você já respondeu esta rodada.' });
      }
      if (typeof payload?.choice !== 'string' || payload.choice.length > 200) {
        return ack?.({ ok: false, error: 'Resposta inválida.' });
      }

      match.answers.set(socket.id, { choice: payload.choice, arrivedAt: Date.now() });
      ack?.({ ok: true });

      if (match.answers.size >= match.players.length) endRound(match);
    });

    socket.on('disconnect', () => {
      removeFromQueue(socket.id);

      const match = findMatchBySocket(socket.id);
      if (match) {
        const opponent = match.players.find(p => p.socketId !== socket.id);
        io.to(roomName(match.id)).emit('match:end', {
          matchId: match.id,
          scores: Object.fromEntries(match.scores),
          winnerId: opponent?.socketId ?? null,
          reason: 'opponent_left',
        });
        destroyMatch(match.id);
      }

      broadcastPresence();
    });
  });

  return io;
};
