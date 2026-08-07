import { env } from '../config/env.js';

/**
 * Middleware para restringir rotas aos e-mails listados na variável `ADMIN_EMAILS`.
 * Deve rodar APÓS `requireAuth` (que injeta req.user).
 */
export const requireAdmin = (req, res, next) => {
  const userEmail = (req.user?.email || '').toLowerCase().trim();

  if (env.adminEmails.length > 0 && env.adminEmails.includes(userEmail)) {
    return next();
  }

  return res.status(403).json({
    error: 'Acesso restrito. Seu e-mail não possui permissão de administrador.',
  });
};
