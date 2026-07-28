// Limitador simples em memória (janela deslizante), proporcional ao problema:
// o handshake do Socket.IO não passa pelo Express, então express-rate-limit
// (já usado em backend/middleware/rateLimiters.js) não se aplica aqui. Isto
// não precisa da robustez de bcrypt/JWT — é só um Map com timestamps.
const hits = new Map(); // chave -> timestamps[]

export const isRateLimited = (key, { windowMs, max }) => {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
};

// Usado pelos testes para não vazar estado entre casos.
export const resetRateLimiter = () => hits.clear();
