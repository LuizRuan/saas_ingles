// Estado do matchmaking e das partidas — tudo em memória, no processo Node.
// Partidas duram ~1 minuto; não há necessidade de Mongo/Redis para isto, e
// isso contorna por completo a falta de MONGODB_URI neste ambiente.
import { randomUUID } from 'node:crypto';
import { DEFAULT_LEVEL } from './levelSelection.js';

// [{ socketId, nickname, joinedAt }] — mais antigo primeiro
export const waitingQueue = [];

// roomCode -> { roomCode, hostSocketId, hostInfo, gameTypePreference, createdAt }
export const privateRooms = new Map();

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

/**
 * Emparelha os dois jogadores mais antigos que queiram o mesmo tipo de jogo.
 * Um jogador com preferência 'random' casa com qualquer outro.
 *
 * Duas passadas, de propósito: uma busca gulosa de "primeira dupla casável"
 * na ordem da fila deixava um jogador com preferência 'random' roubar a vaga
 * de alguém que pediu o MESMO tipo específico de outro jogador — ex.: fila
 * [A:hangman, B:random, C:hangman] casava A+B (já que 'random' casa com
 * qualquer um), e C sobrava sozinho, podendo depois cair num pareamento
 * genuinamente aleatório mesmo tendo pedido 'hangman'. A 1ª passada agora
 * procura dois tipos específicos iguais em toda a fila antes de aceitar
 * qualquer pareamento que dependa de um 'random' ceder.
 *
 * Retorna o tipo resolvido em `resolvedType`:
 *   - Se ambos escolheram o mesmo tipo específico → esse tipo
 *   - Se um é 'random' e o outro tem um tipo → o tipo específico
 *   - Se ambos são 'random' → null (servidor sorteia depois)
 */
export const tryMatch = (queue) => {
  // 1ª passada: dois tipos específicos exatamente iguais, mais antigos primeiro.
  for (let i = 0; i < queue.length; i++) {
    const prefA = queue[i].gameTypePreference;
    if (prefA === 'random') continue;
    for (let j = i + 1; j < queue.length; j++) {
      if (queue[j].gameTypePreference !== prefA) continue;
      const rest = queue.filter((_, k) => k !== i && k !== j);
      return { pair: [queue[i], queue[j]], rest, resolvedType: prefA };
    }
  }

  // 2ª passada: qualquer dupla onde pelo menos um lado é 'random'.
  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      const a = queue[i], b = queue[j];
      const aRandom = a.gameTypePreference === 'random';
      const bRandom = b.gameTypePreference === 'random';
      if (!aRandom && !bRandom) continue; // tipos específicos diferentes — já tratado (ou não casável)

      const resolvedType = !aRandom ? a.gameTypePreference : !bRandom ? b.gameTypePreference : null;
      const rest = queue.filter((_, k) => k !== i && k !== j);
      return { pair: [a, b], rest, resolvedType };
    }
  }
  return { pair: null, rest: queue, resolvedType: null };
};

export const createMatch = (players, gameType) => {
  const id = randomUUID();
  const match = {
    id,
    players,
    gameType,
    roundIndex: -1,
    roundClosed: false,
    currentQuestion: null,  // mantido para compatibilidade com closeRound legado
    roundDeadline: null,
    usedIndices: [],
    answers: new Map(),
    scores: new Map(players.map(p => [p.socketId, 0])),

    // Por jogador: índices usados e pergunta ativa desta rodada
    playerData: new Map(players.map(p => [p.socketId, {
      usedIndices: [],
      currentQuestion: null,
      guessedLetters: null, // só usado no Forca — startRound cria um Set novo a cada rodada
      userId: p.userId ?? null,  // null = convidado, ou ticket ausente/inválido
      avatar: p.avatar ?? null,
      // Nível auto-reportado (1..100), só para enviesar a DIFICULDADE da
      // pergunta desse jogador — nunca autoritativo, ver resolveLevel em
      // levelSelection.js. `resolveLevel` já roda antes disto (na entrada da
      // fila/sala), então aqui é só repassar o que já veio saneado.
      level: p.level ?? DEFAULT_LEVEL,
    }])),

    wildcardCooldownUntil: new Map(players.map(p => [p.socketId, 0])),

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
    if (!match.ended && match.players.some(p => p.socketId === socketId)) return match;
  }
  return null;
};

export const destroyMatch = (matchId, delayMs = 120_000) => {
  const match = matches.get(matchId);
  if (!match) return;
  // Os DOIS timers: o da rodada e o da pausa entre rodadas. Antes só o
  // primeiro era limpo, deixando o segundo pendurado depois de destruir.
  if (match.roundTimer) clearTimeout(match.roundTimer);
  if (match.pauseTimer) clearTimeout(match.pauseTimer);
  match.ended = true;

  if (delayMs > 0) {
    if (match.destroyTimer) clearTimeout(match.destroyTimer);
    match.destroyTimer = setTimeout(() => {
      matches.delete(matchId);
    }, delayMs);
  } else {
    if (match.destroyTimer) clearTimeout(match.destroyTimer);
    matches.delete(matchId);
  }
};
