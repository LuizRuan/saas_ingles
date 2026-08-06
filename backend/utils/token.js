import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'ep_session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Payload mínimo: { sub, email }. Incluir email deixa GET /api/auth/me
// responder só a partir do próprio token, sem round-trip nem dependência de
// banco — funciona mesmo com o Mongo fora do ar.
export const signSessionToken = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, env.jwtSecret, { expiresIn: '7d' });

export const verifySessionToken = (token) => jwt.verify(token, env.jwtSecret);

// Opções do cookie centralizadas — usadas tanto para setar (login/register)
// quanto para limpar (logout), que precisam bater exatamente ou o navegador
// não reconhece como o mesmo cookie.
//
// httpOnly: nunca legível por JS — mesmo princípio já documentado no projeto
// para localStorage (é entrada não confiável / alvo de XSS).
// sameSite: 'lax', não 'none': a topologia é same-origin (o frontend chama
// /api/* via rewrite do Vercel, nunca uma URL absoluta do Render), então
// same-site é garantido e Lax já barra o cookie em POST cross-site — CSRF
// coberto sem precisar de um token separado.
// secure: só em produção, porque http://localhost em dev não tem HTTPS.
export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  maxAge: SEVEN_DAYS_MS,
  path: '/',
});

// clearCookie precisa dos MESMOS atributos de path/httpOnly/secure/sameSite
// para o navegador reconhecer como o mesmo cookie — mas não de maxAge: passar
// maxAge para res.clearCookie está depreciado no Express (ele já expira o
// cookie imediatamente sozinho).
export const clearSessionCookieOptions = () => {
  const { maxAge, ...rest } = sessionCookieOptions();
  return rest;
};

// Ticket de curta duração para o duelo em tempo real (Socket.IO) provar
// identidade sem cookie httpOnly — o socket conecta direto no Render, fora
// da topologia same-origin do cookie de sessão (ver CLAUDE.md). Mesmo
// segredo do JWT de sessão: mesmo processo Node, nenhum segredo novo.
export const signDuelTicket = ({ id, nickname, avatar }) =>
  jwt.sign({ sub: id, nickname, avatar, typ: 'duel' }, env.jwtSecret, { expiresIn: '2m' });

// `typ: 'duel'` existe só para isto: um JWT de sessão comum (7 dias, sem
// `typ`) não pode ser reaproveitado como ticket de duelo por engano.
export const verifyDuelTicket = (ticket) => {
  const payload = jwt.verify(ticket, env.jwtSecret);
  if (payload.typ !== 'duel') throw new Error('Tipo de ticket inválido.');
  return payload;
};
