import rateLimit from 'express-rate-limit';
import { resolveClientIp } from '../utils/clientIp.js';

// `keyGenerator` próprio em vez do req.ip padrão: com a Vercel proxeando /api/*
// para cá, são DOIS proxies à frente e o `trust proxy: 1` do app.js resolvia
// req.ip como o IP de saída da Vercel — igual para todo visitante do planeta.
// Efeito medido em produção: os limites viraram um balde único e compartilhado.
// Com 10 pings/min de presença e ~2 pings por aba, TRÊS pessoas no site
// quebravam o contador de online para todas; e 10 tentativas de login erradas
// trancavam o login do site inteiro por 15 minutos. Ver utils/clientIp.js.
//
// `validate.trustProxy: false` desliga só o aviso do express-rate-limit sobre
// confiar em proxy — ele checa o `trust proxy` do Express, que aqui deixou de
// ser a fonte da chave justamente por não dar conta das duas topologias.
const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: resolveClientIp,
  validate: { trustProxy: false },
};

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
