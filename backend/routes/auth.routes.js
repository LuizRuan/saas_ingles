import { Router } from 'express';
import { register, login, logout, me, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { requireDb } from '../middleware/requireDb.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { registerLimiter, loginLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/register', registerLimiter, requireDb, asyncHandler(register));
authRouter.post('/login', loginLimiter, requireDb, asyncHandler(login));

// Nenhuma das duas abaixo precisa de requireDb: logout só limpa um cookie, e
// me responde a partir do payload do próprio JWT.
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);

// Diferente de /me, estas duas PRECISAM do banco: o apelido não vai no JWT.
// Sem limiter próprio — não são rotas sensíveis a força bruta como
// login/register, o apiLimiter geral em /api já cobre abuso.
authRouter.get('/profile', requireAuth, requireDb, asyncHandler(getProfile));
authRouter.patch('/profile', requireAuth, requireDb, asyncHandler(updateProfile));
