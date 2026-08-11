import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import { computeOffset } from '../utils/duelClock';

// URL do backend em tempo real. Conexão DIRETA (não pelo proxy /api do Vite),
// de propósito: um rewrite do Vercel proxeia HTTP comum, e não há garantia
// documentada de que ele tunele o upgrade de WebSocket para uma origem externa.
// Ver CLAUDE.md para a decisão completa (inclui a exceção estreita na CSP).
//
// O host de produção fica no código, e não só numa variável de painel, porque a
// CSP em vercel.json PRECISA nomear este mesmo host (`connect-src` não aceita
// curinga). Ou seja: o host já é uma constante do repositório de qualquer jeito.
// Mantê-lo em dois lugares — um no repositório, outro no painel da Vercel —
// só criaria a chance de eles divergirem, e a divergência seria silenciosa: a
// CSP bloquearia a conexão sem nenhum erro de configuração aparente.
// A variável continua existindo como override para quem rodar outro backend.
const RENDER_HOST = 'https://saas-ingles.onrender.com';

const REALTIME_URL =
  import.meta.env.VITE_REALTIME_URL ||
  (import.meta.env.PROD ? RENDER_HOST : 'http://localhost:5000');

// Quanto tempo esperar na fila antes de desistir e avisar. Sem isto, com o
// servidor inalcançável o spinner "Procurando oponente..." rodava para sempre.
const QUEUE_TIMEOUT_MS = 45_000;

/**
 * Cliente do duelo em tempo real.
 *
 * Segue o padrão de identidade estável documentado em useProgress.jsx: as ações
 * expostas são useCallback com dependências vazias (ou primitivas estáveis),
 * seguras para entrar no array de dependências de um useEffect consumidor.
 */
