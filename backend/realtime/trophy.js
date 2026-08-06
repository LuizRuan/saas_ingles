// Decide SE e PARA QUEM um troféu deve ser dado ao fim de uma partida —
// extraído puro pelo mesmo motivo de round.js: testável sem socket nem Mongo.
// Regras (ver spec): só vitória limpa (nunca empate, nunca WO — quem chama
// isto só faz no ramo de fim natural da partida, nunca em endByLeave), e só
// se os DOIS jogadores estavam logados em contas DIFERENTES.
export const decideTrophyAward = (match, winnerSocketId) => {
  if (!winnerSocketId) return null; // empate — decideWinner já devolve null

  const winner = match.players.find(p => p.socketId === winnerSocketId);
  const loser = match.players.find(p => p.socketId !== winnerSocketId);
  if (!winner || !loser) return null;

  const wd = match.playerData?.get(winner.socketId);
  const ld = match.playerData?.get(loser.socketId);
  if (!wd?.userId || !ld?.userId) return null;      // convidado de um dos lados
  if (wd.userId === ld.userId) return null;          // mesma conta nas duas pontas

  return { userId: wd.userId, nickname: winner.nickname, avatar: wd.avatar };
};
