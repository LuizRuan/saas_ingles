import { Router } from 'express';
import { BugReport } from '../models/BugReport.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireDb } from '../middleware/requireDb.js';
import { feedbackLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../utils/token.js';
import { User } from '../models/User.js';

export const feedbackRouter = Router();

// POST /api/feedback — Criar novo relatório de bug (aberto a qualquer pessoa)
feedbackRouter.post('/', feedbackLimiter, requireDb, asyncHandler(async (req, res) => {
  const { message, page } = req.body ?? {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'A mensagem do relatório é obrigatória.' });
  }

  if (message.length > 1000) {
    return res.status(400).json({ error: 'A mensagem não pode ter mais de 1000 caracteres.' });
  }

  if (!page || typeof page !== 'string') {
    return res.status(400).json({ error: 'A rota/página atual é obrigatória.' });
  }

  let nickname = null;

  // Tenta extrair nickname se houver cookie de sessão válido
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (token) {
      const payload = verifySessionToken(token);
      if (payload?.sub) {
        const user = await User.findById(payload.sub).select('nickname');
        if (user?.nickname) {
          nickname = user.nickname;
        }
      }
    }
  } catch {
    // Falha silenciosa — se não houver cookie ou token for inválido, trata como convidado
  }

  const report = await BugReport.create({
    message: message.trim(),
    page: page.trim(),
    nickname,
  });

  return res.status(201).json({
    ok: true,
    message: 'Relatório recebido com sucesso! Obrigado pelo feedback.',
    id: report._id,
  });
}));

// GET /api/feedback — Listar relatórios (Apenas Admin)
feedbackRouter.get('/', requireAuth, requireAdmin, requireDb, asyncHandler(async (req, res) => {
  const reports = await BugReport.find().sort({ createdAt: -1 });
  return res.json({ reports });
}));

// DELETE /api/feedback/:id — Apagar relatório por ID (Apenas Admin)
feedbackRouter.delete('/:id', requireAuth, requireAdmin, requireDb, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await BugReport.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Relatório não encontrado.' });
  }

  return res.json({ ok: true, message: 'Relatório removido.' });
}));
