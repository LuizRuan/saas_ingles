import { isAdminEmail } from '../utils/adminAccess.js';

/**
 * Middleware para restringir rotas aos e-mails listados na variável `ADMIN_EMAILS`.
 * Deve rodar APÓS `requireAuth` (que injeta req.user).
 */
export const requireAdmin = (req, res, next) => {
  if (isAdminEmail(req.user?.email)) {
    return next();
  }

  return res.status(403).json({
    error: 'Acesso restrito. Seu e-mail não possui permissão de administrador.',
  });
};
