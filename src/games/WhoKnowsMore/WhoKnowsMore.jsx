import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import { useDuelSocket } from '../../hooks/useDuelSocket';
import { usePresence } from '../../hooks/usePresence';
import { getRandomWords, shuffleArray, words } from '../../data/words';
import { msLeft, secondsLeft, barWidthPct } from '../../utils/duelClock';
import { rewardFor, isRewarded } from '../../utils/duelReward';
import { presenceLabel } from '../../utils/presenceLabel';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
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

const generateGuestName = () => `Aluno${Math.floor(1000 + Math.random() * 9000)}`;

// Normaliza a pergunta que vem do servidor para o mesmo formato que o modo Bot
// usa, para o JSX da partida servir aos dois modos. Nunca traz correctAnswer: o
// servidor só revela quando a rodada fecha.
const toDisplayQuestion = (q) => {
  if (!q) return null;
  const { type, prompt, options } = q;
  switch (type) {
    case 'trueFalse':
      return { type, word: { en: prompt.en, pronunciation: prompt.pronunciation }, displayedPt: prompt.displayedPt, options };
    case 'wordBuilder':
      return { type, word: { pt: prompt.ptHint }, scrambledText: prompt.scrambledText, options };
    case 'sentenceBuilder':
      return { type, word: { example: prompt.exampleEn }, options };
    case 'fillBlanks':
      return { type, word: { examplePt: prompt.examplePt }, blankedSentence: prompt.blankedSentence, options };
    case 'hangman':
      return { type, word: { tip: prompt.tip }, options };
    default: // translation, listening, memory
      return { type, word: { en: prompt.en, pronunciation: prompt.pronunciation }, options };
  }
};

