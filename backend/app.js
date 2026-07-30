import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, corsPolicy } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { presenceRouter } from './routes/presence.routes.js';

// Monta e exporta o app SEM chamar listen() — testável (supertest) sem
// precisar de uma porta real, e reutilizável por server.js.
export const app = express();

// No Render (e em qualquer PaaS) o TLS termina num balanceador, então
// req.ip seria o IP DELE — o mesmo para todos os visitantes. Sem isto, o
// apiLimiter (300 req/15min por IP) trata o planeta inteiro como um usuário só
// e ~10 pessoas simultâneas esgotam a cota. `1` = confia num único proxy à
// frente, que é a topologia do Render; não usar `true`, que aceitaria
// X-Forwarded-For forjado por qualquer cliente.
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

app.get('/api/health', (req, res) => res.json({ ok: true }));

// TEMPORÁRIO — medir a cadeia de proxies real (Vercel -> balanceador do Render)
// para escolher o valor certo de 'trust proxy'. Devolve só dados do próprio
// pedido de quem chama, nada de outro usuário. REMOVER depois da medição.
app.get('/api/_debug/ip', (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    xff: req.headers['x-forwarded-for'] || null,
    xRealIp: req.headers['x-real-ip'] || null,
    xVercel: req.headers['x-vercel-forwarded-for'] || null,
    host: req.headers.host || null,
    trustProxy: app.get('trust proxy'),
  });
});

// Sempre por último.
app.use(errorHandler);
