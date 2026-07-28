// Pontuação da rodada do duelo — depende SÓ de quando a resposta chegou ao
// servidor (arrivedAt) contra o prazo que o próprio servidor definiu
// (deadline). Não existe parâmetro de "tempo restante" vindo do cliente aqui
// de propósito: não há o que um cliente malicioso possa mentir sobre tempo,
// porque o servidor nunca lê nada além do instante em que o pacote chegou.
export const scoreFor = (isCorrect, deadline, arrivedAt) => {
  if (!isCorrect) return 0;
  const secondsLeft = Math.max(0, Math.ceil((deadline - arrivedAt) / 1000));
  return 100 + secondsLeft * 10;
};
