import { Router } from 'express';
import { getLeaderboard, getMyRank, getLevelLeaderboard } from '../controllers/duel.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDb } from '../middleware/requireDb.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const duelRouter = Router();

// Público (sem requireAuth) — mas ainda precisa do banco, é onde o ranking
// mora. Sem limiter próprio: leitura barata, e o apiLimiter geral em /api já
// cobre abuso (mesmo raciocínio de /api/auth/profile).
duelRouter.get('/leaderboard', requireDb, asyncHandler(getLeaderboard));
duelRouter.get('/leaderboard/me', requireAuth, requireDb, asyncHandler(getMyRank));
// Ranking por nível: mesma exigência de conta (implícita — nickname só
// existe pra quem tem conta) do ranking de troféus, sem o reset mensal.
duelRouter.get('/leaderboard/level', requireDb, asyncHandler(getLevelLeaderboard));
