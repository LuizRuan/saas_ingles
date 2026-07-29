// Estrelas de bônus ao fim de um duelo de "Quem Sabe Mais?".
//
// Único lugar onde essa regra mora. `completeGame('whoKnowsMore')` continua
// somando o bônus padrão de conclusão de fase por fora — isto aqui é só o
// extra pelo resultado do duelo.
//
// VITÓRIA POR DESISTÊNCIA NÃO PAGA NADA, de propósito: com dois navegadores
// abertos dava para entrar na fila, fechar uma aba e receber 30 estrelas a
// cada ~5 segundos, sem responder pergunta nenhuma. Com itens da Loja custando
// de 200 a 750 estrelas, isso gerava ~1000 estrelas por minuto e esvaziava a
// economia. Fechar por aqui (e não bloqueando o pareamento de duas abas do
// mesmo IP) mantém possível testar o duelo sozinho, com duas abas.

export const DUEL_BONUS = { win: 30, tie: 15, loss: 10, forfeit: 0 };

/**
 * @param {object} r
 * @param {boolean} r.iWon
 * @param {boolean} r.tie
 * @param {string}  r.reason  'completed' | 'opponent_left'
 * @returns {number} estrelas de bônus
 */
export const rewardFor = ({ iWon = false, tie = false, reason = 'completed' } = {}) => {
  if (reason === 'opponent_left') return DUEL_BONUS.forfeit;
  if (tie) return DUEL_BONUS.tie;
  return iWon ? DUEL_BONUS.win : DUEL_BONUS.loss;
};

/** A partida rendeu estrelas? Usado para esconder o bloco de recompensa. */
export const isRewarded = (matchEnd) =>
  Boolean(matchEnd) && matchEnd.reason !== 'opponent_left';
