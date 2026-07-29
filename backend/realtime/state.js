// Estado do matchmaking e das partidas — tudo em memória, no processo Node.
// Partidas duram ~1 minuto; não há necessidade de Mongo/Redis para isto, e
// isso contorna por completo a falta de MONGODB_URI neste ambiente.
import { randomUUID } from 'node:crypto';

// [{ socketId, nickname, joinedAt }] — mais antigo primeiro
export const waitingQueue = [];

/**
 * matchId -> {
 *   id, players: [{ socketId, nickname }], gameType,
 *   roundIndex,            // -1 antes da 1ª rodada; startRound incrementa
 *   roundClosed,           // true entre endRound e o próximo startRound
 *   currentQuestion, roundDeadline,
 *   usedIndices: number[], // palavras já sorteadas nesta partida
 *   answers: Map<socketId, { choice, arrivedAt }>,
 *   scores: Map<socketId, number>,
 *   roundTimer, pauseTimer, // ambos precisam ser limpos em destroyMatch
 * }
 */
export const matches = new Map();

// Função pura: pareia os 2 mais antigos da fila assim que houver 2. FIFO
// simples, sem casamento por habilidade — não existe ranking no app para
// proteger. Recebe/retorna a fila para ficar testável sem nenhum socket real.
export const tryMatch = (queue) => {
  if (queue.length < 2) return { pair: null, rest: queue };
  const [a, b, ...rest] = queue;
  return { pair: [a, b], rest };
};

export const createMatch = (players, gameType) => {
  const id = randomUUID();
  const match = {
    id,
    players,
    gameType,
    roundIndex: -1,
    roundClosed: false,
    currentQuestion: null,
    roundDeadline: null,
    usedIndices: [],
    answers: new Map(),
    scores: new Map(players.map(p => [p.socketId, 0])),
    roundTimer: null,
    pauseTimer: null,
  };
  matches.set(id, match);
  return match;
};

export const removeFromQueue = (socketId) => {
  const i = waitingQueue.findIndex(p => p.socketId === socketId);
  if (i !== -1) waitingQueue.splice(i, 1);
};

// Devolve a partida ativa de um socket, se houver — usado para tratar
// desconexão e desistência no meio de uma rodada.
export const findMatchBySocket = (socketId) => {
  for (const match of matches.values()) {
    if (match.players.some(p => p.socketId === socketId)) return match;
  }
  return null;
};

export const destroyMatch = (matchId) => {
  const match = matches.get(matchId);
  if (!match) return;
  // Os DOIS timers: o da rodada e o da pausa entre rodadas. Antes só o
  // primeiro era limpo, deixando o segundo pendurado depois de destruir.
  if (match.roundTimer) clearTimeout(match.roundTimer);
  if (match.pauseTimer) clearTimeout(match.pauseTimer);
  matches.delete(matchId);
};
