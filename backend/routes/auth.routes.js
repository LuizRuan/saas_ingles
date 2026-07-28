import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller.js';
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
