import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';

// helmet() padrão — a maioria dos cabeçalhos que ele endurece é irrelevante
// para uma API só-JSON (nunca serve HTML), mas é um import só e inofensivo.
export const securityHeaders = helmet();

// Uma origem só, nunca '*'. Mesmo com a topologia same-origin (o frontend
// chama /api/* via rewrite do Vercel, nunca uma URL absoluta), o Express
// recebe um header Origin de verdade em toda requisição — CORS continua
// defesa em profundidade legítima, não um no-op.
export const corsPolicy = cors({
  origin: env.frontendOrigins,
  credentials: true,
});
