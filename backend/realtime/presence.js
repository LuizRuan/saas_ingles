// Presença no site — quantas pessoas estão navegando agora.
//
// POR QUE HEARTBEAT HTTP E NÃO SOCKET EM TODA PÁGINA:
//   - um socket por visitante por página faria cada carregamento da Home pagar
//     a partida a frio do Render (~50s) e manteria a instância acordada 24/7,
//     que é exatamente o teto de 750 horas/mês do plano gratuito;
//   - e, decisivo: o heartbeat permite indexar por um id QUE NÓS escolhemos,
//     que é o único jeito de duas abas da mesma pessoa contarem como uma.
//     Com socket.id isso é impossível — cada aba tem id próprio.
//
// O socket continua existindo, mas só na tela do duelo (backend/realtime/index.js).
//
// Tudo puro e sem estado global aqui: o Map é passado como argumento, para
// ficar testável sem servidor.

export const PRESENCE_TTL_MS = 75_000;   // ping a cada 30s no cliente
export const MAX_ID_LENGTH = 64;

/** O id veio num formato aceitável? Entrada de rede é não confiável. */
export const isValidPresenceId = (id) =>
  typeof id === 'string' && id.length > 0 && id.length <= MAX_ID_LENGTH && /^[\w-]+$/.test(id);

/** Registra (ou renova) a presença de um id. */
export const recordPing = (map, id, now = Date.now()) => {
  if (!isValidPresenceId(id)) return false;
  map.set(id, now);
  return true;
};

/**
 * Quantos ids distintos foram vistos dentro do TTL.
 * Duas abas do mesmo navegador compartilham o id (localStorage), então contam
 * como UMA pessoa — era a inflação que a contagem por socket tinha.
 */
export const countActive = (map, now = Date.now(), ttlMs = PRESENCE_TTL_MS) => {
  let total = 0;
  for (const seenAt of map.values()) {
    if (now - seenAt < ttlMs) total += 1;
  }
  return total;
};

/** Remove ids expirados. Sem isso o Map cresceria indefinidamente. */
export const sweep = (map, now = Date.now(), ttlMs = PRESENCE_TTL_MS) => {
  for (const [id, seenAt] of map) {
    if (now - seenAt >= ttlMs) map.delete(id);
  }
  return map.size;
};
