import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, corsPolicy } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { presenceRouter } from './routes/presence.routes.js';
import { duelRouter } from './routes/duel.routes.js';
import { feedbackRouter } from './routes/feedback.routes.js';

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
// Nunca trocar por `true`: aceitaria X-Forwarded-For forjado por qualquer one.
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(corsPolicy);
app.use(cookieParser());
// 10kb bastava quando o único payload era { email, password } — mas
// PATCH /api/auth/progress manda o objeto de progresso inteiro (wordStats,
// phraseStats, errorHistory, achievements...), que cresce com o uso. Um
// usuário real travou aqui com 64kb de payload contra um limite de 10kb
// (erro silencioso no cliente: updateProgressRequest() só faz .catch(() =>
// {}), então a sincronização falhava pra sempre sem nenhum aviso).
//
// 1mb foi calibrado simulando o pior caso real: um usuário nível 100 (as
// 1000 palavras do banco todas aprendidas) chega a ~135kb no caso típico
// (3 acertos/palavra) e ~504kb num caso extremo de revisão pesada (30
// acertos/palavra, perto do teto de 500 timestamps por palavra em
// storage.js). 1mb mantém margem confortável nesse extremo sem abrir mão de
// um teto contra abuso.
//
// REMEDIDO com o multi-idioma (ago/2026): o payload agora carrega o histórico
// de TODOS os cursos (courseProgress + courseStats), não só o ativo. No mesmo
// extremo de 30 acertos por palavra:
//     só inglês ............ 507 kB   (a calibração original)
//     inglês + espanhol .... 673 kB
//     margem restante ...... 351 kB   (era ~517 kB)
// Regra prática: cada idioma novo custa ~165 kB nesse extremo. Um terceiro
// chegaria a ~840 kB e um quarto estouraria. Antes de adicionar o próximo
// idioma, subir este limite não é a resposta — o certo é podar os timestamps
// antigos por palavra, que é o que cresce sem limite útil.
app.use(express.json({ limit: '1mb' }));

app.use('/api/presence', presenceRouter);
app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/duel', duelRouter);
app.use('/api/feedback', feedbackRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Sempre por último.
app.use(errorHandler);
