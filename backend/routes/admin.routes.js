import { Router } from 'express';
import { getAdminDashboard } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireDb } from '../middleware/requireDb.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminRouter = Router();

adminRouter.get('/dashboard', requireAuth, requireAdmin, requireDb, asyncHandler(getAdminDashboard));

