// Cronômetro do duelo humano.
//
// O servidor manda um prazo absoluto (roundDeadline) medido pelo relógio DELE.
// Se o cliente simplesmente fizer `roundDeadline - Date.now()`, qualquer
// defasagem do relógio da máquina entra direto na conta — e relógios de
// aparelho erram minutos com facilidade. Dois efeitos reais disso:
//   - relógio adiantado 10s ou mais → tempo restante nasce 0 → a pessoa nunca
//     consegue responder rodada nenhuma, sem nenhuma mensagem de erro;
//   - relógio atrasado 30s → mostra "40s" e a barra de tempo renderiza com
//     width: 400%, estourando o container.
//
// A correção é o servidor mandar o próprio `serverNow` junto do prazo, e o
// cliente medir a defasagem. Escolhido em vez de o servidor mandar "faltam N
// ms" porque um valor relativo recomeça a contar no instante em que o pacote
// CHEGA, então a latência de rede de cada rodada acumula em desvio visível; a
// defasagem é remedida a cada rodada e continua correta entre os ticks.

/** Defasagem entre o relógio do servidor e o do cliente, em ms. */
export const computeOffset = (serverNow, clientNow = Date.now()) => {
  if (!Number.isFinite(serverNow) || !Number.isFinite(clientNow)) return 0;
  return serverNow - clientNow;
};

/** Quanto falta do prazo, em ms, já corrigido pela defasagem. Nunca negativo. */
export const msLeft = (deadline, offset = 0, now = Date.now()) => {
  if (!Number.isFinite(deadline)) return 0;
  return Math.max(0, deadline - (now + offset));
};

/** Segundos restantes para exibir (arredonda para cima, como o modo Bot). */
export const secondsLeft = (deadline, offset = 0, now = Date.now()) =>
  Math.ceil(msLeft(deadline, offset, now) / 1000);

/**
 * Largura da barra de tempo em porcentagem, LIMITADA a 0-100.
 * O limite é o que impede o `width: 400%` quando o relógio do cliente está
 * atrasado em relação ao servidor.
 */
export const barWidthPct = (remainingMs, totalMs) => {
  if (!Number.isFinite(remainingMs) || !Number.isFinite(totalMs) || totalMs <= 0) return 0;
  return Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));
};