const WhoKnowsMore = () => {
  // O app tem uma moeda só (estrelas = totalScore, a mesma da Loja).
  const { progress, addPoints, completeGame, setDisplayName } = useProgress();
  const { playCorrect, playWrong, playAchievement } = useSound();
  const { speakNormal, speakSlow } = useSpeech();

  const duel = useDuelSocket();
  // "Quantas pessoas no site" vem do heartbeat HTTP (vale em toda página);
  // "quantas procurando duelo" vem do socket, que só existe nesta tela.
  const presence = usePresence();

  // 'bot' | 'human'
  const [mode, setMode] = useState('bot');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showBotSetupModal, setShowBotSetupModal] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  const [nicknameDraft, setNicknameDraft] = useState('');
  const [selectedGameType, setSelectedGameType] = useState('translation');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  const [botConfig, setBotConfig] = useState(BOT_DIFFICULTIES[1]);
  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [earnedBonus, setEarnedBonus] = useState(0);

  const [roundQuestions, setRoundQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
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

  const isHuman = mode === 'human';

  // ============ MODO BOT (inalterado no comportamento) ============

  const openBotSetup = () => {
    // NÃO mexe em `mode` aqui. Antes mexia, e isso corrompia a tela de
    // resultado: mudar para 'bot' fazia a tela relê o placar do Bot (0 a 0) e
    // reescrever uma vitória como "Empate 0 pts vs 0 pts".
    setShowBotSetupModal(true);
  };

  const startBotGame = () => {
    setShowBotSetupModal(false);
    setMode('bot');

    const diffObj = BOT_DIFFICULTIES.find(d => d.id === selectedDifficulty) || BOT_DIFFICULTIES[1];
    setBotConfig(diffObj);

    const selectedWords = getRandomWords(TOTAL_ROUNDS);
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
          const wrongWords = shuffleArray(otherWords).slice(0, 3).map(w => w.en);
          return {
            type: 'wordBuilder', word: wordObj, scrambledText: scrambled,
            correctAnswer: wordObj.en,
            options: shuffleArray([wordObj.en, ...wrongWords]),
          };
        }
        case 'sentenceBuilder': {
          const wrongSentences = shuffleArray(otherWords.filter(w => w.examplePt)).slice(0, 3).map(w => w.examplePt);
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
          const wrongChoices = shuffleArray(otherWords).slice(0, 3).map(w => w.en);
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

    setRoundQuestions(questions);
    setCurrentRound(0);
    setPlayerScore(0);
    setBotScore(0);
    setEarnedBonus(0);
    setGameState('playing');
    setupRound(0, questions, diffObj);
  };

  const setupRound = (roundIdx, questionsList = roundQuestions, currentBotConfig = botConfig) => {
    const q = questionsList[roundIdx];
    setCurrentQuestion(q);
    setPlayerAnswered(false);
    setPlayerChoice(null);
    setBotAnswered(false);
    setBotChoice(null);
    setBotIsCorrect(false);
    setTimeLeft(10);

    if (q.type === 'listening') speakRef.current(q.word.en);

    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);

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
    setNicknameDraft(progress.displayName || generateGuestName());
    setShowSearchModal(true);
  };

  const handleStartSearch = () => {
    const name = (nicknameDraft.trim() || generateGuestName()).slice(0, 20);
    setNicknameDraft(name);
    setDisplayName(name);
    duel.joinQueue(name);
  };

  const cancelHumanSearch = () => {
    duel.leaveQueue();
    setShowSearchModal(false);
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
    if (duel.matchState === 'playing') {
      setShowSearchModal(false);
      setGameState('playing');
    } else if (duel.matchState === 'ended' || duel.matchState === 'lost') {
      setGameState('gameover');
    }
  }, [isHuman, duel.matchState]);

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
  const activeQuestion = isHuman ? toDisplayQuestion(duel.question) : currentQuestion;
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

  return (
    <div className="who-knows-more-page page">
      <div className="container">
        {/* ================= LOBBY ================= */}
        {gameState === 'lobby' && (
          <div className="lobby-container animate-fade-in-up">
            <div className="lobby-header">
              <span className="badge badge-purple">⚔️ MODO DUELO</span>
              <h1>Quem Sabe Mais?</h1>
              <p className="text-secondary">
                Dispute contra outra pessoa ao vivo, ou personalize seu duelo contra o Bot com <strong>todos os 8 jogos</strong> do EnglishPlay!
              </p>
            </div>

            <div className="mode-selection-grid">
              {/* HUMANO */}
              <div className="mode-card mode-card--human glass-card" onClick={connected ? openHumanSearch : undefined}>
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
                  disabled={!connected}
                >
                  {searchButtonLabel}
                </button>
                {!connected && (
                  <p className="presence-note">O modo Bot funciona sem servidor.</p>
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
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
              <Link to="/games" className="btn btn-ghost">← Voltar para Todos os Jogos</Link>
            </div>
          </div>
        )}

        {/* ================= PARTIDA ================= */}
        {gameState === 'playing' && activeQuestion && !matchLost && (
          <div className="duel-match-container animate-fade-in-up">
            {/* Saída — antes esta tela não tinha nenhuma forma de sair, então
                uma partida travada só saía navegando pelo navegador. */}
            <div className="duel-topbar">
              {confirmExit ? (
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                  <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>
                    Sair? A partida será perdida.
                  </span>
                  <button className="btn btn-danger btn-sm" onClick={handleExitDuel}>Sair</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmExit(false)}>Ficar</button>
                </div>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmExit(true)}>✕ Sair da partida</button>
              )}
            </div>

            <div className="duel-scoreboard glass-card">
              <div className="player-profile player-profile--you">
                <div className="avatar" aria-hidden="true">{progress.selectedAvatar || '👤'}</div>
                <div className="profile-info">
                  <span className="profile-name">Você</span>
                  <span className="profile-score">{myScoreDisplay} pts</span>
                </div>
              </div>

              <div className="vs-badge">
                <span>VS</span>
                <small>Rodada {roundIndexDisplay + 1}/{totalRoundsDisplay}</small>
              </div>

              <div className="player-profile player-profile--opponent">
                <div className="avatar" aria-hidden="true">{isHuman ? '🧑' : '🤖'}</div>
                <div className="profile-info">
                  <span className="profile-name">{opponentName}</span>
                  <span className="profile-score">{opponentScoreDisplay} pts</span>
                </div>
              </div>
            </div>

            <div className="timer-bar-container">
              <div
                className={`timer-bar-fill ${timeLeftDisplay <= 3 ? 'urgent' : ''}`}
                style={{ width: `${barWidthPct(remainingMs, roundMsDisplay)}%` }}
              />
              <span className="timer-text">⏱️ {timeLeftDisplay}s</span>
            </div>

            <div className="question-card glass-card">
              {activeQuestion.type === 'translation' && (
                <>
                  <span className="question-label">🎯 Qual é a tradução de:</span>
                  <h2 className="target-word">{activeQuestion.word.en}</h2>
                  <span className="pronunciation">{activeQuestion.word.pronunciation}</span>
                </>
              )}

              {activeQuestion.type === 'trueFalse' && (
                <>
                  <span className="question-label">✅ Esta tradução está correta?</span>
                  <h2 className="target-word">{activeQuestion.word.en}</h2>
                  <span className="duel-hint">= “{activeQuestion.displayedPt}”</span>
                </>
              )}

              {activeQuestion.type === 'listening' && (
                <>
                  <span className="question-label">🎧 Ouça e identifique a palavra:</span>
                  <div className="listening-controls">
                    <button className="btn btn-primary btn-lg" onClick={() => speakNormal(activeQuestion.word.en)}>
                      🔊 Ouvir em Inglês
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => speakSlow(activeQuestion.word.en)}>
                      🐢 Devagar
                    </button>
                  </div>
                </>
              )}

              {activeQuestion.type === 'wordBuilder' && (
                <>
                  <span className="question-label">🔤 Que palavra se forma com estas letras?</span>
                  <h2 className="target-word" style={{ letterSpacing: '4px' }}>{activeQuestion.scrambledText}</h2>
                  <span className="duel-hint">Dica: {activeQuestion.word.pt}</span>
                </>
              )}

              {activeQuestion.type === 'sentenceBuilder' && (
                <>
                  <span className="question-label">📝 Escolha a tradução exata da frase:</span>
                  <h3 className="target-word" style={{ fontSize: 'var(--fs-2xl)' }}>“{activeQuestion.word.example}”</h3>
                </>
              )}

              {activeQuestion.type === 'fillBlanks' && (
                <>
                  <span className="question-label">✏️ Que palavra preenche a lacuna?</span>
                  <h3 className="target-word" style={{ fontSize: 'var(--fs-2xl)' }}>“{activeQuestion.blankedSentence}”</h3>
                  <span className="duel-hint">Tradução: {activeQuestion.word.examplePt}</span>
                </>
              )}

              {activeQuestion.type === 'hangman' && (
                <>
                  <span className="question-label">🎯 Descubra a palavra pela dica:</span>
                  <p className="duel-tip">“{activeQuestion.word.tip}”</p>
                  <span className="duel-hint">Qual é a palavra em inglês?</span>
                </>
              )}

              {activeQuestion.type === 'memory' && (
                <>
                  <span className="question-label">🃏 Encontre o par correspondente:</span>
                  <h2 className="target-word">{activeQuestion.word.en}</h2>
                  <span className="pronunciation">{activeQuestion.word.pronunciation}</span>
                </>
              )}
            </div>

            <div className={`options-grid ${activeQuestion.type === 'trueFalse' ? 'tf-grid' : ''}`}>
              {activeQuestion.options.map((option, idx) => {
                let statusClass = '';
                if (revealedAnswer != null) {
                  if (option === revealedAnswer) statusClass = 'correct';
                  else if (option === (isHuman ? myChoice : playerChoice)) statusClass = 'incorrect';
                } else if (isHuman && option === myChoice) {
                  statusClass = 'pending';
                }
                const tfClass = activeQuestion.type === 'trueFalse'
                  ? (option === 'Verdadeiro' ? 'tf-true' : 'tf-false')
                  : '';

                return (
                  <button
                    key={idx}
                    className={`option-btn ${statusClass} ${tfClass}`}
                    onClick={() => (isHuman ? handleHumanChoice(option) : handlePlayerChoice(option))}
                    disabled={hasAnswered || timeLeftDisplay === 0}
                  >
                    <span className="option-letter" aria-hidden="true">
                      {activeQuestion.type === 'trueFalse'
                        ? (option === 'Verdadeiro' ? '✅' : '❌')
                        : String.fromCharCode(65 + idx)}
                    </span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>

            {duel.answerError && isHuman && (
              <p className="text-red" style={{ textAlign: 'center', fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                {duel.answerError}
              </p>
            )}

            <div className="duel-status-bar glass-card">
              {isHuman ? (
                duel.roundResult ? (
                  (() => {
                    const opp = duel.roundResult.answers.find(a => a.id === duel.opponent?.id);
                    return (
                      <div className="opponent-response animate-bounce-in">
                        <span>{opponentName} respondeu:</span>
                        <strong className={opp?.correct ? 'text-green' : 'text-red'}>
                          {opp?.choice ?? '(sem resposta)'} {opp?.correct ? `✅ +${opp.pointsEarned}` : '❌'}
                        </strong>
                      </div>
                    );
                  })()
                ) : (
                  <div className="opponent-thinking">
                    <span className="spinner" />
                    <span>Aguardando {opponentName}…</span>
                  </div>
                )
              ) : botAnswered ? (
                <div className="opponent-response animate-bounce-in">
                  <span>{botConfig.name} respondeu:</span>
                  <strong className={botIsCorrect ? 'text-green' : 'text-red'}>
                    {botChoice} {botIsCorrect ? '✅ +100' : '❌'}
                  </strong>
                </div>
              ) : (
                <div className="opponent-thinking">
                  <span className="spinner" />
                  <span>{botConfig.name} está pensando…</span>
                </div>
              )}
            </div>
          </div>
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
              {/* Repete o MESMO modo com as MESMAS configurações. Antes este
                  botão abria um modal que não conseguia montar deste estado e,
                  de quebra, reescrevia o resultado como empate 0 a 0. */}
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (isHuman) { duel.resetMatch(); openHumanSearch(); }
                  else startBotGame();
                }}
              >
                🔁 Jogar Novamente
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

        {/* ============ MODAIS ============
            Fora de qualquer bloco de gameState, de propósito: antes viviam
            dentro do bloco do lobby, então qualquer tentativa de abri-los a
            partir da tela de resultado simplesmente não montava nada. */}
        {showSearchModal && (
          <div className="modal-overlay" onClick={cancelHumanSearch}>
            <div className="modal-content glass-card animate-bounce-in" onClick={(e) => e.stopPropagation()}>
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
                    />
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
                  <span className="spinner searching-spinner" style={{ width: 40, height: 40, borderWidth: 3, display: 'block', margin: '0 auto var(--space-md)' }} />
                  <h2>Procurando oponente…</h2>
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
      </div>
    </div>
  );
};

export default WhoKnowsMore;
