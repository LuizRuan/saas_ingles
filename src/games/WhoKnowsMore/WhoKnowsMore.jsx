import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import { useAuthProfile } from '../../hooks/useAuthProfile';
import { useDuelSocket } from '../../hooks/useDuelSocket';
import { getDuelTicketRequest, getDuelLeaderboardRequest, getMyDuelRankRequest, getLevelLeaderboardRequest } from '../../utils/authClient';
import { usePresence } from '../../hooks/usePresence';
import { shuffleArray } from '../../data/words';
import useCourseData from '../../hooks/useCourseData';
import { AVAILABLE_COURSES } from '../../data/index';
import { msLeft, secondsLeft, barWidthPct } from '../../utils/duelClock';
import { rewardFor, isRewarded } from '../../utils/duelReward';
import { presenceLabel } from '../../utils/presenceLabel';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import { getCurrentLevel, getUserTitle } from '../../utils/levelSystem';
import AvatarDisplay from '../../components/Avatar/AvatarDisplay';
import DuelHangman from './games/DuelHangman';
import DuelMemory  from './games/DuelMemory';
import DuelBotGame from './games/DuelBotGame';
import DuelOnlineGame from './games/DuelOnlineGame';
import './WhoKnowsMore.css';

const BOT_DIFFICULTIES = [
  { id: 'easy', name: 'Bot Aprendiz 🟢', desc: 'Fácil (60% acerto, +devagar)', accuracy: 0.60, minDelay: 3500, maxDelay: 6000 },
  { id: 'medium', name: 'Bot Pro 🟡', desc: 'Médio (78% acerto, ritmo normal)', accuracy: 0.78, minDelay: 2500, maxDelay: 4500 },
  { id: 'hard', name: 'Bot Mestre 🔴', desc: 'Difícil (92% acerto, muito rápido)', accuracy: 0.92, minDelay: 1500, maxDelay: 3000 },
];

const GAME_TYPES = [
  { id: 'translation', icon: '🎯', name: 'Tradução (Múltipla Escolha)', desc: 'Escolha a tradução correta entre 4 opções' },
  { id: 'trueFalse', icon: '✅', name: 'Verdadeiro ou Falso', desc: 'Responda rápido se a tradução exibida está certa' },
  { id: 'listening', icon: '🎧', name: 'Jogo de Escuta (Listening)', desc: 'Ouça o áudio da palavra e identifique o significado' },
  { id: 'wordBuilder', icon: '🔤', name: 'Montar Palavras', desc: 'Descubra qual palavra é formada pelas letras embaralhadas' },
  { id: 'sentenceBuilder', icon: '📝', name: 'Montar Frases', desc: 'Identifique a tradução exata da frase' },
  { id: 'fillBlanks', icon: '✏️', name: 'Completar Frases', desc: 'Preencha a palavra que falta na frase em inglês' },
  { id: 'hangman', icon: '🎯', name: 'Jogo da Forca (Dica em Inglês)', desc: 'Descubra a palavra a partir da dica' },
  { id: 'memory', icon: '🃏', name: 'Jogo da Memória (Duelo)', desc: 'Encontre o par de significado correto o mais rápido possível' },
];

const BOT_ROUND_MS = 10_000;
const TOTAL_ROUNDS = 5;

const ANIMATED_TITLE_CLASSES = new Set([
  'title-animated-rainbow',
  'title-animated-neon',
  'title-animated-fire',
  'title-animated-diamond',
]);

const rankedTitleClass = (selectedTitle) =>
  ANIMATED_TITLE_CLASSES.has(selectedTitle) ? selectedTitle : '';

const generateGuestName = () => `Aluno${Math.floor(1000 + Math.random() * 9000)}`;

