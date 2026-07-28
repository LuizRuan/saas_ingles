import { verifySessionToken, SESSION_COOKIE_NAME } from '../utils/token.js';

// Valida o JWT do cookie de sessão e popula req.user. Não toca o banco —
// funciona mesmo sem MongoDB conectado, já que o payload já tem { sub, email }.
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Não autenticado.' });

  try {
    const payload = verifySessionToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
};
