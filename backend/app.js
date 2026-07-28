import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, corsPolicy } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';

// Monta e exporta o app SEM chamar listen() — testável (supertest) sem
// precisar de uma porta real, e reutilizável por server.js.
export const app = express();

app.use(securityHeaders);
app.use(corsPolicy);
app.use(cookieParser());
// Único payload esperado é { email, password } — 10kb é folga generosa
// enquanto bloqueia corpo desproporcional.
app.use(express.json({ limit: '10kb' }));

app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Sempre por último.
app.use(errorHandler);
