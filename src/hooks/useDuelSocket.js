import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

// URL do backend em tempo real. Conexão DIRETA (não pelo proxy /api do Vite),
// de propósito: um rewrite do Vercel para HTTP comum não garante tunelar o
// upgrade de WebSocket para uma origem externa — em vez de montar a feature
// sobre uma suposição não verificável, o cliente sempre fala direto com o
// backend, em dev e em produção igual. Ver CLAUDE.md para a decisão completa.
const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || 'http://localhost:5000';

// Conecta assim que o componente que chama este hook monta (não atrás de
// nenhum clique) — é o que faz o contador de gente online aparecer na tela
// assim que ela carrega. Desconecta ao desmontar.
//
// Segue o mesmo padrão de identidade estável documentado em useProgress.jsx
// (progressRef): todo estado ao vivo fica também numa ref, e as ações
// expostas (joinQueue/leaveQueue/submitAnswer) são useCallback com deps
// vazias, seguras para entrar no array de dependências de um useEffect
// consumidor sem risco de loop infinito.
export const useDuelSocket = () => {
  const [myId, setMyId] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [matchState, setMatchState] = useState('idle'); // idle|searching|matched|playing|ended
  const [opponent, setOpponent] = useState(null);
  const [gameType, setGameType] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [question, setQuestion] = useState(null);
  const [roundDeadline, setRoundDeadline] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [scores, setScores] = useState({});
  const [matchEnd, setMatchEnd] = useState(null);

  const socketRef = useRef(null);
  const matchIdRef = useRef(null);

  useEffect(() => {
    const socket = io(REALTIME_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setMyId(socket.id));
    socket.on('presence:count', setOnlineCount);

    socket.on('match:found', (payload) => {
      matchIdRef.current = payload.matchId;
      const other = payload.players.find(p => p.id !== socket.id);
      setOpponent(other || null);
      setGameType(payload.gameType);
      setTotalRounds(payload.totalRounds);
      setMatchState('matched');
      setRoundResult(null);
      setMatchEnd(null);
      setScores({});
    });

    socket.on('round:start', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      setRoundIndex(payload.roundIndex);
      setQuestion(payload.question);
      setRoundDeadline(payload.roundDeadline);
      setRoundResult(null);
      setMatchState('playing');
    });

    socket.on('round:result', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      setRoundResult(payload);
      setScores(payload.scores);
    });

    socket.on('match:end', (payload) => {
      if (payload.matchId !== matchIdRef.current) return;
      setMatchEnd(payload);
      setScores(payload.scores);
      setMatchState('ended');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinQueue = useCallback((nickname) => {
    setMatchState('searching');
    socketRef.current?.emit('queue:join', { nickname }, (ack) => {
      if (!ack?.ok) setMatchState('idle');
    });
  }, []);

  const leaveQueue = useCallback(() => {
    socketRef.current?.emit('queue:leave', {}, () => setMatchState('idle'));
  }, []);

  const submitAnswer = useCallback((choice) => {
    socketRef.current?.emit('round:answer', {
      matchId: matchIdRef.current,
      roundIndex,
      choice,
    }, () => {});
  }, [roundIndex]);

  const resetMatch = useCallback(() => {
    matchIdRef.current = null;
    setMatchState('idle');
    setOpponent(null);
    setGameType(null);
    setQuestion(null);
    setRoundResult(null);
    setMatchEnd(null);
    setScores({});
  }, []);

  return {
    myId, onlineCount, matchState, opponent, gameType,
    roundIndex, totalRounds, question, roundDeadline, roundResult, scores, matchEnd,
    joinQueue, leaveQueue, submitAnswer, resetMatch,
  };
};

export default useDuelSocket;
