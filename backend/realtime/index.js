import { Server } from 'socket.io';
import { env } from '../config/env.js';
import {
  waitingQueue, privateRooms, matches, tryMatch, createMatch,
  removeFromQueue, findMatchBySocket, destroyMatch,
} from './state.js';
import {
  buildQuestionPerPlayer, buildMemoryGroupPerPlayer,
  serializeQuestionForClient, pickRandomGameType, GAME_TYPE_IDS,
} from './questionGenerator.js';
import { closeRound, nextPhase, decideWinner, validateAnswer, validateLetterGuess, resolveLetterGuess } from './round.js';
import { sanitizeNickname } from './nicknames.js';
import { isRateLimited, sweepRateLimiter } from './rateLimiter.js';
import { verifyDuelTicket } from '../utils/token.js';
import { decideTrophyAward } from './trophy.js';
import { awardTrophy } from './trophyAward.js';

// Tempos padrão. Injetáveis para o teste de integração rodar uma partida de 5
// rodadas em milissegundos em vez de ~1 minuto.
export const DEFAULT_TIMING = {
  roundMs: 60_000,            // 60s por rodada
  roundTimeoutMarginMs: 2_000, // tolerância de rede além do prazo
  roundPauseMs: 2_500,         // pausa para revelar o resultado
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

  /**
   * Presença inclui contagem por tipo de jogo para que o cliente mostre
   * "X procurando Forca", "Y procurando Tradução" etc.
   */
  const broadcastPresence = () => {
    const byType = {};
    for (const entry of waitingQueue) {
      const key = entry.gameTypePreference ?? 'random';
      byType[key] = (byType[key] ?? 0) + 1;
    }
    io.emit('presence:count', {
      sockets: io.engine.clientsCount,
      queue: waitingQueue.length,
      byType,
    });
  };

  /**
   * Inicia uma rodada gerando uma questão DIFERENTE para cada jogador.
   * A emissão é individual (io.to(socketId)) — cada um vê só a própria pergunta.
   */
  const startRound = (match) => {
    match.roundIndex += 1;
    match.roundClosed = false;
    match.answers = new Map();
    match.roundDeadline = Date.now() + timing.roundMs;

    const [pA, pB] = match.players;
    const pdA = match.playerData.get(pA.socketId);
    const pdB = match.playerData.get(pB.socketId);

    let qA, qB;
    if (match.gameType === 'memory') {
      // Memory: cada jogador recebe 4 palavras distintas
      ({ questionA: qA, questionB: qB } = buildMemoryGroupPerPlayer(
        new Set(pdA.usedIndices),
        new Set(pdB.usedIndices),
      ));
      pdA.usedIndices.push(...qA.wordIndices);
      pdB.usedIndices.push(...qB.wordIndices);
    } else {
      // Todos os outros tipos: uma palavra diferente por jogador
      ({ questionA: qA, questionB: qB } = buildQuestionPerPlayer(
        match.gameType,
        new Set(pdA.usedIndices),
        new Set(pdB.usedIndices),
      ));
      pdA.usedIndices.push(qA.wordIndex);
      pdB.usedIndices.push(qB.wordIndex);
    }

    pdA.currentQuestion = qA;
    pdB.currentQuestion = qB;
    pdA.guessedLetters = new Set();
    pdB.guessedLetters = new Set();

    // match.currentQuestion = null em partidas novas; mantido null pois
    // closeRound agora lê de playerData.
    match.currentQuestion = null;

    const base = {
      matchId: match.id,
      roundIndex: match.roundIndex,
      totalRounds: timing.totalRounds,
      roundDeadline: match.roundDeadline,
      serverNow: Date.now(),
      roundMs: timing.roundMs,
    };

    // ⬇️  Emissão INDIVIDUAL — cada jogador vê só a própria pergunta
    io.to(pA.socketId).emit('round:start', { ...base, question: serializeQuestionForClient(qA) });
    io.to(pB.socketId).emit('round:start', { ...base, question: serializeQuestionForClient(qB) });

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
    if (!closed) return; // já estava fechada — guard de idempotência

    // round:result é emitido individualmente: cada um vê seu próprio correctAnswer
    for (const p of match.players) {
      const pd = match.playerData.get(p.socketId);
      io.to(p.socketId).emit('round:result', {
        matchId: match.id,
        roundIndex: match.roundIndex,
        correctAnswer: pd?.currentQuestion?.correctAnswer ?? null,
        answers: closed.results,
        scores: closed.scores,
      });
    }

    if (nextPhase(match, timing.totalRounds) === 'next') {
      match.pauseTimer = setTimeout(() => {
        if (matches.has(match.id)) startRound(match);
      }, timing.roundPauseMs);
    } else {
      const winnerId = decideWinner(match);
      io.to(roomName(match.id)).emit('match:end', {
        matchId: match.id,
        scores: closed.scores,
        winnerId,
        reason: 'completed',
      });

      // Fire-and-forget, DEPOIS do match:end já entregue — um Mongo lento ou
      // fora do ar nunca atrasa nem derruba a partida para os jogadores.
      const award = decideTrophyAward(match, winnerId);
      if (award) awardTrophy(award).catch(() => {});

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
    destroyMatch(match.id, 0);
  };

  const startMatchIfPossible = () => {
    const { pair, rest, resolvedType } = tryMatch(waitingQueue);
    if (!pair) return;
    waitingQueue.length = 0;
    waitingQueue.push(...rest);

    const [a, b] = pair;
    const players = [
      { socketId: a.socketId, nickname: a.nickname, userId: a.userId, avatar: a.avatar },
      { socketId: b.socketId, nickname: b.nickname, userId: b.userId, avatar: b.avatar },
    ];
    // Usa o tipo resolvido pelo tryMatch, ou sorteia se ambos eram 'random'
    const gameType = resolvedType ?? pickRandomGameType();
    const match = createMatch(players, gameType);
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

      // Ticket ausente, expirado ou inválido degrada pra convidado — nunca
      // derruba a conexão. userId/avatar só existem quando o ticket é real.
      let identity = { userId: null, avatar: null, ticketNickname: null };
      if (payload?.authTicket) {
        try {
          const claim = verifyDuelTicket(payload.authTicket);
          identity = { userId: claim.sub, avatar: claim.avatar, ticketNickname: claim.nickname };
        } catch { /* segue como convidado */ }
      }

      // Identidade verificada vence o nickname solto do payload — nunca
      // confiar no texto livre pra decidir QUEM é o jogador.
      const nickname = sanitizeNickname(identity.ticketNickname ?? payload?.nickname);

      // Valida preferência de tipo: aceita 'random' ou qualquer GAME_TYPE_IDS válido
      const rawPref = payload?.gameTypePreference;
      const gameTypePreference = GAME_TYPE_IDS.includes(rawPref) ? rawPref : 'random';

      waitingQueue.push({
        socketId: socket.id, nickname, joinedAt: Date.now(), gameTypePreference,
        userId: identity.userId, avatar: identity.avatar,
      });
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

    // Forca online: um chute de letra por vez. O servidor nunca manda a
    // palavra inteira — só se a letra está nela e em que posições.
    socket.on('hangman:guess', (payload, ack) => {
      if (isRateLimited(`hangman:${socket.id}`, { windowMs: 1_000, max: 15 })) {
        return ack?.({ ok: false, error: 'Muitas tentativas em pouco tempo.' });
      }

      const match = matches.get(payload?.matchId);
      const check = validateLetterGuess(match, socket.id, payload);
      if (!check.ok) return ack?.(check);

      const pd = match.playerData.get(socket.id);
      pd.guessedLetters.add(payload.letter);
      const { inWord, positions } = resolveLetterGuess(pd.currentQuestion?.correctAnswer, payload.letter);
      ack?.({ ok: true, inWord, positions });
    });

    // Desistir de propósito (botão "Sair" na tela de partida).
    socket.on('duel:leave', (payload, ack) => {
      const match = matches.get(payload?.matchId) || findMatchBySocket(socket.id);
      if (match) endByLeave(match, socket.id);
      removeFromQueue(socket.id);
      ack?.({ ok: true });
      broadcastPresence();
    });

    // ─── Coringas (wildcards) ────────────────────────────────────────────────
    // Rate-limit conservador: 3 usos por 30s por socket.
    socket.on('wildcard:use', (payload, ack) => {
      if (isRateLimited(`wildcard:${socket.id}`, { windowMs: 30_000, max: 3 })) {
        return ack?.({ ok: false, error: 'Muitos coringas em pouco tempo.' });
      }

      const VALID_WILDCARDS = ['flip', 'blur', 'shuffle', 'time_steal', 'mute'];
      const { matchId, wildcardValue } = payload ?? {};

      if (!VALID_WILDCARDS.includes(wildcardValue)) {
        return ack?.({ ok: false, error: 'Coringa inválido.' });
      }

      const match = matches.get(matchId);
      if (!match) return ack?.({ ok: false, error: 'Partida não encontrada.' });
      if (match.roundClosed) return ack?.({ ok: false, error: 'Rodada já encerrada.' });

      // 1 uso por tipo por partida
      const myUsed = match.wildcardUsed?.get(socket.id);
      if (!myUsed) return ack?.({ ok: false, error: 'Partida inválida.' });
      if (myUsed.has(wildcardValue)) {
        return ack?.({ ok: false, error: 'Você já usou este coringa nesta partida.' });
      }
      myUsed.add(wildcardValue);

      const opponent = match.players.find(p => p.socketId !== socket.id);
      if (!opponent) return ack?.({ ok: false, error: 'Oponente não encontrado.' });

      if (wildcardValue === 'time_steal') {
        // Rouba 5s do oponente e adiciona ao atirador
        const STEAL_MS = 5_000;
        match.roundDeadline = match.roundDeadline + STEAL_MS; // mais tempo pra quem usou

        // Notifica ambos com os novos deadlines
        io.to(socket.id).emit('wildcard:time_update', {
          matchId, newDeadline: match.roundDeadline, delta: +STEAL_MS,
        });
        io.to(opponent.socketId).emit('wildcard:time_update', {
          matchId, newDeadline: match.roundDeadline - STEAL_MS * 2, delta: -STEAL_MS,
        });
      } else {
        // Todos os outros: repassa o efeito direto ao oponente
        io.to(opponent.socketId).emit('wildcard:effect', {
          matchId, wildcardValue,
        });
      }

      ack?.({ ok: true });
    });

    // ─── Emotes de Reação ────────────────────────────────────────────────────
    socket.on('emote:send', (payload, ack) => {
      if (isRateLimited(`emote:${socket.id}`, { windowMs: 2_000, max: 1 })) {
        return ack?.({ ok: false, error: 'Aguarde para enviar outro emote.' });
      }

      const { matchId, emoji } = payload ?? {};
      const match = matches.get(matchId);
      if (!match) return ack?.({ ok: false, error: 'Partida não encontrada.' });

      const opponent = match.players.find(p => p.socketId !== socket.id);
      if (opponent) {
        io.to(opponent.socketId).emit('emote:receive', { senderId: socket.id, emoji });
      }
      ack?.({ ok: true });
    });

    // ─── Revanche Imediata ───────────────────────────────────────────────────
    socket.on('rematch:request', (payload, ack) => {
      const { matchId } = payload ?? {};
      // Procura o oponente na partida (ou partida recém encerrada)
      const lastMatch = matches.get(matchId);
      if (!lastMatch) return ack?.({ ok: false, error: 'Partida não encontrada para revanche.' });

      const opponent = lastMatch.players.find(p => p.socketId !== socket.id);
      if (!opponent) return ack?.({ ok: false, error: 'Oponente não encontrado.' });

      // Notifica o oponente sobre a revanche solicitada (15s timeout)
      io.to(opponent.socketId).emit('rematch:proposed', {
        matchId,
        requesterName: lastMatch.players.find(p => p.socketId === socket.id)?.nickname || 'Oponente',
        timeoutMs: 15_000,
      });

      // Limpa timer anterior se houver e agenda recusa por timeout
      if (lastMatch.rematchTimer) clearTimeout(lastMatch.rematchTimer);
      lastMatch.rematchTimer = setTimeout(() => {
        io.to(socket.id).emit('rematch:declined', { reason: 'timeout' });
      }, 15_000);

      ack?.({ ok: true });
    });

    socket.on('rematch:respond', (payload, ack) => {
      const { matchId, accept } = payload ?? {};
      const lastMatch = matches.get(matchId);

      if (lastMatch?.rematchTimer) clearTimeout(lastMatch.rematchTimer);

      if (!accept) {
        const requester = lastMatch?.players.find(p => p.socketId !== socket.id);
        if (requester) {
          io.to(requester.socketId).emit('rematch:declined', { reason: 'refused' });
        }
        return ack?.({ ok: true });
      }

      if (!lastMatch) return ack?.({ ok: false, error: 'Partida expirada.' });

      // Se aceitou: cria uma nova partida direta entre os 2 instantaneamente
      const players = lastMatch.players;
      destroyMatch(matchId, 0); // Destrói a anterior já que iniciou revanche

      const gameType = pickRandomGameType();
      const newMatch = createMatch(players, gameType);
      const publicPlayers = players.map(p => ({ id: p.socketId, nickname: p.nickname }));

      for (const p of players) {
        io.sockets.sockets.get(p.socketId)?.join(roomName(newMatch.id));
      }

      io.to(roomName(newMatch.id)).emit('rematch:starting', {
        matchId: newMatch.id,
        gameType: newMatch.gameType,
        totalRounds: timing.totalRounds,
        players: publicPlayers,
      });

      newMatch.pauseTimer = setTimeout(() => {
        if (matches.has(newMatch.id)) startRound(newMatch);
      }, timing.matchIntroMs);

      ack?.({ ok: true });
    });

    // ─── Salas Privadas com Amigos ────────────────────────────────────────────
    socket.on('room:create', (payload, ack) => {
      // Gera um código único de 5 caracteres alfanuméricos em maiúsculas (ex: AB7X2)
      let roomCode = '';
      const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 0; i < 5; i++) {
        roomCode += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      }

      let identity = { userId: null, avatar: null, ticketNickname: null };
      if (payload?.authTicket) {
        try {
          const claim = verifyDuelTicket(payload.authTicket);
          identity = { userId: claim.sub, avatar: claim.avatar, ticketNickname: claim.nickname };
        } catch {}
      }

      const nickname = sanitizeNickname(identity.ticketNickname ?? payload?.nickname);
      const rawPref = payload?.gameTypePreference;
      const gameTypePreference = GAME_TYPE_IDS.includes(rawPref) ? rawPref : 'random';

      const hostInfo = {
        socketId: socket.id,
        nickname,
        userId: identity.userId,
        avatar: identity.avatar,
      };

      privateRooms.set(roomCode, {
        roomCode,
        hostSocketId: socket.id,
        hostInfo,
        gameTypePreference,
        createdAt: Date.now(),
      });

      ack?.({ ok: true, roomCode });
    });

    socket.on('room:join', (payload, ack) => {
      const roomCode = (payload?.roomCode || '').toUpperCase().trim();
      const room = privateRooms.get(roomCode);

      if (!room) {
        return ack?.({ ok: false, error: 'Sala privada não encontrada ou expirada.' });
      }

      if (room.hostSocketId === socket.id) {
        return ack?.({ ok: false, error: 'Você já é o criador desta sala.' });
      }

      let identity = { userId: null, avatar: null, ticketNickname: null };
      if (payload?.authTicket) {
        try {
          const claim = verifyDuelTicket(payload.authTicket);
          identity = { userId: claim.sub, avatar: claim.avatar, ticketNickname: claim.nickname };
        } catch {}
      }

      const nickname = sanitizeNickname(identity.ticketNickname ?? payload?.nickname);
      const joinerInfo = {
        socketId: socket.id,
        nickname,
        userId: identity.userId,
        avatar: identity.avatar,
      };

      const players = [room.hostInfo, joinerInfo];
      const gameType = room.gameTypePreference === 'random' ? pickRandomGameType() : room.gameTypePreference;

      privateRooms.delete(roomCode);

      const match = createMatch(players, gameType);
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

      match.pauseTimer = setTimeout(() => {
        if (matches.has(match.id)) startRound(match);
      }, timing.matchIntroMs);

      ack?.({ ok: true, matchId: match.id });
    });

    socket.on('disconnect', () => {
      removeFromQueue(socket.id);

      // Limpa salas privadas criadas por este socket que ainda não tinham começado (aguarda 20s para tratar reconexões rápidas de rede)
      const socketIdToClean = socket.id;
      setTimeout(() => {
        for (const [code, room] of privateRooms.entries()) {
          if (room.hostSocketId === socketIdToClean) {
            privateRooms.delete(code);
          }
        }
      }, 20_000);

      const match = findMatchBySocket(socket.id);
      if (match) endByLeave(match, socket.id);
      broadcastPresence();
    });
  });

  return io;
};
