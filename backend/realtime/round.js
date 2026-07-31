// Ciclo de vida da rodada — extraído de attachRealtime() para virar PURO e,
// com isso, testável. Antes essas regras viviam presas no closure do handler de
// socket e não havia como cobri-las com teste unitário, que é exatamente por
// que o bug de pontuação dupla passou.
import { scoreFor } from './scoring.js';

/**
 * Fecha a rodada, de forma IDEMPOTENTE.
 *
 * No novo modelo, cada jogador tem sua própria `currentQuestion` em
 * `match.playerData`. O `correctAnswer` é lido por jogador para que A e B
 * possam ter palavras diferentes (e respostas corretas diferentes).
 *
 * Para o tipo 'memory': não há resposta "certa" — ganha quem submeter
 * 'completed' com menor `arrivedAt` (mais rápido).
 *
 * @returns {null | { results, scores }} null se a rodada já estava fechada.
 */
export const closeRound = (match) => {
  if (!match || match.roundClosed) return null;
  match.roundClosed = true;

  const isMemory = match.gameType === 'memory';

  // Memory: encontra quem submeteu primeiro
  let fastestMemoryId = null;
  if (isMemory) {
    let earliest = Infinity;
    for (const [socketId, ans] of match.answers.entries()) {
      if (ans.choice === 'completed' && ans.arrivedAt < earliest) {
        earliest = ans.arrivedAt;
        fastestMemoryId = socketId;
      }
    }
  }

  const results = match.players.map((p) => {
    const answer = match.answers.get(p.socketId);

    let isCorrect, points;
    if (isMemory) {
      // Ganha 100 pts quem terminou primeiro; o outro ganha 0
      isCorrect = p.socketId === fastestMemoryId;
      points = isCorrect ? 100 : 0;
    } else {
      // Busca correctAnswer no playerData (por jogador) — fallback para
      // match.currentQuestion para manter compatibilidade com testes existentes
      const pd = match.playerData?.get(p.socketId);
      const correctAnswer = pd?.currentQuestion?.correctAnswer
        ?? match.currentQuestion?.correctAnswer;

      isCorrect = Boolean(answer) && answer.choice === correctAnswer;
      points = answer ? scoreFor(isCorrect, match.roundDeadline, answer.arrivedAt) : 0;
    }

    match.scores.set(p.socketId, (match.scores.get(p.socketId) || 0) + points);
    return {
      id: p.socketId,
      choice: answer?.choice ?? null,
      correct: isCorrect,
      pointsEarned: points,
    };
  });

  return { results, scores: Object.fromEntries(match.scores) };
};

/** Sobrou rodada, ou a partida acabou? */
export const nextPhase = (match, totalRounds) =>
  match.roundIndex + 1 < totalRounds ? 'next' : 'end';

/**
 * Quem ganhou, a partir do placar que o SERVIDOR calculou.
 * @returns {string|null} socketId do vencedor, ou null em empate.
 */
export const decideWinner = (match) => {
  const [p1, p2] = match.players;
  const s1 = match.scores.get(p1.socketId) || 0;
  const s2 = match.scores.get(p2.socketId) || 0;
  if (s1 === s2) return null;
  return s1 > s2 ? p1.socketId : p2.socketId;
};

/**
 * Aceita esta resposta agora? Motivo em texto quando não.
 * Para memory, aceita choice='completed' sem validar contra correctAnswer
 * (a comparação de velocidade é feita em closeRound).
 */
export const validateAnswer = (match, socketId, payload) => {
  if (!match) return { ok: false, error: 'Partida não encontrada.' };
  if (match.roundClosed) return { ok: false, error: 'Rodada já encerrada.' };
  if (payload?.roundIndex !== match.roundIndex) return { ok: false, error: 'Rodada já encerrada.' };
  if (match.answers.has(socketId)) return { ok: false, error: 'Você já respondeu esta rodada.' };
  if (typeof payload?.choice !== 'string' || payload.choice.length > 200) {
    return { ok: false, error: 'Resposta inválida.' };
  }
  return { ok: true };
};
