// Limitador simples em memória (janela deslizante), proporcional ao problema:
// o handshake do Socket.IO não passa pelo Express, então express-rate-limit
// (já usado em backend/middleware/rateLimiters.js) não se aplica aqui. Isto
// não precisa da robustez de bcrypt/JWT — é um Map com timestamps.
const hits = new Map(); // chave -> timestamps[]

export const isRateLimited = (key, { windowMs, max }) => {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  recent.push(now);

  // Sem esta linha o Map só crescia: chaves por socket.id (uma nova a cada
  // conexão) ficavam guardadas para sempre, com o array de timestamps preso.
  if (recent.length === 0) hits.delete(key);
  else hits.set(key, recent);

  return recent.length > max;
};

/**
 * Despeja chaves cujas janelas já expiraram. Chamado por um setInterval em
 * attachRealtime — o filtro de isRateLimited só limpa chaves que voltam a ser
 * tocadas, então chave morta precisa deste passe.
 * @returns {number} quantas chaves restaram (usado nos testes)
 */
export const sweepRateLimiter = (maxWindowMs = 60_000, now = Date.now()) => {
  for (const [key, timestamps] of hits) {
    if (timestamps.every(t => now - t >= maxWindowMs)) hits.delete(key);
  }
  return hits.size;
};

/** Usado pelos testes para não vazar estado entre casos. */
export const resetRateLimiter = () => hits.clear();
