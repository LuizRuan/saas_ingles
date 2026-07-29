import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Presença no site via heartbeat HTTP — não por socket em toda página.
// O porquê está em backend/realtime/presence.js: socket por visitante faria
// cada carregamento pagar a partida a frio do Render e manteria a instância
// acordada 24/7 (teto de 750h/mês do plano gratuito); e o heartbeat permite
// indexar por um id nosso, que é o único jeito de duas abas da mesma pessoa
// contarem como uma.
//
// O socket continua existindo, mas só na tela do duelo (useDuelSocket).

const PRESENCE_ID_KEY = 'englishplay_presence_id';
const PING_MS = 30_000;              // TTL no servidor é 75s
const BACKOFF_MS = [30_000, 60_000, 120_000];
const REQUEST_TIMEOUT_MS = 5_000;

const PresenceContext = createContext(null);

// Id estável por NAVEGADOR (não por aba): é isto que faz duas abas contarem
// como uma pessoa só.
const getPresenceId = () => {
  try {
    const existing = localStorage.getItem(PRESENCE_ID_KEY);
    if (existing) return existing;
    const fresh = (crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(PRESENCE_ID_KEY, fresh);
    return fresh;
  } catch {
    // localStorage bloqueado (modo privado, etc.): id por sessão serve.
    return `tmp-${Math.random().toString(36).slice(2)}`;
  }
};

export const PresenceProvider = ({ children }) => {
  const [status, setStatus] = useState('connecting'); // connecting | ok | offline
  const [online, setOnline] = useState(null);         // null = ainda não sei
  const [queue, setQueue] = useState(null);

  const timerRef = useRef(null);
  const failuresRef = useRef(0);
  const idRef = useRef(null);

  const ping = useCallback(async () => {
    if (!idRef.current) idRef.current = getPresenceId();

    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch('/api/presence/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idRef.current }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(String(res.status));

      const data = await res.json();
      // Uma resposta que não é JSON válido (ex.: o index.html devolvido pelo
      // catch-all da Vercel quando não há rewrite de /api) cai no catch abaixo.
      setOnline(typeof data.online === 'number' ? data.online : null);
      setQueue(typeof data.queue === 'number' ? data.queue : null);
      setStatus('ok');
      failuresRef.current = 0;
    } catch {
      failuresRef.current += 1;
      setStatus('offline');
      // Zera os números: melhor "não sei" que um valor velho apresentado como
      // atual.
      setOnline(null);
      setQueue(null);
    } finally {
      clearTimeout(abortTimer);
    }
  }, []);

  const schedule = useCallback((delay) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await ping();
      // Recuo progressivo em falha, para não martelar um Render acordando.
      const failures = failuresRef.current;
      const next = failures === 0
        ? PING_MS
        : BACKOFF_MS[Math.min(failures - 1, BACKOFF_MS.length - 1)];
      schedule(next);
    }, delay);
  }, [ping]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      await ping();
      if (cancelled) return;
      const failures = failuresRef.current;
      schedule(failures === 0 ? PING_MS : BACKOFF_MS[0]);
    };
    start();

    // Aba oculta não conta como "no site" e não precisa gastar rede.
    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        schedule(0);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ping, schedule]);

  const value = { status, online, queue, refresh: () => schedule(0) };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  // Sem provider (ex.: um teste isolado), degrada em vez de explodir.
  return ctx ?? { status: 'connecting', online: null, queue: null, refresh: () => {} };
};

export default usePresence;