const WhoKnowsMore = () => {
  // O app tem uma moeda só (estrelas = totalScore, a mesma da Loja).
  const { progress, addPoints, completeGame, setDisplayName } = useProgress();
  // Modo BOT usa o banco do curso ativo. O modo HUMANO continua vindo do
  // servidor (backend/data/words.json, só inglês) — ver o gate de idioma na
  // tela de lobby.
  const { words } = useCourseData();
  // O duelo HUMANO é servido pelo backend, cujo banco (backend/data/words.json)
  // é gerado só do inglês — e o matchmaking é uma fila única. Deixar alguém em
  // espanhol entrar nessa fila serviria perguntas em inglês e ainda pareceria
  // um bug do idioma. O modo Bot roda 100% no cliente e funciona nos dois.
  const cursoAtivo = progress.activeCourse || 'en-pt';
  const duelOnlineDisponivel = cursoAtivo === 'en-pt';
  const nomeDoIdioma = AVAILABLE_COURSES.find(c => c.id === cursoAtivo)?.targetName || 'Inglês';
  // Os rankings são por idioma. Num curso sem duelo ao vivo a tabela de
  // troféus fica vazia POR DESENHO, não por falta de gente — dizer só
  // "ninguém no ranking" ali seria enganoso.
  const vazioPorFaltaDeDuelo = !duelOnlineDisponivel;
  const { playCorrect, playWrong, playAchievement } = useSound();
  const { speakNormal, speakSlow } = useSpeech();

  // Mesma checagem de sessão real que a navbar usa (ver Layout.jsx) — logado
  // de verdade joga com o apelido da CONTA, travado, não com um nome solto
  // digitado na hora (que é o que abria espaço pra alguém se passar por
  // outra pessoa no ranking).
  const { entryChoice, profile } = useAuthProfile();
  const estaLogado = entryChoice === 'account' && Boolean(profile?.nickname);

  const duel = useDuelSocket();
  // "Quantas pessoas no site" vem do heartbeat HTTP (vale em toda página);
  // "quantas procurando duelo" vem do socket, que só existe nesta tela.
  const presence = usePresence();

  // 'bot' | 'human'
  const [mode, setMode] = useState('bot');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [showSearchModal, setShowSearchModal]   = useState(false);
  const [showRankedTooltip, setShowRankedTooltip] = useState(false);
  const [showLevelTooltip, setShowLevelTooltip] = useState(false);
  const [showFullRankedModal, setShowFullRankedModal] = useState(false);
  
  // Estados para Sala Privada com Amigos
  const [showPrivateRoomModal, setShowPrivateRoomModal] = useState(false);
  const [privateRoomMode, setPrivateRoomMode]         = useState('create'); // 'create' | 'join' | 'waiting'
  const [createdRoomCode, setCreatedRoomCode]         = useState('');
  const [joinRoomInput, setJoinRoomInput]             = useState('');
  const [privateRoomError, setPrivateRoomError]       = useState(null);
  const [linkCopied, setLinkCopied]                   = useState(false);

  // Auto-join via URL ?room=AB7X2
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCodeFromUrl = urlParams.get('room');
    if (roomCodeFromUrl && duel.connected) {
      setMode('human');
      // Limpa o parâmetro ?room= da URL para não repetir a requisição ao reconectar
      window.history.replaceState({}, document.title, window.location.pathname);
      const name = estaLogado
        ? profile.nickname.slice(0, 20)
        : (nicknameDraft.trim() || progress.displayName || generateGuestName()).slice(0, 20);
      duel.joinPrivateRoom(roomCodeFromUrl, name).then((res) => {
        if (!res.ok) {
          setPrivateRoomMode('join');
          setJoinRoomInput(roomCodeFromUrl.toUpperCase());
          setPrivateRoomError(res.error || 'Não foi possível entrar na sala.');
          setShowPrivateRoomModal(true);
        }
      });
    }
  }, [duel.connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const [showBotSetupModal, setShowBotSetupModal] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState('loading'); // loading | loaded | error
  const [showFullRankingModal, setShowFullRankingModal] = useState(false);
  const [fullLeaderboard, setFullLeaderboard] = useState([]);
  const [fullLeaderboardStatus, setFullLeaderboardStatus] = useState('idle'); // idle | loading | loaded | error
  const [myRank, setMyRank] = useState(null); // { month, trophies, rank } | null

  // Ranking por nível (contas com apelido, mais palavras estudadas primeiro)
  // — independente do ranking de troféus, sem reset mensal.
  const [levelLeaderboard, setLevelLeaderboard] = useState([]);
  const [levelLeaderboardStatus, setLevelLeaderboardStatus] = useState('loading'); // loading | loaded | error
  const [showFullLevelModal, setShowFullLevelModal] = useState(false);
  const [fullLevelLeaderboard, setFullLevelLeaderboard] = useState([]);
  const [fullLevelLeaderboardStatus, setFullLevelLeaderboardStatus] = useState('idle'); // idle | loading | loaded | error

  const [nicknameDraft, setNicknameDraft] = useState('');
  const [selectedGameType, setSelectedGameType] = useState('translation');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [humanGameTypePreference, setHumanGameTypePreference] = useState('random');

  const [botConfig, setBotConfig] = useState(BOT_DIFFICULTIES[1]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [earnedBonus, setEarnedBonus] = useState(0);

  const [roundQuestions, setRoundQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]); // [{ roundNum, playerDelta, botDelta }]
  const [playerAnswered, setPlayerAnswered] = useState(false);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [botAnswered, setBotAnswered] = useState(false);
  const [botChoice, setBotChoice] = useState(null);
  const [botIsCorrect, setBotIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const [myChoice, setMyChoice] = useState(null);
  const [humanTimeLeft, setHumanTimeLeft] = useState(10);

  const timerRef = useRef(null);
  const botTimerRef = useRef(null);
  const humanTimerRef = useRef(null);
  // Identidade estável para o áudio: `speakNormal` troca de identidade quando o
  // navegador carrega vozes de forma assíncrona (voiceschanged). Sem o ref, o
  // efeito reexecutava no meio da rodada e zerava a escolha do jogador.
  const speakRef = useRef(speakNormal);
  speakRef.current = speakNormal;
  // Premiação idempotente: sem isto, uma reconexão com a tela de resultado
  // aberta reexecutava o efeito e pagava estrelas de novo.
  const awardedMatchRef = useRef(null);

  // Refs para evitar closure stale no handleDuelGameRoundEnd
  const playerScoreRef    = useRef(0);
  const botScoreRef       = useRef(0);
  const currentRoundRef   = useRef(0);
  const roundQuestionsRef = useRef([]);
  const botConfigRef      = useRef(BOT_DIFFICULTIES[1]);
  const setupRoundRef     = useRef(null); // preenchido após setupRound ser definido

  const isHuman = mode === 'human';

  // Top 5 do card — busca ao entrar na tela e sempre que voltar ao lobby.
  // `cursoAtivo` nas dependências: cada idioma tem a própria tabela, então
  // trocar de curso precisa refazer a busca — senão a tela continuaria
  // mostrando o ranking do idioma anterior.
  const fetchLeaderboard = useCallback(() => {
    setLeaderboardStatus('loading');
    getDuelLeaderboardRequest(5, cursoAtivo)
      .then(({ entries }) => { setLeaderboard(entries); setLeaderboardStatus('loaded'); })
      .catch(() => setLeaderboardStatus('error'));
  }, [cursoAtivo]);

  const fetchLevelLeaderboard = useCallback(() => {
    setLevelLeaderboardStatus('loading');
    getLevelLeaderboardRequest(5, cursoAtivo)
      .then(({ entries }) => { setLevelLeaderboard(entries); setLevelLeaderboardStatus('loaded'); })
      .catch(() => setLevelLeaderboardStatus('error'));
  }, [cursoAtivo]);

  useEffect(() => {
    if (gameState === 'lobby') {
      fetchLeaderboard();
      fetchLevelLeaderboard();
    }
  }, [gameState, fetchLeaderboard, fetchLevelLeaderboard]);

  const openFullRanking = () => {
    setShowFullRankingModal(true);
    setFullLeaderboardStatus('loading');
    getDuelLeaderboardRequest(50, cursoAtivo)
      .then(({ entries }) => { setFullLeaderboard(entries); setFullLeaderboardStatus('loaded'); })
      .catch(() => setFullLeaderboardStatus('error'));
    if (estaLogado) {
      getMyDuelRankRequest(cursoAtivo).then(setMyRank).catch(() => setMyRank(null));
    }
  };

  const openFullLevelRanking = () => {
    setShowFullLevelModal(true);
    setFullLevelLeaderboardStatus('loading');
    getLevelLeaderboardRequest(50, cursoAtivo)
      .then(({ entries }) => { setFullLevelLeaderboard(entries); setFullLevelLeaderboardStatus('loaded'); })
      .catch(() => setFullLevelLeaderboardStatus('error'));
  };

  // ============ MODO BOT (inalterado no comportamento) ============

  const openBotSetup = () => {
    // NÃO mexe em `mode` aqui. Antes mexia, e isso corrompia a tela de
    // resultado: mudar para 'bot' fazia a tela relê o placar do Bot (0 a 0) e
    // reescrever uma vitória como "Empate 0 pts vs 0 pts".
    setShowBotSetupModal(true);
  };

  // ─── Callback chamado por DuelHangman / DuelMemory / DuelBotGame quando a rodada termina
  const handleDuelGameRoundEnd = ({ playerScoreDelta, botScoreDelta }) => {
    // Registra histórico ANTES de incrementar a rodada
    setRoundHistory(prev => [...prev, {
      roundNum:    currentRoundRef.current + 1,
      playerDelta: playerScoreDelta,
      botDelta:    botScoreDelta,
    }]);

    // Acumula via refs para evitar stale closure
    playerScoreRef.current  += playerScoreDelta;
    botScoreRef.current     += botScoreDelta;
    setPlayerScore(playerScoreRef.current);
    setBotScore(botScoreRef.current);

    const nextRound = currentRoundRef.current + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      // Fim de jogo — usa refs para ter pontuação final correta
      if (timerRef.current)    clearInterval(timerRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      const iWon  = playerScoreRef.current > botScoreRef.current;
      const tie   = playerScoreRef.current === botScoreRef.current;
      const bonus = rewardFor({ iWon, tie, reason: 'completed' });
      setEarnedBonus(bonus);
      completeGame('whoKnowsMore');
      addPoints(bonus);
      if (iWon) playAchievement();
      else if (tie) playCorrect();
      else playWrong();
      setGameState('gameover');
    } else {
      currentRoundRef.current = nextRound;
      setCurrentRound(nextRound);
      setupRoundRef.current(nextRound, roundQuestionsRef.current, botConfigRef.current, true); // isBotMode
    }
  };

  const startBotGame = () => {
    setShowBotSetupModal(false);
    setMode('bot');

    // Reset refs e histórico para nova partida
    playerScoreRef.current  = 0;
    botScoreRef.current     = 0;
    currentRoundRef.current = 0;
    setRoundHistory([]);

    const diffObj = BOT_DIFFICULTIES.find(d => d.id === selectedDifficulty) || BOT_DIFFICULTIES[1];
    setBotConfig(diffObj);
    botConfigRef.current = diffObj;

    // ── Modo Memória: cada rodada tem um grupo de 4 palavras ──────────────────
    if (selectedGameType === 'memory') {
      const pool = shuffleArray([...words]);
      const memQuestions = Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
        type: 'memory',
        wordGroup: pool.slice(i * 4, (i + 1) * 4),
        word: pool[i * 4], // campo genérico necessário para cheques existentes
        correctAnswer: null,
        options: [],
      }));
      roundQuestionsRef.current = memQuestions;
      setRoundQuestions(memQuestions);
      setCurrentRound(0);
      setPlayerScore(0);
      setBotScore(0);
      setEarnedBonus(0);
      setGameState('playing');
      setupRoundRef.current(0, memQuestions, diffObj, true); // isBotMode=true
      return;
    }

    // Filtra o pool de palavras de acordo com os campos exigidos pelo tipo de jogo
    const wordPool = (() => {
      switch (selectedGameType) {
        case 'hangman':
          return shuffleArray(words.filter(w => w.tip && w.tip.trim()));
        case 'sentenceBuilder':
          return shuffleArray(words.filter(w => w.examplePt && w.examplePt.trim()));
        case 'fillBlanks':
          return shuffleArray(words.filter(w => w.example && w.example.trim() && !w.en.includes(' ')));
        case 'wordBuilder':
          return shuffleArray(words.filter(w => !w.en.includes(' ') && w.en.length >= 3));
        default:
          return shuffleArray([...words]);
      }
    })();

    const selectedWords = wordPool.slice(0, TOTAL_ROUNDS);
    const questions = selectedWords.map((wordObj) => {
      const otherWords = words.filter(w => w.en !== wordObj.en);

      switch (selectedGameType) {
        case 'trueFalse': {
          const isTrue = Math.random() < 0.5;
          const displayedPt = isTrue ? wordObj.pt : otherWords[Math.floor(Math.random() * otherWords.length)].pt;
          return {
            type: 'trueFalse', word: wordObj, displayedPt,
            correctAnswer: isTrue ? 'Verdadeiro' : 'Falso',
            options: ['Verdadeiro', 'Falso'],
          };
        }
        case 'wordBuilder': {
          const letters = wordObj.en.toUpperCase().split('');
          let scrambled = shuffleArray([...letters]).join(' ');
          if (scrambled === letters.join(' ') && letters.length > 1) {
            scrambled = [...letters].reverse().join(' ');
          }
          const wrongWords = shuffleArray(otherWords.filter(w => !w.en.includes(' '))).slice(0, 3).map(w => w.en);
          return {
            type: 'wordBuilder', word: wordObj, scrambledText: scrambled,
            correctAnswer: wordObj.en,
            options: shuffleArray([wordObj.en, ...wrongWords]),
          };
        }
        case 'sentenceBuilder': {
          const wrongSentences = shuffleArray(otherWords.filter(w => w.examplePt && w.examplePt !== wordObj.examplePt)).slice(0, 3).map(w => w.examplePt);
          return {
            type: 'sentenceBuilder', word: wordObj,
            correctAnswer: wordObj.examplePt,
            options: shuffleArray([wordObj.examplePt, ...wrongSentences]),
          };
        }
        case 'fillBlanks': {
          const regex = new RegExp(`\\b${wordObj.en}\\b`, 'gi');
          let blanked = wordObj.example.replace(regex, '_______');
          if (blanked === wordObj.example) {
            const firstWord = wordObj.en.split(' ')[0];
            blanked = wordObj.example.replace(new RegExp(firstWord, 'gi'), '_______');
          }
          const wrongChoices = shuffleArray(otherWords.filter(w => !w.en.includes(' '))).slice(0, 3).map(w => w.en);
          return {
            type: 'fillBlanks', word: wordObj, blankedSentence: blanked,
            correctAnswer: wordObj.en,
            options: shuffleArray([wordObj.en, ...wrongChoices]),
          };
        }
        case 'hangman': {
          const wrongChoices = shuffleArray(otherWords).slice(0, 3).map(w => w.en);
          return {
            type: 'hangman', word: wordObj,
            correctAnswer: wordObj.en,
            options: shuffleArray([wordObj.en, ...wrongChoices]),
          };
        }
        case 'memory': {
          const wrongChoices = shuffleArray(otherWords).slice(0, 3).map(w => w.pt);
          return {
            type: 'memory', word: wordObj,
            correctAnswer: wordObj.pt,
            options: shuffleArray([wordObj.pt, ...wrongChoices]),
          };
        }
        case 'listening':
        case 'translation':
        default: {
          const wrongOptions = shuffleArray(otherWords).slice(0, 3).map(w => w.pt);
          return {
            type: selectedGameType, word: wordObj,
            correctAnswer: wordObj.pt,
            options: shuffleArray([wordObj.pt, ...wrongOptions]),
          };
        }
      }
    });

    roundQuestionsRef.current = questions;
    setRoundQuestions(questions);
    setCurrentRound(0);
    setPlayerScore(0);
    setBotScore(0);
    setEarnedBonus(0);
    setGameState('playing');
    setupRoundRef.current(0, questions, diffObj, true); // isBotMode=true
  };

  const setupRound = (roundIdx, questionsList = roundQuestions, currentBotConfig = botConfig, isBotMode = false) => {
    const q = questionsList[roundIdx];
    setCurrentQuestion(q);
    setPlayerAnswered(false);
    setPlayerChoice(null);
    setBotAnswered(false);
    setBotChoice(null);
    setBotIsCorrect(false);
    setTimeLeft(10);

    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    // No modo bot, DuelHangman/DuelMemory/DuelBotGame gerenciam os próprios timers
    // e o speak (Listening). Apenas o modo humano usa os timers centralizados aqui.
    if (isBotMode) return;

    // Modo humano: fala a palavra para Listening e inicia countdown + bot
    if (q.type === 'listening') speakRef.current(q.word.en);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPlayerAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const delayRange = currentBotConfig.maxDelay - currentBotConfig.minDelay;
    const botDelay = Math.floor(Math.random() * delayRange) + currentBotConfig.minDelay;
    botTimerRef.current = setTimeout(() => triggerBotAnswer(q, currentBotConfig), botDelay);
  };
  setupRoundRef.current = setupRound;

  const triggerBotAnswer = (q, currentBotConfig) => {
    if (!q) return;
    const isCorrect = Math.random() < currentBotConfig.accuracy;
    let chosen = q.correctAnswer;
    if (!isCorrect) {
      const wrongChoices = q.options.filter(opt => opt !== q.correctAnswer);
      chosen = wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || q.correctAnswer;
    }
    setBotAnswered(true);
    setBotChoice(chosen);
    setBotIsCorrect(isCorrect);
    if (isCorrect) setBotScore(prev => prev + 100);
  };

  const handlePlayerChoice = (option) => {
    if (playerAnswered || !currentQuestion) return;
    setPlayerAnswered(true);
    setPlayerChoice(option);
    if (option === currentQuestion.correctAnswer) {
      playCorrect();
      setPlayerScore(prev => prev + 100 + timeLeft * 10);
    } else {
      playWrong();
    }
  };

  const finishBotGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    setGameState('gameover');

    const iWon = playerScore > botScore;
    const tie = playerScore === botScore;
    const bonus = rewardFor({ iWon, tie, reason: 'completed' });
    setEarnedBonus(bonus);
    completeGame('whoKnowsMore');
    addPoints(bonus);

    if (iWon) playAchievement();
    else if (tie) playCorrect();
    else playWrong();
  }, [playerScore, botScore, completeGame, addPoints, playAchievement, playCorrect, playWrong]);

  // Avanço de rodada do modo Bot
  useEffect(() => {
    if (gameState !== 'playing' || isHuman) return;
    if (playerAnswered && (botAnswered || timeLeft === 0)) {
      const t = setTimeout(() => {
        if (currentRound + 1 < TOTAL_ROUNDS) {
          const next = currentRound + 1;
          setCurrentRound(next);
          setupRound(next);
        } else {
          finishBotGame();
        }
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [playerAnswered, botAnswered, timeLeft, gameState, currentRound, isHuman, finishBotGame]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    if (humanTimerRef.current) clearInterval(humanTimerRef.current);
  }, []);

  // ============ MODO HUMANO ============

  const openHumanSearch = () => {
    setMode('human');
    setNicknameDraft(estaLogado ? profile.nickname : (progress.displayName || generateGuestName()));
    setShowSearchModal(true);
  };

  const handleStartSearch = async () => {
    // Logado: o apelido é sempre o da conta, nunca o que ficou no campo —
    // o campo é só leitura pra quem está logado (ver input abaixo).
    const name = estaLogado
      ? profile.nickname.slice(0, 20)
      : (nicknameDraft.trim() || generateGuestName()).slice(0, 20);
    setNicknameDraft(name);
    if (!estaLogado) setDisplayName(name);

    let authTicket;
    if (estaLogado) {
      try {
        const { ticket } = await getDuelTicketRequest();
        authTicket = ticket;
      } catch {
        // Sessão pode ter expirado entre abrir o modal e clicar aqui — joga
        // como convidado em vez de travar o botão "Procurar Oponente".
      }
    }
    duel.joinQueue(name, humanGameTypePreference, authTicket);
  };

  const cancelHumanSearch = () => {
    duel.leaveQueue();
    setShowSearchModal(false);
    setMode('bot');
  };

  const closePrivateRoomModal = () => {
    if (duel.privateRoom?.roomCode) {
      duel.leavePrivateRoom(duel.privateRoom.roomCode);
    }
    setShowPrivateRoomModal(false);
    setPrivateRoomMode('create');
    setPrivateRoomError(null);
    setMode('bot');
  };

  const returnToLobby = useCallback(() => {
    if (isHuman) duel.resetMatch();
    setMode('bot');
    setConfirmExit(false);
    setGameState('lobby');
  }, [isHuman, duel]);

  // Espelha o estado da partida do servidor no estado de tela
  useEffect(() => {
    if (!isHuman) return;
    if (duel.matchState === 'playing' || duel.matchState === 'matched') {
      setShowSearchModal(false);
      setShowPrivateRoomModal(false);
      setGameState('playing');
    } else if (duel.matchState === 'ended' || duel.matchState === 'lost') {
      setGameState('gameover');
    }
  }, [isHuman, duel.matchState]);

  useEffect(() => {
    if (!duel.privateRoom?.roomCode) return;
    setMode('human');
    setCreatedRoomCode(duel.privateRoom.roomCode);
    setPrivateRoomMode('waiting');
    setShowPrivateRoomModal(true);
  }, [duel.privateRoom?.roomCode]);

  // Nova rodada: limpa a escolha. Chaveado em roundIndex (primitivo) — antes
  // dependia de `speakNormal`, cuja identidade muda quando as vozes carregam.
  useEffect(() => {
    if (!isHuman) return;
    setMyChoice(null);
  }, [isHuman, duel.roundIndex]);

  // Áudio do modo Escuta, em efeito separado e via ref estável
  useEffect(() => {
    if (!isHuman || duel.question?.type !== 'listening') return;
    speakRef.current(duel.question.prompt.en);
  }, [isHuman, duel.question, duel.roundIndex]);

  // Cronômetro do modo humano, corrigido pela defasagem de relógio medida em
  // useDuelSocket. Sem isso, relógio adiantado zerava o tempo e travava tudo.
  useEffect(() => {
    if (!isHuman || !duel.roundDeadline || gameState !== 'playing') return;
    const tick = () => setHumanTimeLeft(
      secondsLeft(duel.roundDeadline, duel.clockOffsetRef.current)
    );
    tick();
    humanTimerRef.current = setInterval(tick, 250);
    return () => clearInterval(humanTimerRef.current);
  }, [isHuman, duel.roundDeadline, duel.clockOffsetRef, gameState]);

  // Som do resultado da rodada
  useEffect(() => {
    if (!isHuman || !duel.roundResult) return;
    const mine = duel.roundResult.answers.find(a => a.id === duel.myId);
    if (mine?.correct) playCorrect(); else playWrong();

    // Acumula historico de rodadas no modo humano
    const closed = duel.roundResult;
    const playerDelta = mine?.pointsEarned ?? 0;
    const opponentDelta = closed?.answers?.find(r => r.id !== duel.myId)?.pointsEarned ?? 0;
    setRoundHistory(prev => [
      ...prev,
      { roundNum: duel.roundIndex + 1, playerDelta, botDelta: opponentDelta, fromHuman: true },
    ]);
  }, [isHuman, duel.roundResult, duel.myId, playCorrect, playWrong]);

  // Fim de partida: premia UMA vez por partida (awardedMatchRef) e não paga
  // nada quando o oponente desistiu (ver src/utils/duelReward.js).
  useEffect(() => {
    if (!isHuman || !duel.matchEnd) return;
    if (awardedMatchRef.current === duel.matchEnd.matchId) return;
    awardedMatchRef.current = duel.matchEnd.matchId;

    const { iWon, reason } = duel.matchEnd;
    const tie = duel.matchEnd.winnerId === null && reason === 'completed';
    const bonus = rewardFor({ iWon, tie, reason });
    setEarnedBonus(bonus);

    if (reason === 'opponent_left') {
      playWrong();
      return; // sem completeGame e sem estrelas
    }

    completeGame('whoKnowsMore');
    addPoints(bonus);
    if (iWon) playAchievement();
    else if (tie) playCorrect();
    else playWrong();
  }, [isHuman, duel.matchEnd, completeGame, addPoints, playAchievement, playCorrect, playWrong]);

  const handleHumanChoice = (option) => {
    if (myChoice !== null || humanTimeLeft === 0) return;
    setMyChoice(option);
    duel.submitAnswer(option);
  };

  const handleExitDuel = () => {
    if (isHuman) duel.forfeit();
    returnToLobby();
  };

  // ============ VALORES DERIVADOS ============
  // No caminho humano, activeQuestion só serve pra checar "existe pergunta?"
  // (linha do gameState 'playing' abaixo) — DuelOnlineGame consome
  // duel.question direto, sem passar por toDisplayQuestion. Chamar
  // toDisplayQuestion aqui quebrava toda partida de Memória online: a
  // pergunta de memória nunca teve `prompt` (só `wordGroup`), e o caso
  // default da função lê `prompt.en`, explodindo com TypeError.
  const activeQuestion = isHuman ? duel.question : currentQuestion;
  const timeLeftDisplay = isHuman ? humanTimeLeft : timeLeft;
  const roundMsDisplay = isHuman ? duel.roundMs : BOT_ROUND_MS;
  const remainingMs = isHuman
    ? msLeft(duel.roundDeadline, duel.clockOffsetRef.current)
    : timeLeft * 1000;
  const roundIndexDisplay = isHuman ? duel.roundIndex : currentRound;
  const totalRoundsDisplay = isHuman ? duel.totalRounds : TOTAL_ROUNDS;
  const myScoreDisplay = isHuman ? (duel.scores[duel.myId] || 0) : playerScore;
  const opponentScoreDisplay = isHuman
    ? (duel.opponent ? (duel.scores[duel.opponent.id] || 0) : 0)
    : botScore;
  const opponentName = isHuman ? (duel.opponent?.nickname || 'Oponente') : botConfig.name;
  const hasAnswered = isHuman ? myChoice !== null : playerAnswered;
  const revealedAnswer = isHuman
    ? (duel.roundResult?.correctAnswer ?? null)
    : (playerAnswered ? currentQuestion?.correctAnswer : null);

  // Estado da conexão para a pílula de presença e o botão de procurar.
  // O socket é a fonte de verdade para "posso duelar agora": sem ele, entrar na
  // fila não funciona, mesmo que o heartbeat HTTP esteja respondendo.
  const connected = duel.status === 'connected';
  const pillLabel = presenceLabel({
    status: connected ? 'ok' : duel.status === 'offline' ? 'offline' : 'connecting',
    online: presence.online,
    queue: duel.queueCount,
  });
  const searchButtonLabel = connected
    ? '🔍 Procurar Oponente'
    : duel.status === 'offline' ? 'Servidor indisponível' : 'Conectando…';

  const matchLost = isHuman && duel.matchState === 'lost';
  const privateRoom = duel.privateRoom;
  const privateRoomPlayers = privateRoom?.players ?? [];
  const privateRoomMe = privateRoomPlayers.find(p => p.id === duel.myId);
  const privateRoomOpponent = privateRoomPlayers.find(p => p.id !== duel.myId);
  const privateRoomIsHost = Boolean(privateRoom && privateRoom.hostId === duel.myId);
  const privateRoomReady = Boolean(privateRoomMe?.ready);
  const privateRoomSelectedGame = GAME_TYPES.find(gt => gt.id === privateRoom?.gameTypePreference);

  return (
    <div className="who-knows-more-page page">
      <div className="container">
        {/* ================= LOBBY ================= */}
        {gameState === 'lobby' && (
          <div className="lobby-container animate-fade-in-up">
            {/* A volta para /games era a única que ficava no RODAPÉ do lobby, e não
                no topo como nos outros 8 jogos — quem quisesse sair precisava
                rolar a página inteira até o fim. Subiu para cá. */}
            <Link to="/games" className="btn btn-ghost btn-sm lobby-back">← Todos os jogos</Link>
            <div className="lobby-header">
              <span className="badge badge-purple">⚔️ MODO DUELO</span>
              <h1>Quem Sabe Mais?</h1>
              <p className="text-secondary">
                Dispute contra outra pessoa ao vivo, ou personalize seu duelo contra o Bot com <strong>todos os 8 jogos</strong> do Wordly!
              </p>
            </div>

            <div className="mode-selection-grid">
              {/* HUMANO */}
              <div className="mode-card mode-card--human glass-card" onClick={(connected && duelOnlineDisponivel) ? openHumanSearch : undefined}>
                <span className={`presence-pill mode-badge ${connected ? '' : 'offline'}`}>
                  <span className={`pulse-dot ${connected ? '' : 'idle'}`} /> {pillLabel}
                </span>
                <div className="mode-icon" aria-hidden="true">👥</div>
                <h3>Jogar com Humano</h3>
                <p>Enfrente outra pessoa ao vivo. Quem responder mais rápido vence!</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--space-md)', width: '100%' }}
                  onClick={openHumanSearch}
                  disabled={!connected || !duelOnlineDisponivel}
                >
                  {duelOnlineDisponivel ? searchButtonLabel : '🔒 Só em Inglês'}
                </button>
                {!connected && duelOnlineDisponivel && (
                  <p className="presence-note">O modo Bot funciona sem servidor.</p>
                )}
                {!duelOnlineDisponivel && (
                  <p className="presence-note">
                    O duelo ao vivo ainda só tem perguntas em inglês. O modo Bot
                    abaixo funciona no seu idioma atual.
                  </p>
                )}
              </div>

              {/* BOT */}
              <div className="mode-card mode-card--bot glass-card" onClick={openBotSetup}>
                <span className="badge badge-green mode-badge">8 Jogos 🎮</span>
                <div className="mode-icon" aria-hidden="true">🤖</div>
                <h3>Jogar com Bot (IA)</h3>
                <p>Escolha qual dos 8 jogos disputar e o nível de desafio da IA.</p>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)', width: '100%' }} onClick={openBotSetup}>
                  ⚙️ Escolher Jogo &amp; Duelar
                </button>
              </div>

              {/* SALA PRIVADA COM AMIGOS */}
              <div className="mode-card glass-card" onClick={() => { setMode('human'); setShowPrivateRoomModal(true); setPrivateRoomMode('create'); }} style={{ border: '2px solid var(--accent-purple, #a855f7)' }}>
                <span className="badge badge-purple mode-badge">WhatsApp 📲</span>
                <div className="mode-icon" aria-hidden="true">🔗</div>
                <h3>Sala Privada (Amigos)</h3>
                <p>Crie um código de 5 dígitos ou envie um link direto no WhatsApp para jogar!</p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: 'var(--space-md)', width: '100%', borderColor: 'var(--accent-purple, #a855f7)', color: 'var(--accent-purple, #a855f7)' }}
                  onClick={() => { setMode('human'); setShowPrivateRoomModal(true); setPrivateRoomMode('create'); }}
                  disabled={!connected}
                >
                  🔗 Convidar Amigo
                </button>
              </div>
            </div>

            {/* ─── Seção Ranked: Troféus (esquerda) + Níveis (direita) ──────── */}
            <div className="ranked-section">
              <div className="ranked-columns">

                {/* Coluna esquerda — Top 5 do Mês (troféus de duelo) */}
                <div className="ranked-column">
                  <div className="ranked-section-header">
                    <span className="badge badge-green">🏆 RANKED</span>
                    <h2>Top 5 do Mês</h2>
                    <div className="ranked-subtitle-wrapper">
                      <p className="text-secondary">
                        Veja os jogadores com melhor desempenho no modo duelo.
                      </p>
                      <div className="ranked-info-tooltip-container">
                        <button
                          type="button"
                          className="ranked-info-btn"
                          onClick={() => setShowRankedTooltip(!showRankedTooltip)}
                          onMouseEnter={() => setShowRankedTooltip(true)}
                          onMouseLeave={() => setShowRankedTooltip(false)}
                          aria-label="Requisitos para aparecer no ranking"
                        >
                          ℹ️
                        </button>
                        {showRankedTooltip && (
                          <div className="ranked-info-tooltip glass-card animate-fade-in-up">
                            <span className="tooltip-icon">💡</span>
                            <p>Para você aparecer no ranked você precisa estar logado em uma conta e ter escolhido um apelido.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ranked-card glass-card">
                    {leaderboardStatus === 'loading' && (
                      <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                        Carregando ranking…
                      </p>
                    )}
                    {leaderboardStatus === 'error' && (
                      <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                        Não foi possível carregar o ranking agora.
                      </p>
                    )}
                    {leaderboardStatus === 'loaded' && leaderboard.length === 0 && (
                      <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                        {vazioPorFaltaDeDuelo
                          ? `O duelo ao vivo ainda só existe em Inglês, então o ranking de troféus em ${nomeDoIdioma} começa quando ele chegar.`
                          : 'Ninguém no ranking ainda este mês — vença um duelo pra ser o primeiro!'}
                      </p>
                    )}
                    {leaderboardStatus === 'loaded' && leaderboard.length > 0 && (
                      <div className="ranked-list">
                        {leaderboard.map((entry, i) => {
                          const levelObj = getCurrentLevel(entry.wordsStudied || 0, cursoAtivo);
                          const title = getUserTitle(levelObj?.level || 1);
                          return (
                          <div key={`${entry.nickname}-${i}`} className={`ranked-item rank-pos-${i + 1}`}>
                            <div className="ranked-position-col">
                              <span className={`ranked-position-num pos-${i + 1}`}>#{i + 1}</span>
                            </div>

                            <div className="ranked-player-col">
                              <AvatarDisplay avatar={entry.avatar || '👤'} size="sm" />
                              <div className="ranked-player-details">
                                <span className="ranked-player-name">{entry.nickname}</span>
                                <span className="ranked-player-tag">
                                  <span className={rankedTitleClass(entry.selectedTitle)}>{title.tag}</span>
                                </span>
                              </div>
                            </div>

                            <div className="ranked-score-col">
                              <div className="ranked-score-main">
                                <span className="ranked-trophy">🏆</span>
                                <strong>{entry.trophies}</strong> <small>troféus</small>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="ranked-footer">
                      <button className="btn btn-ghost btn-sm ranked-full-btn" onClick={openFullRanking}>
                        📊 Ver Ranking Completo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coluna direita — Top Níveis (contas com mais palavras estudadas) */}
                <div className="ranked-column">
                  <div className="ranked-section-header">
                    <span className="badge badge-purple">🎓 NÍVEIS</span>
                    <h2>Top Níveis</h2>
                    <div className="ranked-subtitle-wrapper">
                      <p className="text-secondary">
                        Os alunos que mais avançaram nos estudos.
                      </p>
                      <div className="ranked-info-tooltip-container">
                        <button
                          type="button"
                          className="ranked-info-btn"
                          onClick={() => setShowLevelTooltip(!showLevelTooltip)}
                          onMouseEnter={() => setShowLevelTooltip(true)}
                          onMouseLeave={() => setShowLevelTooltip(false)}
                          aria-label="Requisitos para aparecer no ranking de níveis"
                        >
                          ℹ️
                        </button>
                        {showLevelTooltip && (
                          <div className="ranked-info-tooltip glass-card animate-fade-in-up">
                            <span className="tooltip-icon">💡</span>
                            <p>Para você aparecer aqui você precisa estar logado em uma conta e ter escolhido um apelido.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ranked-card glass-card">
                    {levelLeaderboardStatus === 'loading' && (
                      <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                        Carregando ranking…
                      </p>
                    )}
                    {levelLeaderboardStatus === 'error' && (
                      <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                        Não foi possível carregar o ranking agora.
                      </p>
                    )}
                    {levelLeaderboardStatus === 'loaded' && levelLeaderboard.length === 0 && (
                      <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                        Ninguém no ranking de {nomeDoIdioma} ainda — crie uma conta e estude pra ser o primeiro!
                      </p>
                    )}
                    {levelLeaderboardStatus === 'loaded' && levelLeaderboard.length > 0 && (
                      <div className="ranked-list">
                        {levelLeaderboard.map((entry, i) => {
                          const levelObj = getCurrentLevel(entry.wordsStudied || 0, cursoAtivo);
                          const title = getUserTitle(levelObj?.level || 1);
                          return (
                            <div key={`${entry.nickname}-${i}`} className={`ranked-item rank-pos-${i + 1}`}>
                              <div className="ranked-position-col">
                                <span className={`ranked-position-num pos-${i + 1}`}>#{i + 1}</span>
                              </div>

                              <div className="ranked-player-col">
                                <AvatarDisplay avatar={entry.avatar || '👤'} size="sm" />
                                <div className="ranked-player-details">
                                  <span className="ranked-player-name">{entry.nickname}</span>
                                  <span className="ranked-player-tag">
                                    <span className={rankedTitleClass(entry.selectedTitle)}>{title.tag}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="ranked-score-col">
                                <div className="ranked-score-main">
                                  <span className="ranked-trophy">🎓</span>
                                  <strong>{levelObj?.level || 1}</strong> <small>nível</small>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="ranked-footer">
                      <button className="btn btn-ghost btn-sm ranked-full-btn" onClick={openFullLevelRanking}>
                        📊 Ver Ranking Completo
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ================= PARTIDA ================= */}
        {gameState === 'playing' && activeQuestion && !matchLost && (
          <>
            {/* ── Bot + Forca → DuelHangman (UI real da forca) ────────────────── */}
            {!isHuman && activeQuestion.type === 'hangman' && (
              <DuelHangman
                key={currentRound}
                word={currentQuestion.word}
                botConfig={botConfig}
                roundIndex={currentRound}
                totalRounds={TOTAL_ROUNDS}
                playerScore={playerScore}
                botScore={botScore}
                playerAvatar={progress.selectedAvatar || '👤'}
                onRoundEnd={handleDuelGameRoundEnd}
                confirmExit={confirmExit}
                onRequestExit={() => setConfirmExit(true)}
                onConfirmExit={handleExitDuel}
                onCancelExit={() => setConfirmExit(false)}
              />
            )}

            {/* ── Bot + Memória → DuelMemory (grade de cartas real) ────────────── */}
            {!isHuman && activeQuestion.type === 'memory' && (
              <DuelMemory
                key={currentRound}
                words={currentQuestion.wordGroup}
                botConfig={botConfig}
                roundIndex={currentRound}
                totalRounds={TOTAL_ROUNDS}
                playerScore={playerScore}
                botScore={botScore}
                playerAvatar={progress.selectedAvatar || '👤'}
                onRoundEnd={handleDuelGameRoundEnd}
                confirmExit={confirmExit}
                onRequestExit={() => setConfirmExit(true)}
                onConfirmExit={handleExitDuel}
                onCancelExit={() => setConfirmExit(false)}
              />
            )}

            {/* ── Bot + outros tipos → DuelBotGame (UI real de cada jogo) ─────── */}
            {!isHuman && !['hangman', 'memory'].includes(activeQuestion.type) && (
              <DuelBotGame
                key={currentRound}
                question={currentQuestion}
                botConfig={botConfig}
                roundIndex={currentRound}
                totalRounds={TOTAL_ROUNDS}
                playerScore={playerScore}
                botScore={botScore}
                playerAvatar={progress.selectedAvatar || '👤'}
                onRoundEnd={handleDuelGameRoundEnd}
                confirmExit={confirmExit}
                onRequestExit={() => setConfirmExit(true)}
                onConfirmExit={handleExitDuel}
                onCancelExit={() => setConfirmExit(false)}
              />
            )}

            {/* ── Online (Humano) → DuelOnlineGame (UI real de cada jogo) ──────── */}
            {isHuman && duel.question && (
              <DuelOnlineGame
                key={`${duel.roundIndex}-${duel.question?.type}`}
                question={duel.question}
                duel={duel}
                playerAvatar={progress.selectedAvatar || '👤'}
                confirmExit={confirmExit}
                onRequestExit={() => setConfirmExit(true)}
                onConfirmExit={handleExitDuel}
                onCancelExit={() => setConfirmExit(false)}
              />
            )}

            {/* ── Histórico de rodadas (bot e humano) ─────────────────────────── */}
            {roundHistory.length > 0 && (
              <div className="round-history-panel animate-fade-in-up">
                <p className="round-history-title">📋 Histórico de Rodadas</p>
                {roundHistory.map((r, i) => {
                  const playerWon = r.playerDelta > r.botDelta;
                  const tie       = r.playerDelta === r.botDelta;
                  const opName    = isHuman ? (duel.opponent?.nickname || 'Oponente') : botConfig.name;
                  return (
                    <div key={i} className="round-history-row">
                      <span className="rh-label">Rodada {r.roundNum}</span>
                      <span className={`rh-badge ${playerWon ? 'rh-win' : tie ? 'rh-tie' : 'rh-loss'}`}>
                        {playerWon ? '🏆 Você' : tie ? '🤝 Empate' : `${isHuman ? '👤' : '🤖'} ${opName}`}
                      </span>
                      <span className="rh-scores">
                        Você <strong>{r.playerDelta}</strong> × {opName} <strong>{r.botDelta}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}



        {/* ========= CONEXÃO PERDIDA (antes: tela congelada sem saída) ========= */}
        {matchLost && (
          <div className="duel-lost-panel glass-card animate-bounce-in">
            <div className="result-icon" aria-hidden="true">🔌</div>
            <h2>Conexão perdida</h2>
            <p className="text-secondary" style={{ margin: 'var(--space-md) 0 var(--space-lg)' }}>
              A partida foi encerrada porque a conexão caiu. Nenhuma estrela foi perdida.
            </p>
            <button className="btn btn-primary" onClick={returnToLobby}>Voltar ao lobby</button>
          </div>
        )}

        {/* ================= FIM DE PARTIDA ================= */}
        {gameState === 'gameover' && !matchLost && (
          <div className="gameover-container glass-card animate-bounce-in">
            <div className="gameover-header">
              {(() => {
                const forfeited = isHuman && duel.matchEnd?.reason === 'opponent_left';
                const won = isHuman ? duel.matchEnd?.iWon : playerScore > botScore;
                const tied = isHuman
                  ? (duel.matchEnd?.winnerId === null && duel.matchEnd?.reason === 'completed')
                  : playerScore === botScore;

                if (forfeited) return (
                  <>
                    <div className="result-icon" aria-hidden="true">🚪</div>
                    <h1>Oponente saiu</h1>
                    <p className="text-secondary">
                      A partida foi encerrada. Duelos abandonados não valem estrelas.
                    </p>
                  </>
                );
                if (won) return (
                  <>
                    <div className="result-icon" aria-hidden="true">🏆</div>
                    <h1>Grande Vitória!</h1>
                    <p className="text-secondary">Você venceu {opponentName}!</p>
                  </>
                );
                if (tied) return (
                  <>
                    <div className="result-icon" aria-hidden="true">🤝</div>
                    <h1>Empate Eletrizante!</h1>
                    <p className="text-secondary">Você e {opponentName} empataram!</p>
                  </>
                );
                return (
                  <>
                    <div className="result-icon" aria-hidden="true">🥈</div>
                    <h1>Bom Duelo!</h1>
                    <p className="text-secondary">{opponentName} levou a melhor dessa vez!</p>
                  </>
                );
              })()}
            </div>

            <div className="final-scoreboard">
              <div className="final-score-box">
                <span>Sua Pontuação</span>
                <h2>{myScoreDisplay} pts</h2>
              </div>
              <div className="final-score-vs" aria-hidden="true">VS</div>
              <div className="final-score-box">
                <span>{opponentName}</span>
                <h2>{opponentScoreDisplay} pts</h2>
              </div>
            </div>

            {/* Escondido quando não houve recompensa (desistência do oponente) */}
            {(!isHuman || isRewarded(duel.matchEnd)) && (
              <div className="rewards-card">
                <div className="reward-item">
                  <span>🏆 Bônus do duelo:</span>
                  <strong>+{earnedBonus} estrelas</strong>
                </div>
                <div className="reward-item">
                  <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>
                    + o bônus de conclusão de fase, como em qualquer outro jogo
                  </span>
                </div>
              </div>
            )}

            <div className="gameover-actions">
              {isHuman && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => duel.requestRematch()}
                  disabled={duel.rematchStatus === 'requesting'}
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {duel.rematchStatus === 'requesting'
                    ? '⏳ Solicitando Revanche...'
                    : duel.rematchStatus === 'declined'
                    ? '❌ Revanche Recusada'
                    : '🔄 Pedir Revanche'}
                </button>
              )}
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (isHuman) { duel.resetMatch(); openHumanSearch(); }
                  else startBotGame();
                }}
              >
                🔁 Procurar Novo Duelo
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => { returnToLobby(); openBotSetup(); }}
              >
                ⚙️ Trocar de Jogo
              </button>
              <button className="btn btn-ghost btn-lg" onClick={returnToLobby}>
                ⚔️ Voltar ao Lobby
              </button>
            </div>
          </div>
        )}

        {/* Modal de Revanche Recebida */}
        {isHuman && duel.rematchProposed && (
          <div className="modal-backdrop animate-fade-in" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)'
          }}>
            <div className="modal-card glass-card animate-bounce-in" style={{ maxWidth: 420, textAlign: 'center', padding: 'var(--space-xl)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🔄</div>
              <h2>Pedido de Revanche!</h2>
              <p className="text-secondary" style={{ margin: 'var(--space-sm) 0 var(--space-lg)' }}>
                <strong>{duel.rematchProposed.requesterName}</strong> quer jogar uma revanche agora mesmo!
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => duel.respondRematch(true)}
                >
                  ✅ Aceitar Revanche
                </button>
                <button
                  className="btn btn-ghost btn-lg"
                  onClick={() => duel.respondRematch(false)}
                >
                  ❌ Recusar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal de Sala Privada com Amigos */}
        {showPrivateRoomModal && (
          <div className="modal-backdrop animate-fade-in" onClick={closePrivateRoomModal} style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)'
          }}>
            <div className="modal-card glass-card animate-bounce-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, width: '100%', textAlign: 'center', padding: 'var(--space-xl)' }}>
              {privateRoomMode !== 'waiting' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <button
                  className={`btn ${privateRoomMode !== 'join' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => { setPrivateRoomMode('create'); setPrivateRoomError(null); }}
                >
                  ➕ Criar Sala
                </button>
                <button
                  className={`btn ${privateRoomMode === 'join' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => { setPrivateRoomMode('join'); setPrivateRoomError(null); }}
                >
                  🔑 Entrar com Código
                </button>
              </div>
              )}

              {privateRoomMode === 'create' && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-xs)' }}>🔗 Criar Sala Privada</h3>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                    Gere um código de 5 dígitos para convidar seu amigo pelo WhatsApp!
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    onClick={async () => {
                      setMode('human');
                      const name = estaLogado
                        ? profile.nickname.slice(0, 20)
                        : (nicknameDraft.trim() || progress.displayName || generateGuestName()).slice(0, 20);
                      const res = await duel.createPrivateRoom('random', name);
                      if (res.ok) {
                        setCreatedRoomCode(res.roomCode);
                        setPrivateRoomMode('waiting');
                      } else {
                        setPrivateRoomError(res.error);
                      }
                    }}
                  >
                    🎲 Criar Sala Privada
                  </button>
                </div>
              )}

              {privateRoomMode === 'waiting' && (
                <div>
                  <span style={{ fontSize: '2.5rem' }}>⌛</span>
                  <h3>Sala privada</h3>
                  <div style={{
                    margin: 'var(--space-md) 0', padding: 'var(--space-md)',
                    background: 'var(--bg-purple-subtle)', borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--accent-purple, #a855f7)'
                  }}>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>CÓDIGO DA SALA</div>
                    <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--accent-purple, #a855f7)' }}>
                      {createdRoomCode}
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    {[privateRoomMe, privateRoomOpponent].map((player, index) => (
                      <div
                        key={player?.id ?? index}
                        className="glass-card"
                        style={{
                          padding: 'var(--space-md)',
                          background: 'var(--gradient-card)',
                          minHeight: 94,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <strong>{player?.nickname || (index === 0 ? 'Você' : 'Aguardando amigo')}</strong>
                        <span className={`badge ${player?.ready ? 'badge-green' : 'badge-purple'}`} style={{ alignSelf: 'center' }}>
                          {player?.ready ? '✅ Pronto' : '⌛ Aguardando'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'left', marginBottom: 'var(--space-md)' }}>
                    <label className="setup-label">🎮 Modo da partida</label>
                    {privateRoomIsHost ? (
                      <div className="game-type-selector-grid" style={{ marginTop: 'var(--space-xs)' }}>
                        {[{ id: 'random', icon: '🎲', name: 'Aleatório' }, ...GAME_TYPES].map((gt) => (
                          <button
                            key={gt.id}
                            className={`game-type-btn ${privateRoom?.gameTypePreference === gt.id ? 'selected' : ''}`}
                            onClick={() => duel.selectPrivateRoomGame(privateRoom.roomCode, gt.id)}
                            disabled={privateRoomReady}
                          >
                            <span className="gt-icon">{gt.icon}</span>
                            <span className="gt-label">{gt.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="glass-card" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-xs)', background: 'var(--gradient-card)' }}>
                        <strong>{privateRoom?.gameTypePreference === 'random' ? '🎲 Aleatório' : `${privateRoomSelectedGame?.icon ?? '🎮'} ${privateRoomSelectedGame?.name ?? 'Modo escolhido'}`}</strong>
                        <p className="text-secondary" style={{ margin: '4px 0 0', fontSize: 'var(--fs-sm)' }}>
                          O dono da sala escolhe o modo.
                        </p>
                      </div>
                    )}
                  </div>

                  {!privateRoomOpponent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                    <a
                      className="btn btn-primary btn-md"
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Vem jogar um duelo de inglês comigo no Wordly! 🎮🇺🇸\nEntra por este link: ${window.location.origin}/who-knows-more?room=${createdRoomCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#25D366', borderColor: '#25D366', color: '#fff', textDecoration: 'none' }}
                    >
                      📲 Convidar via WhatsApp
                    </a>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/who-knows-more?room=${createdRoomCode}`);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2500);
                      }}
                    >
                      {linkCopied ? '✅ Link Copiado!' : '📋 Copiar Link Direto'}
                    </button>
                  </div>
                  )}

                  <button
                    className={`btn ${privateRoomReady ? 'btn-success' : 'btn-primary'} btn-lg`}
                    style={{ width: '100%' }}
                    disabled={!privateRoom || (!privateRoomOpponent && !privateRoomIsHost)}
                    onClick={() => duel.setPrivateRoomReady(privateRoom.roomCode, !privateRoomReady)}
                  >
                    {privateRoomReady ? '✅ Pronto' : '✅ Marcar como pronto'}
                  </button>
                </div>
              )}

              {privateRoomMode === 'join' && (
                <div>
                  <h3 style={{ marginBottom: 'var(--space-xs)' }}>🔑 Entrar em Sala Privada</h3>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                    Digite o código de 5 dígitos recebido do seu amigo:
                  </p>
                  <input
                    type="text"
                    placeholder="Ex: AB7X2"
                    maxLength={5}
                    value={joinRoomInput}
                    onChange={e => setJoinRoomInput(e.target.value.toUpperCase())}
                    style={{
                      textAlign: 'center', fontSize: 'var(--fs-xl)', letterSpacing: '0.2em',
                      fontWeight: 800, textTransform: 'uppercase', marginBottom: 'var(--space-md)'
                    }}
                  />
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={joinRoomInput.length < 5}
                    onClick={async () => {
                      setMode('human');
                      const name = estaLogado
                        ? profile.nickname.slice(0, 20)
                        : (nicknameDraft.trim() || progress.displayName || generateGuestName()).slice(0, 20);
                      const res = await duel.joinPrivateRoom(joinRoomInput, name);
                      if (res.ok) {
                        setCreatedRoomCode(joinRoomInput.toUpperCase());
                        setPrivateRoomMode('waiting');
                      } else {
                        setPrivateRoomError(res.error);
                      }
                    }}
                  >
                    🚀 Entrar na Sala
                  </button>
                </div>
              )}

              {privateRoomError && (
                <p style={{ color: 'var(--accent-red)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-md)', fontWeight: 600 }}>
                  ⚠️ {privateRoomError}
                </p>
              )}

              <button
                className="btn btn-ghost btn-sm"
                onClick={closePrivateRoomModal}
                style={{ marginTop: 'var(--space-md)' }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {showSearchModal && (
          <div className="modal-overlay" onClick={cancelHumanSearch}>
            <div className="modal-content glass-card animate-bounce-in" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={cancelHumanSearch}
                aria-label="Fechar"
              >
                ✕
              </button>

              {duel.matchState === 'idle' && (
                <>
                  <div className="modal-icon" aria-hidden="true">🔍</div>
                  <h2 style={{ textAlign: 'center' }}>Procurar oponente</h2>

                  <div className="duel-field">
                    <label htmlFor="duel-nickname">Seu apelido</label>
                    <input
                      id="duel-nickname"
                      value={nicknameDraft}
                      onChange={(e) => setNicknameDraft(e.target.value)}
                      maxLength={20}
                      placeholder="Como quer ser chamado?"
                      disabled={estaLogado}
                      aria-describedby={estaLogado ? 'duel-nickname-locked-hint' : undefined}
                    />
                    {estaLogado && (
                      <p id="duel-nickname-locked-hint" className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: '4px' }}>
                        🔒 Você está logado — o apelido da sua conta é usado no duelo.
                      </p>
                    )}
                  </div>

                  {/* Seletor de tipo de jogo */}
                  <div className="duel-field">
                    <label>Qual jogo você quer disputar?</label>
                    <div className="game-type-selector-grid">
                      {[
                        { id: 'random',         icon: '🎲', label: 'Aleatório'      },
                        { id: 'translation',    icon: '🎯', label: 'Tradução'       },
                        { id: 'trueFalse',      icon: '✅', label: 'V ou F'         },
                        { id: 'listening',      icon: '🔊', label: 'Escuta'         },
                        { id: 'fillBlanks',     icon: '✏️', label: 'Complete'       },
                        { id: 'wordBuilder',    icon: '🔡', label: 'Montar Palavra' },
                        { id: 'sentenceBuilder',icon: '📝', label: 'Montar Frase'   },
                        { id: 'hangman',        icon: '🎯', label: 'Forca'          },
                        { id: 'memory',         icon: '🃏', label: 'Memória'        },
                      ].map(({ id, icon, label }) => {
                        const count = duel.queueByType?.[id] ?? 0;
                        return (
                          <button
                            key={id}
                            className={`game-type-btn ${humanGameTypePreference === id ? 'selected' : ''}`}
                            onClick={() => setHumanGameTypePreference(id)}
                          >
                            <span className="gt-icon">{icon}</span>
                            <span className="gt-label">{label}</span>
                            {count > 0 && (
                              <span className="gt-count">{count} aguardando</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                    <span className={`presence-pill ${connected ? '' : 'offline'}`}>
                      <span className={`pulse-dot ${connected ? '' : 'idle'}`} /> {pillLabel}
                    </span>
                  </p>

                  {duel.queueError && (
                    <p className="text-red" style={{ textAlign: 'center', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                      {duel.queueError}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={handleStartSearch} disabled={!connected}>
                      {searchButtonLabel}
                    </button>
                    <button className="btn btn-ghost" onClick={cancelHumanSearch}>Cancelar</button>
                  </div>
                </>
              )}

              {duel.matchState === 'searching' && (
                <div style={{ textAlign: 'center' }}>
                  <span className="spinner spinner-lg" />
                  <h2>Procurando oponente…</h2>
                  <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
                    {humanGameTypePreference === 'random'
                      ? 'Modo: Aleatório 🎲'
                      : `Modo: ${humanGameTypePreference}`}
                  </p>
                  <p className="text-secondary">{pillLabel}</p>
                  <button className="btn btn-ghost" style={{ marginTop: 'var(--space-md)' }} onClick={cancelHumanSearch}>
                    Cancelar busca
                  </button>
                </div>
              )}


              {duel.matchState === 'matched' && (
                <div style={{ textAlign: 'center' }}>
                  <div className="modal-icon" aria-hidden="true">⚔️</div>
                  <h2>Oponente encontrado!</h2>
                  <p className="text-secondary">
                    Você vai duelar contra <strong>{duel.opponent?.nickname}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showBotSetupModal && (
          <div className="modal-overlay" onClick={() => setShowBotSetupModal(false)}>
            <div className="modal-content glass-card animate-bounce-in setup-modal-box" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowBotSetupModal(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
              <div className="modal-icon" aria-hidden="true">⚙️</div>
              <h2 style={{ textAlign: 'center' }}>Duelo contra o Bot</h2>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', margin: 'var(--space-sm) 0 var(--space-lg)', textAlign: 'center' }}>
                Escolha o jogo e o nível de desafio da IA:
              </p>

              <div className="setup-group">
                <label className="setup-label">🎮 Jogo do duelo</label>
                <div className="setup-options-grid-scroll">
                  {GAME_TYPES.map((gt) => (
                    <div
                      key={gt.id}
                      className={`setup-option-card ${selectedGameType === gt.id ? 'selected' : ''}`}
                      onClick={() => setSelectedGameType(gt.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{gt.icon}</span>
                        <div>
                          <strong>{gt.name}</strong>
                          <span>{gt.desc}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="setup-group" style={{ marginTop: 'var(--space-lg)' }}>
                <label className="setup-label">🤖 Dificuldade do Bot</label>
                <div className="diff-pills-row">
                  {BOT_DIFFICULTIES.map((diff) => (
                    <button
                      key={diff.id}
                      className={`diff-pill ${selectedDifficulty === diff.id ? 'active' : ''}`}
                      onClick={() => setSelectedDifficulty(diff.id)}
                    >
                      {diff.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-success btn-lg"
                style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                onClick={startBotGame}
              >
                ⚔️ Iniciar Duelo
              </button>
            </div>
          </div>
        )}

        {showFullRankingModal && (
          <div className="modal-overlay" onClick={() => setShowFullRankingModal(false)}>
            <div className="modal-content glass-card animate-bounce-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFullRankingModal(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
              <div className="modal-icon" aria-hidden="true">🏆</div>
              <h2 style={{ textAlign: 'center' }}>Ranking Completo</h2>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                Troféus deste mês
              </p>

              {fullLeaderboardStatus === 'loading' && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>Carregando…</p>
              )}
              {fullLeaderboardStatus === 'error' && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                  Não foi possível carregar o ranking agora.
                </p>
              )}
              {fullLeaderboardStatus === 'loaded' && fullLeaderboard.length === 0 && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                  {vazioPorFaltaDeDuelo
                    ? `O duelo ao vivo ainda só existe em Inglês — o ranking de troféus em ${nomeDoIdioma} começa quando ele chegar.`
                    : 'Ninguém no ranking ainda este mês.'}
                </p>
              )}
              {fullLeaderboardStatus === 'loaded' && fullLeaderboard.length > 0 && (
                <div className="ranked-list" style={{ maxHeight: '50vh', overflowY: 'auto', overflowX: 'hidden' }}>
                  {fullLeaderboard.map((entry, i) => {
                    const levelObj = getCurrentLevel(entry.wordsStudied || 0, cursoAtivo);
                    const title = getUserTitle(levelObj?.level || 1);
                    return (
                    <div key={`${entry.nickname}-${i}`} className={`ranked-item rank-pos-${i + 1}`}>
                      <div className="ranked-position-col">
                        <span className={`ranked-position-num pos-${i + 1}`}>#{i + 1}</span>
                      </div>

                      <div className="ranked-player-col">
                        <AvatarDisplay avatar={entry.avatar || '👤'} size="sm" />
                        <div className="ranked-player-details">
                          <span className="ranked-player-name">{entry.nickname}</span>
                          <span className="ranked-player-tag">
                            <span className={rankedTitleClass(entry.selectedTitle)}>{title.tag}</span>
                          </span>
                        </div>
                      </div>

                      <div className="ranked-score-col">
                        <div className="ranked-score-main">
                          <span className="ranked-trophy">🏆</span>
                          <strong>{entry.trophies}</strong> <small>troféus</small>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              {estaLogado && myRank?.rank && (
                <p className="text-secondary" style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: 'var(--fs-sm)' }}>
                  Sua posição: <strong>#{myRank.rank}</strong> • 🏆 {myRank.trophies}
                </p>
              )}
            </div>
          </div>
        )}

        {showFullLevelModal && (
          <div className="modal-overlay" onClick={() => setShowFullLevelModal(false)}>
            <div className="modal-content glass-card animate-bounce-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFullLevelModal(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
              <div className="modal-icon" aria-hidden="true">🎓</div>
              <h2 style={{ textAlign: 'center' }}>Ranking Completo</h2>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                Top níveis
              </p>

              {fullLevelLeaderboardStatus === 'loading' && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>Carregando…</p>
              )}
              {fullLevelLeaderboardStatus === 'error' && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                  Não foi possível carregar o ranking agora.
                </p>
              )}
              {fullLevelLeaderboardStatus === 'loaded' && fullLevelLeaderboard.length === 0 && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                  Ninguém no ranking de {nomeDoIdioma} ainda.
                </p>
              )}
              {fullLevelLeaderboardStatus === 'loaded' && fullLevelLeaderboard.length > 0 && (
                <div className="ranked-list" style={{ maxHeight: '50vh', overflowY: 'auto', overflowX: 'hidden' }}>
                  {fullLevelLeaderboard.map((entry, i) => {
                    const levelObj = getCurrentLevel(entry.wordsStudied || 0, cursoAtivo);
                    const title = getUserTitle(levelObj?.level || 1);
                    return (
                    <div key={`${entry.nickname}-${i}`} className={`ranked-item rank-pos-${i + 1}`}>
                      <div className="ranked-position-col">
                        <span className={`ranked-position-num pos-${i + 1}`}>#{i + 1}</span>
                      </div>

                      <div className="ranked-player-col">
                        <AvatarDisplay avatar={entry.avatar || '👤'} size="sm" />
                        <div className="ranked-player-details">
                          <span className="ranked-player-name">{entry.nickname}</span>
                          <span className="ranked-player-tag">
                            <span className={rankedTitleClass(entry.selectedTitle)}>{title.tag}</span>
                          </span>
                        </div>
                      </div>

                      <div className="ranked-score-col">
                        <div className="ranked-score-main">
                          <span className="ranked-trophy">🎓</span>
                          <strong>{levelObj?.level || 1}</strong> <small>nível</small>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoKnowsMore;