export const useDuelSocket = () => {
  // 'connecting' | 'connected' | 'reconnecting' | 'offline'
  const [status, setStatus] = useState('connecting');
  const [socketCount, setSocketCount] = useState(null); // null = ainda não sei
  const [queueCount, setQueueCount] = useState(null);
  const [queueByType, setQueueByType] = useState({}); // { hangman: 2, ... }

  // 'idle' | 'searching' | 'matched' | 'playing' | 'ended' | 'lost'
  const [matchState, setMatchState] = useState('idle');
  const [queueError, setQueueError] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [gameType, setGameType] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [question, setQuestion] = useState(null);
  const [roundDeadline, setRoundDeadline] = useState(null);
  const [roundMs, setRoundMs] = useState(60_000);
  const [roundResult, setRoundResult] = useState(null);
  const [scores, setScores] = useState({});
  const [matchEnd, setMatchEnd] = useState(null);
  const [answerError, setAnswerError] = useState(null);
  const [wildcardEffect, setWildcardEffect] = useState(null);   // { wildcardValue, id }
  const [wildcardTimeUpdate, setWildcardTimeUpdate] = useState(null); // { newDeadline, delta }
  const [receivedEmote, setReceivedEmote] = useState(null);       // { emoji, id, senderId }
  const [rematchProposed, setRematchProposed] = useState(null);   // { matchId, requesterName, timeoutMs }
  const [rematchStatus, setRematchStatus]     = useState('idle'); // 'idle' | 'requesting' | 'declined'

  const socketRef = useRef(null);
  const matchIdRef = useRef(null);
  const queueTimerRef = useRef(null);
  // Defasagem entre o relógio do servidor e o desta máquina. Fica em ref, não
  // em state: é lido dentro de um setInterval e não deve causar re-render.
  const clockOffsetRef = useRef(0);
  // Guarda o próprio id no momento em que a partida terminou. Necessário porque
  // uma reconexão troca o socket.id, e comparar depois daria resultado errado.
  const myIdRef = useRef(null);

  const clearQueueTimer = useCallback(() => {
    if (queueTimerRef.current) {
      clearTimeout(queueTimerRef.current);
      queueTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const socket = io(REALTIME_URL, {
      transports: ['websocket', 'polling'],
      timeout: 8_000,
    });
    socketRef.current = socket;
    let everConnected = false;

    socket.on('connect', () => {
      everConnected = true;
      myIdRef.current = socket.id;
      setStatus('connected');
    });

    // Sem estes dois handlers, o servidor fora do ar era indistinguível de
    // "ninguém online": onlineCount ficava em 0 e a tela mostrava uma bolinha
    // verde pulsando como se estivesse tudo bem.
    socket.on('connect_error', () => {
      setStatus(everConnected ? 'reconnecting' : 'offline');
      setSocketCount(null);
      setQueueCount(null);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') return; // fomos nós
      setStatus('reconnecting');
      setSocketCount(null);
      setQueueCount(null);
      // Partida em andamento não sobrevive: o servidor indexa tudo por
      // socket.id e destrói a partida na desconexão. Em vez de congelar a tela
      // (o que acontecia antes), marcamos como perdida para o componente
      // oferecer uma saída limpa.
      setMatchState(prev => (prev === 'playing' || prev === 'matched' ? 'lost' : prev));
      clearQueueTimer();
    });

    socket.on('presence:count', (payload) => {
      // Payload virou objeto; aceita número por compatibilidade.
      if (typeof payload === 'number') { setSocketCount(payload); return; }
      setSocketCount(payload?.sockets ?? null);
      setQueueCount(payload?.queue ?? null);
      setQueueByType(payload?.byType ?? {});
    });

    socket.on('match:found', (payload) => {
      clearQueueTimer();
      matchIdRef.current = payload.matchId;
      setOpponent(payload.players.find(p => p.id !== socket.id) || null);
      setGameType(payload.gameType);
      setTotalRounds(payload.totalRounds);
      setMatchState('matched');
      setRoundResult(null);
      setMatchEnd(null);
      setAnswerError(null);
      setScores({});
    });

    socket.on('round:start', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      clockOffsetRef.current = computeOffset(payload.serverNow);
      setRoundIndex(payload.roundIndex);
      setQuestion(payload.question);
      setRoundDeadline(payload.roundDeadline);
      setRoundMs(payload.roundMs ?? 60_000);
      setRoundResult(null);
      setAnswerError(null);
      setMatchState('playing');
    });

    socket.on('round:result', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      setRoundResult(payload);
      setScores(payload.scores);
    });

    socket.on('match:end', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      // `iWon` é decidido AQUI, onde socket.id é definitivamente o id que jogou
      // a partida. Se ficasse para o componente comparar depois, uma reconexão
      // (que troca o socket.id) inverteria o resultado.
      setMatchEnd({ ...payload, iWon: payload.winnerId === socket.id });
      setScores(payload.scores);
      setMatchState('ended');
    });

    // ─── Coringas recebidos do servidor ──────────────────────────────────────
    socket.on('wildcard:effect', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      // Usa id incremental para que o mesmo efeito enviado duas vezes dispare
      // dois useEffect separados no componente consumidor.
      setWildcardEffect(prev => ({
        wildcardValue: payload.wildcardValue,
        durationMs: payload.durationMs ?? 10_000,
        id: (prev?.id ?? 0) + 1,
      }));
    });

    socket.on('wildcard:time_update', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      setWildcardTimeUpdate({ newDeadline: payload.newDeadline, delta: payload.delta });
      // Sobrescreve o deadline local para o timer continuar preciso
      setRoundDeadline(payload.newDeadline);
    });

    socket.on('emote:receive', (payload) => {
      setReceivedEmote(prev => ({ emoji: payload.emoji, senderId: payload.senderId, id: (prev?.id ?? 0) + 1 }));
    });

    socket.on('rematch:proposed', (payload) => {
      setRematchProposed(payload);
    });

    socket.on('rematch:declined', () => {
      setRematchStatus('declined');
      setRematchProposed(null);
    });

    socket.on('rematch:starting', (payload) => {
      matchIdRef.current = payload.matchId;
      const me  = payload.players.find(p => p.id === socket.id);
      const opp = payload.players.find(p => p.id !== socket.id);
      setOpponent(opp ?? null);
      setGameType(payload.gameType);
      setTotalRounds(payload.totalRounds);
      setScores({ [me?.id]: 0, [opp?.id]: 0 });
      setMatchEnd(null);
      setRoundResult(null);
      setQuestion(null);
      setRematchProposed(null);
      setRematchStatus('idle');
      setMatchState('matched');
    });

    return () => {
      clearQueueTimer();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clearQueueTimer]);

  const joinQueue = useCallback((nickname, gameTypePreference = 'random', authTicket) => {
    setQueueError(null);
    // Recusa cedo em vez de mentir: antes o estado já ia para 'searching' antes
    // de emitir, e com o socket desconectado o socket.io enfileira o emit — o
    // ack nunca chegava e o spinner rodava para sempre.
    if (socketRef.current?.connected !== true) {
      setQueueError('Sem conexão com o servidor. Tente novamente em instantes.');
      return;
    }

    socketRef.current.emit('queue:join', { nickname, gameTypePreference, authTicket }, (ack) => {
      if (!ack?.ok) {
        setMatchState('idle');
        setQueueError(ack?.error || 'Não foi possível entrar na fila.');
        return;
      }
      setMatchState('searching');
      clearQueueTimer();
      queueTimerRef.current = setTimeout(() => {
        socketRef.current?.emit('queue:leave', {}, () => {});
        setMatchState('idle');
        setQueueError('Ninguém disponível agora. Tente o modo Bot ou volte em instantes.');
      }, QUEUE_TIMEOUT_MS);
    });
  }, [clearQueueTimer]);

  const leaveQueue = useCallback(() => {
    clearQueueTimer();
    setQueueError(null);
    socketRef.current?.emit('queue:leave', {}, () => {});
    setMatchState('idle');
  }, [clearQueueTimer]);

  const submitAnswer = useCallback((choice) => {
    socketRef.current?.emit('round:answer', {
      matchId: matchIdRef.current,
      roundIndex,
      choice,
    }, (ack) => {
      // Antes o ack era engolido com `() => {}`: o servidor recusava a resposta
      // e a tela seguia mostrando a escolha como registrada.
      if (!ack?.ok) setAnswerError(ack?.error || 'Sua resposta não foi registrada.');
    });
  }, [roundIndex]);

  /** Forca online: chuta uma letra, recebe { inWord, positions } (ou erro) pelo callback. */
  const guessLetter = useCallback((letter, callback) => {
    socketRef.current?.emit('hangman:guess', {
      matchId: matchIdRef.current,
      roundIndex,
      letter,
    }, (ack) => callback?.(ack));
  }, [roundIndex]);

  /** Solicita o uso de um coringa e devolve a confirmação do servidor. */
  const useWildcard = useCallback((wildcardValue) => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        resolve({ ok: false, error: 'Conexão da partida indisponível.' });
        return;
      }

      socket.emit('wildcard:use', {
        matchId: matchIdRef.current,
        wildcardValue,
      }, (ack) => {
        if (!ack?.ok) console.warn('[wildcard] falhou:', ack?.error);
        resolve(ack ?? { ok: false, error: 'Sem resposta do servidor.' });
      });
    });
  }, []);

  /** Envia um emote de reação em tempo real para o oponente. */
  const sendEmote = useCallback((emoji) => {
    socketRef.current?.emit('emote:send', {
      matchId: matchIdRef.current,
      emoji,
    }, (ack) => {});
  }, []);

  /** Criar sala privada e receber código de 5 dígitos para convidar amigo. */
  const createPrivateRoom = useCallback((gameTypePreference = 'random', nicknameOverride = null) => {
    return new Promise((resolve) => {
      setMatchState('queue');
      socketRef.current?.emit('room:create', {
        nickname: nicknameOverride || 'Jogador',
        gameTypePreference,
      }, (ack) => {
        if (ack?.ok) {
          resolve({ ok: true, roomCode: ack.roomCode });
        } else {
          setMatchState('idle');
          resolve({ ok: false, error: ack?.error });
        }
      });
    });
  }, []);

  /** Entrar em sala privada usando o código de 5 dígitos. */
  const joinPrivateRoom = useCallback((roomCode, nicknameOverride = null) => {
    return new Promise((resolve) => {
      setMatchState('queue');
      socketRef.current?.emit('room:join', {
        nickname: nicknameOverride || 'Jogador',
        roomCode,
      }, (ack) => {
        if (ack?.ok) {
          resolve({ ok: true });
        } else {
          setMatchState('idle');
          resolve({ ok: false, error: ack?.error });
        }
      });
    });
  }, []);

  /** Solicitar revanche ao oponente no fim da partida. */
  const requestRematch = useCallback(() => {
    setRematchStatus('requesting');
    socketRef.current?.emit('rematch:request', { matchId: matchIdRef.current }, (ack) => {
      if (!ack?.ok) setRematchStatus('declined');
    });
  }, []);

  /** Responder ao pedido de revanche recebido (aceitar / recusar). */
  const respondRematch = useCallback((accept) => {
    socketRef.current?.emit('rematch:respond', { matchId: matchIdRef.current, accept }, () => {});
    setRematchProposed(null);
  }, []);

  /** Desistir de propósito, pelo botão "Sair" da tela de partida. */
  const forfeit = useCallback(() => {
    socketRef.current?.emit('duel:leave', { matchId: matchIdRef.current }, () => {});
  }, []);

  const resetMatch = useCallback(() => {
    matchIdRef.current = null;
    clearQueueTimer();
    setMatchState('idle');
    setOpponent(null);
    setGameType(null);
    setQuestion(null);
    setRoundResult(null);
    setMatchEnd(null);
    setScores({});
    setQueueError(null);
    setAnswerError(null);
    setRoundIndex(0);
    setRoundDeadline(null);
  }, [clearQueueTimer]);

  return {
    status,
    // Só é seguro exibir número quando status === 'connected'; fora disso é null.
    socketCount, queueCount, queueByType,
    matchState, queueError, answerError,
    opponent, gameType, roundIndex, totalRounds,
    question, roundDeadline, roundMs, roundResult, scores, matchEnd,
    wildcardEffect, wildcardTimeUpdate, receivedEmote, rematchProposed, rematchStatus,
    myId: myIdRef.current,
    clockOffsetRef,
    joinQueue, leaveQueue, submitAnswer, guessLetter, forfeit, resetMatch, useWildcard, sendEmote, requestRematch, respondRematch, createPrivateRoom, joinPrivateRoom,
  };
};

export default useDuelSocket;
