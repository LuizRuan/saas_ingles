import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, corsPolicy } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { presenceRouter } from './routes/presence.routes.js';
import { duelRouter } from './routes/duel.routes.js';

// Monta e exporta o app SEM chamar listen() — testável (supertest) sem
// precisar de uma porta real, e reutilizável por server.js.
export const app = express();

// Continua valendo para req.protocol/req.secure (o TLS termina no balanceador
// do Render, então sem isto o Express acharia que o pedido chegou em http).
//
// NÃO é mais a fonte da chave do limitador de taxa: existem duas topologias com
// número de saltos diferente — direto no Render são 3, passando pela Vercel são
// 4 — e um único número aqui não serve para as duas. Quem resolve o IP do
// cliente agora é utils/clientIp.js, contando da direita para a esquerda.
// Nunca trocar por `true`: aceitaria X-Forwarded-For forjado por qualquer um.
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(corsPolicy);
app.use(cookieParser());
// Único payload esperado é { email, password } — 10kb é folga generosa
// enquanto bloqueia corpo desproporcional.
app.use(express.json({ limit: '10kb' }));

app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/presence', presenceRouter);
app.use('/api/duel', duelRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Sempre por último.
app.use(errorHandler);
