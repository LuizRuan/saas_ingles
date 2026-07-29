import rateLimit from 'express-rate-limit';

const baseOptions = { standardHeaders: true, legacyHeaders: false };

// Limites por IP. Números pensados para uso humano normal (ninguém cria 5
// contas por hora nem tenta logar 10 vezes em 15 minutos de propósito), mas
// que tornam força bruta caro o bastante para não valer a pena.
export const registerLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' },
});

export const loginLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

// Heartbeat de presença: ~2 por minuto por aba em uso normal. Limite próprio
// para os pings não comerem o orçamento do apiLimiter (que é compartilhado com
// as rotas de conta).
export const presenceLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: 'Muitos pings de presença.' },
});

// Defesa em profundidade adicional sobre /api inteiro, além dos limites
// específicos acima.
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
});
