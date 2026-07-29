import { Router } from 'express';
import { recordPing, countActive, sweep, PRESENCE_TTL_MS } from '../realtime/presence.js';
import { waitingQueue } from '../realtime/state.js';
import { presenceLimiter } from '../middleware/rateLimiters.js';

// Estado em memória, como o resto do realtime — presença é efêmera por
// natureza e não justifica banco.
const seen = new Map(); // presenceId -> timestamp

// Passe periódico de limpeza. unref() para não segurar o processo nos testes.
const sweeper = setInterval(() => sweep(seen), 60_000);
sweeper.unref?.();

export const presenceRouter = Router();

const snapshot = () => ({
  online: countActive(seen, Date.now(), PRESENCE_TTL_MS),
  queue: waitingQueue.length,
});

// O cliente bate aqui a cada ~30s enquanto a aba está visível.
presenceRouter.post('/ping', presenceLimiter, (req, res) => {
  const ok = recordPing(seen, req.body?.id);
  if (!ok) return res.status(400).json({ error: 'Id de presença inválido.' });
  res.json({ ok: true, ...snapshot() });
});

// Só leitura, para quem quer exibir sem se anunciar.
presenceRouter.get('/', presenceLimiter, (req, res) => res.json(snapshot()));

// Exportado para os testes não vazarem estado entre casos.
export const __resetPresence = () => seen.clear();
