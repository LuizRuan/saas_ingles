import { Server } from 'socket.io';
import { env } from '../config/env.js';
import {
  waitingQueue, matches, tryMatch, createMatch,
  removeFromQueue, findMatchBySocket, destroyMatch,
} from './state.js';
import { buildQuestion, serializeQuestionForClient, pickRandomGameType } from './questionGenerator.js';
import { closeRound, nextPhase, decideWinner, validateAnswer } from './round.js';
import { sanitizeNickname } from './nicknames.js';
import { isRateLimited, sweepRateLimiter } from './rateLimiter.js';

// Tempos padrão. Injetáveis para o teste de integração rodar uma partida de 5
// rodadas em milissegundos em vez de ~1 minuto.
export const DEFAULT_TIMING = {
  roundMs: 10_000,
  roundTimeoutMarginMs: 1_500, // tolerância de rede além do prazo
  roundPauseMs: 2_200,         // pausa para revelar o resultado
  matchIntroMs: 1_500,         // banner "Oponente encontrado!" antes da 1ª rodada
  totalRounds: 5,
};

const roomName = (matchId) => `match:${matchId}`;

export const attachRealtime = (httpServer, timingOverrides = {}) => {
  const timing = { ...DEFAULT_TIMING, ...timingOverrides };

  const io = new Server(httpServer, {
    // Aceita lista separada por vírgula: sem isso, todo deploy de PREVIEW da
    // Vercel (domínio diferente a cada branch) falharia no CORS.
    cors: { origin: env.frontendOrigins, credentials: false },
    // Polling como fallback: sem ele, proxy restritivo falha em silêncio e o
    // usuário vê "0 online" sem saber que é bloqueio de rede.
    transports: ['websocket', 'polling'],
  });

  // Despejo periódico do limitador. unref() para não segurar o processo nos testes.
  const sweeper = setInterval(() => sweepRateLimiter(), 60_000);
  sweeper.unref?.();

  const broadcastPresence = () => {
    io.emit('presence:count', { sockets: io.engine.clientsCount, queue: waitingQueue.length });
  };

  const startRound = (match) => {
    match.roundIndex += 1;
    match.roundClosed = false;
    match.answers = new Map();

    const question = buildQuestion(match.gameType, new Set(match.usedIndices));
    match.usedIndices.push(question.wordIndex);
    match.currentQuestion = question;
    match.roundDeadline = Date.now() + timing.roundMs;

    io.to(roomName(match.id)).emit('round:start', {
      matchId: match.id,
      roundIndex: match.roundIndex,
      totalRounds: timing.totalRounds,
      roundDeadline: match.roundDeadline,
      // O cliente usa isto para medir a defasagem do próprio relógio. Sem ele,
      // relógio adiantado em 10s zerava o cronômetro e travava as respostas.
      serverNow: Date.now(),
      roundMs: timing.roundMs,
      question: serializeQuestionForClient(question),
    });

    if (match.roundTimer) clearTimeout(match.roundTimer);
    match.roundTimer = setTimeout(
      () => endRound(match),
      timing.roundMs + timing.roundTimeoutMarginMs,
    );
  };

  const endRound = (match) => {
    if (!matches.has(match.id)) return; // já encerrada (oponente saiu, etc.)
    if (match.roundTimer) clearTimeout(match.roundTimer);

    const closed = closeRound(match);
    if (!closed) return; // já estava fechada — o guard de idempotência

    io.to(roomName(match.id)).emit('round:result', {
      matchId: match.id,
      roundIndex: match.roundIndex,
      correctAnswer: match.currentQuestion.correctAnswer,
      answers: closed.results,
      scores: closed.scores,
    });

    if (nextPhase(match, timing.totalRounds) === 'next') {
      match.pauseTimer = setTimeout(() => {
        if (matches.has(match.id)) startRound(match);
      }, timing.roundPauseMs);
    } else {
      io.to(roomName(match.id)).emit('match:end', {
        matchId: match.id,
        scores: closed.scores,
        winnerId: decideWinner(match),
        reason: 'completed',
      });
      destroyMatch(match.id);
    }
  };

  // Encerra a partida por saída de um jogador (desconexão ou desistência).
  // Compartilhado pelos dois caminhos para não divergirem.
  const endByLeave = (match, leaverSocketId) => {
    if (!matches.has(match.id)) return;
    const opponent = match.players.find(p => p.socketId !== leaverSocketId);
    io.to(roomName(match.id)).emit('match:end', {
      matchId: match.id,
      scores: Object.fromEntries(match.scores),
      winnerId: opponent?.socketId ?? null,
      // O cliente NÃO paga estrelas quando o motivo é este (ver
      // src/utils/duelReward.js): fechava um farm de ~1000 estrelas/minuto.
      reason: 'opponent_left',
    });
    destroyMatch(match.id);
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
    // Formato interno usa socketId; o que sai pela rede usa `id`.
    const publicPlayers = players.map(p => ({ id: p.socketId, nickname: p.nickname }));

    for (const p of players) {
      io.sockets.sockets.get(p.socketId)?.join(roomName(match.id));
    }

    io.to(roomName(match.id)).emit('match:found', {
      matchId: match.id,
      gameType: match.gameType,
      totalRounds: timing.totalRounds,
      players: publicPlayers,
    });

    // Atrasa a 1ª rodada para o banner "Oponente encontrado!" existir de fato.
    // Antes startRound era chamado de forma síncrona aqui e os dois eventos
    // chegavam no mesmo tick — o banner aparecia por ~0ms.
    match.pauseTimer = setTimeout(() => {
      if (matches.has(match.id)) startRound(match);
    }, timing.matchIntroMs);

    broadcastPresence(); // a fila mudou
  };

  io.on('connection', (socket) => {
    broadcastPresence();

    socket.on('queue:join', (payload, ack) => {
      // Chave por socket.id, não por IP: no Render o TLS termina no
      // balanceador, então handshake.address é o MESMO para todos os usuários —
      // a plataforma inteira dividiria uma cota de 5 entradas por 10s.
      if (isRateLimited(`join:${socket.id}`, { windowMs: 10_000, max: 5 })) {
        return ack?.({ ok: false, error: 'Muitas tentativas. Aguarde um instante.' });
      }
      if (waitingQueue.some(p => p.socketId === socket.id) || findMatchBySocket(socket.id)) {
        return ack?.({ ok: false, error: 'Você já está na fila ou em uma partida.' });
      }

      const nickname = sanitizeNickname(payload?.nickname);
      waitingQueue.push({ socketId: socket.id, nickname, joinedAt: Date.now() });
      ack?.({ ok: true });
      broadcastPresence();
      startMatchIfPossible();
    });

    socket.on('queue:leave', (_payload, ack) => {
      removeFromQueue(socket.id);
      ack?.({ ok: true });
      broadcastPresence();
    });

    socket.on('round:answer', (payload, ack) => {
      if (isRateLimited(`answer:${socket.id}`, { windowMs: 1_000, max: 5 })) {
        return ack?.({ ok: false, error: 'Muitas respostas em pouco tempo.' });
      }

      const match = matches.get(payload?.matchId);
      const check = validateAnswer(match, socket.id, payload);
      if (!check.ok) return ack?.(check);

      match.answers.set(socket.id, { choice: payload.choice, arrivedAt: Date.now() });
      ack?.({ ok: true });

      if (match.answers.size >= match.players.length) endRound(match);
    });

    // Desistir de propósito (botão "Sair" na tela de partida).
    socket.on('duel:leave', (payload, ack) => {
      const match = matches.get(payload?.matchId) || findMatchBySocket(socket.id);
      if (match) endByLeave(match, socket.id);
      removeFromQueue(socket.id);
      ack?.({ ok: true });
      broadcastPresence();
    });

    socket.on('disconnect', () => {
      removeFromQueue(socket.id);
      const match = findMatchBySocket(socket.id);
      if (match) endByLeave(match, socket.id);
      broadcastPresence();
    });
  });

  return io;
};
