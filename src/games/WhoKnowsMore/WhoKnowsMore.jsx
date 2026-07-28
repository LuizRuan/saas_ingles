import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import { useDuelSocket } from '../../hooks/useDuelSocket';
import { getRandomWords, shuffleArray, words } from '../../data/words';
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
  { id: 'sentenceBuilder', icon: '📝', name: 'Montar Frases', desc: 'Identifique a tradução e ordem exata das frases' },
  { id: 'fillBlanks', icon: '✏️', name: 'Completar Frases', desc: 'Preencha a palavra que falta na frase em inglês' },
  { id: 'hangman', icon: '🎯', name: 'Jogo da Forca (Dica em Inglês)', desc: 'Descubra a palavra a partir da dica científica' },
  { id: 'memory', icon: '🃏', name: 'Jogo da Memória (Duelo)', desc: 'Encontre o par de significado correto o mais rápido possível' },
];

const generateGuestName = () => `Aluno${Math.floor(1000 + Math.random() * 9000)}`;

// Reshapea a pergunta que vem do servidor (backend/realtime/questionGenerator.js)
// para o mesmo formato { type, word: {...}, options, ... } que o modo Bot já
// usa — assim o JSX de "playing" é um só para os dois modos. Nunca inclui
// correctAnswer: o servidor não manda isso até a rodada fechar.
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
  // O app tem uma moeda só (estrelas = totalScore, a mesma da Loja) — addCoins
  // e addXp não existem em useProgress e derrubavam o app inteiro (sem Error
  // Boundary) toda vez que uma partida terminava.
  const { progress, addPoints, completeGame, setDisplayName } = useProgress();
  const { playCorrect, playWrong, playAchievement } = useSound();
  const { speakNormal, speakSlow } = useSpeech();

  // 'bot' | 'human' — qual dos dois modos está ativo agora. O modo Bot
  // continua 100% como antes; isto só decide qual fonte de dados o JSX
  // compartilhado de "playing"/"gameover" lê.
  const [mode, setMode] = useState('bot');

  // Conecta assim que a tela monta (não atrás de clique nenhum) — é o que
  // faz o contador de gente online aparecer na hora.
  const duel = useDuelSocket();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [myChoice, setMyChoice] = useState(null);
  const [humanTimeLeft, setHumanTimeLeft] = useState(10);
  const humanTimerRef = useRef(null);

  // Mode selection state: 'lobby' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('lobby');
  const [showBotSetupModal, setShowBotSetupModal] = useState(false);

  // Bot Config State
  const [selectedGameType, setSelectedGameType] = useState('translation');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  // Match state
  const [botConfig, setBotConfig] = useState(BOT_DIFFICULTIES[1]);
  const [currentRound, setCurrentRound] = useState(0);
  const TOTAL_ROUNDS = 5;

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
  const timerRef = useRef(null);
  const botTimerRef = useRef(null);

  // Open setup modal
  const openBotSetup = () => {
    setMode('bot');
    setShowBotSetupModal(true);
  };

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

  // Prepare game questions based on selected mode and difficulty
  const startBotGame = () => {
    setShowBotSetupModal(false);

    const diffObj = BOT_DIFFICULTIES.find(d => d.id === selectedDifficulty) || BOT_DIFFICULTIES[1];
    setBotConfig(diffObj);

    // Pick 5 random words for 5 rounds
    const selectedWords = getRandomWords(TOTAL_ROUNDS);

    const questions = selectedWords.map((wordObj) => {
      const otherWords = words.filter(w => w.en !== wordObj.en);

      switch (selectedGameType) {
        case 'trueFalse': {
          const isTrue = Math.random() < 0.5;
          let displayedPt = wordObj.pt;
          if (!isTrue) {
            displayedPt = otherWords[Math.floor(Math.random() * otherWords.length)].pt;
          }
          return {
            type: 'trueFalse',
            word: wordObj,
            displayedPt: displayedPt,
            correctAnswer: isTrue ? 'Verdadeiro' : 'Falso',
            options: ['Verdadeiro', 'Falso'],
          };
        }

        case 'wordBuilder': {
          // Scramble letters
          const letters = wordObj.en.toUpperCase().split('');
          let scrambled = shuffleArray([...letters]).join(' ');
          if (scrambled === letters.join(' ') && letters.length > 1) {
            scrambled = letters.reverse().join(' ');
          }
          const wrongWords = shuffleArray(otherWords).slice(0, 3).map(w => w.en);
          const allOptions = shuffleArray([wordObj.en, ...wrongWords]);
          return {
            type: 'wordBuilder',
            word: wordObj,
            scrambledText: scrambled,
            correctAnswer: wordObj.en,
            options: allOptions,
          };
        }

        case 'sentenceBuilder': {
          const wrongSentences = shuffleArray(otherWords)
            .filter(w => w.examplePt)
            .slice(0, 3)
            .map(w => w.examplePt);
          const allOptions = shuffleArray([wordObj.examplePt, ...wrongSentences]);
          return {
            type: 'sentenceBuilder',
            word: wordObj,
            correctAnswer: wordObj.examplePt,
            options: allOptions,
          };
        }

        case 'fillBlanks': {
          // Replace word in example sentence with ___
          const regex = new RegExp(`\\b${wordObj.en}\\b`, 'gi');
          let blanked = wordObj.example.replace(regex, '_______');
          if (blanked === wordObj.example) {
            // fallback if exact match wasn't replaced
            const firstWord = wordObj.en.split(' ')[0];
            blanked = wordObj.example.replace(new RegExp(firstWord, 'gi'), '_______');
          }
          const wrongChoices = shuffleArray(otherWords).slice(0, 3).map(w => w.en);
          const allOptions = shuffleArray([wordObj.en, ...wrongChoices]);
          return {
            type: 'fillBlanks',
            word: wordObj,
            blankedSentence: blanked,
            correctAnswer: wordObj.en,
            options: allOptions,
          };
        }

        case 'hangman': {
          const wrongChoices = shuffleArray(otherWords).slice(0, 3).map(w => w.en);
          const allOptions = shuffleArray([wordObj.en, ...wrongChoices]);
          return {
            type: 'hangman',
            word: wordObj,
            correctAnswer: wordObj.en,
            options: allOptions,
          };
        }

        case 'memory': {
          const wrongChoices = shuffleArray(otherWords).slice(0, 3).map(w => w.pt);
          const allOptions = shuffleArray([wordObj.pt, ...wrongChoices]);
          return {
            type: 'memory',
            word: wordObj,
            correctAnswer: wordObj.pt,
            options: allOptions,
          };
        }

        case 'listening':
        case 'translation':
        default: {
          const wrongOptions = shuffleArray(otherWords).slice(0, 3).map(w => w.pt);
          const allChoices = shuffleArray([wordObj.pt, ...wrongOptions]);
          return {
            type: selectedGameType,
            word: wordObj,
            correctAnswer: wordObj.pt,
            options: allChoices,
          };
        }
      }
    });

    setRoundQuestions(questions);
    setCurrentRound(0);
    setPlayerScore(0);
    setBotScore(0);
    setGameState('playing');
    setupRound(0, questions, diffObj);
  };

  const setupRound = (roundIndex, questionsList = roundQuestions, currentBotConfig = botConfig) => {
    const q = questionsList[roundIndex];
    setCurrentQuestion(q);

    setPlayerAnswered(false);
    setPlayerChoice(null);
    setBotAnswered(false);
    setBotChoice(null);
    setBotIsCorrect(false);
    setTimeLeft(10);

    // If Listening mode, auto play speech
    if (q.type === 'listening') {
      speakNormal(q.word.en);
    }

    // Clear previous timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    // Start 10s round timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule Bot's answer based on selected difficulty
    const delayRange = currentBotConfig.maxDelay - currentBotConfig.minDelay;
    const botDelay = Math.floor(Math.random() * delayRange) + currentBotConfig.minDelay;

    botTimerRef.current = setTimeout(() => {
      triggerBotAnswer(q, currentBotConfig);
    }, botDelay);
  };

  const triggerBotAnswer = (q, currentBotConfig) => {
    if (!q) return;

    // Bot accuracy based on difficulty
    const isCorrect = Math.random() < currentBotConfig.accuracy;
    let chosen = q.correctAnswer;

    if (!isCorrect) {
      const wrongChoices = q.options.filter(opt => opt !== q.correctAnswer);
      chosen = wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || q.correctAnswer;
    }

    setBotAnswered(true);
    setBotChoice(chosen);
    setBotIsCorrect(isCorrect);

    if (isCorrect) {
      setBotScore((prev) => prev + 100);
    }
  };

  const handlePlayerChoice = (option) => {
    if (playerAnswered || !currentQuestion) return;

    setPlayerAnswered(true);
    setPlayerChoice(option);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      playCorrect();
      const speedBonus = timeLeft * 10;
      setPlayerScore((prev) => prev + 100 + speedBonus);
    } else {
      playWrong();
    }
  };

  const handleTimeOut = () => {
    setPlayerAnswered(true);
  };

  // Next round or end game when both have answered or timer finishes
  useEffect(() => {
    if (gameState !== 'playing' || mode !== 'bot') return;

    if (playerAnswered && (botAnswered || timeLeft === 0)) {
      const timeout = setTimeout(() => {
        if (currentRound + 1 < TOTAL_ROUNDS) {
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          setupRound(nextRound);
        } else {
          finishGame();
        }
      }, 2200);

      return () => clearTimeout(timeout);
    }
  }, [playerAnswered, botAnswered, timeLeft, gameState, currentRound, mode]);

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimerRef.current) clearTimeout(botTimerRef.current);

    setGameState('gameover');
    // completeGame já soma o bônus padrão de conclusão de fase (POINTS.PHASE_COMPLETION);
    // isto aqui é só o extra por vencer ou empatar o duelo.
    const bonusPoints = playerScore > botScore ? 30 : playerScore === botScore ? 15 : 10;
    setEarnedBonus(bonusPoints);
    completeGame('whoKnowsMore');
    addPoints(bonusPoints);

    if (playerScore > botScore) {
      playAchievement();
    } else if (playerScore === botScore) {
      playCorrect();
    } else {
      playWrong();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  // ================= MODO HUMANO =================

  // Segue o estado da fila/partida do servidor e reflete no estado
  // compartilhado gameState/showSearchModal — o servidor manda quem sabe
  // quando cada coisa acontece, este componente só escuta.
  useEffect(() => {
    if (mode !== 'human') return;
    if (duel.matchState === 'playing') {
      setShowSearchModal(false);
      setGameState('playing');
    } else if (duel.matchState === 'ended') {
      setGameState('gameover');
    }
  }, [mode, duel.matchState]);

  // Nova rodada chegou: limpa a escolha da rodada anterior e toca o áudio se
  // for Listening — mesma responsabilidade que setupRound tem no modo Bot.
  useEffect(() => {
    if (mode !== 'human' || !duel.question) return;
    setMyChoice(null);
    if (duel.question.type === 'listening') speakNormal(duel.question.prompt.en);
  }, [mode, duel.question, speakNormal]);

  // Cronômetro do modo humano: conta a partir do roundDeadline que o
  // SERVIDOR definiu, nunca um timer local independente — é assim que os
  // dois jogadores veem o mesmo tempo restante.
  useEffect(() => {
    if (mode !== 'human' || !duel.roundDeadline || gameState !== 'playing') return;
    const tick = () => setHumanTimeLeft(Math.max(0, Math.ceil((duel.roundDeadline - Date.now()) / 1000)));
    tick();
    humanTimerRef.current = setInterval(tick, 250);
    return () => clearInterval(humanTimerRef.current);
  }, [mode, duel.roundDeadline, gameState]);

  // Som de acerto/erro da rodada, assim que o servidor revela o resultado
  useEffect(() => {
    if (mode !== 'human' || !duel.roundResult) return;
    const mine = duel.roundResult.answers.find(a => a.id === duel.myId);
    if (mine?.correct) playCorrect(); else playWrong();
  }, [mode, duel.roundResult, duel.myId, playCorrect, playWrong]);

  // Fim de partida: mesma recompensa (estrelas) do modo Bot, decidida pelo
  // placar que o SERVIDOR calculou — nunca um valor que este cliente inventou.
  useEffect(() => {
    if (mode !== 'human' || !duel.matchEnd) return;
    const iWon = duel.matchEnd.winnerId === duel.myId;
    const tie = duel.matchEnd.winnerId === null && duel.matchEnd.reason !== 'opponent_left';
    const bonus = (iWon || duel.matchEnd.reason === 'opponent_left') ? 30 : tie ? 15 : 10;
    setEarnedBonus(bonus);
    completeGame('whoKnowsMore');
    addPoints(bonus);
    if (iWon || duel.matchEnd.reason === 'opponent_left') playAchievement();
    else if (tie) playCorrect();
    else playWrong();
  }, [mode, duel.matchEnd, duel.myId, completeGame, addPoints, playAchievement, playCorrect, playWrong]);

  const handleHumanChoice = (option) => {
    if (myChoice !== null || humanTimeLeft === 0) return;
    setMyChoice(option);
    duel.submitAnswer(option);
  };

  const returnToLobby = () => {
    if (mode === 'human') duel.resetMatch();
    setMode('bot');
    setGameState('lobby');
  };

  // ================= VALORES DERIVADOS PARA O JSX COMPARTILHADO =================
  const isHuman = mode === 'human';
  const activeQuestion = isHuman ? toDisplayQuestion(duel.question) : currentQuestion;
  const timeLeftDisplay = isHuman ? humanTimeLeft : timeLeft;
  const roundIndexDisplay = isHuman ? duel.roundIndex : currentRound;
  const totalRoundsDisplay = isHuman ? duel.totalRounds : TOTAL_ROUNDS;
  const myScoreDisplay = isHuman ? (duel.scores[duel.myId] || 0) : playerScore;
  const opponentScoreDisplay = isHuman ? (duel.opponent ? (duel.scores[duel.opponent.id] || 0) : 0) : botScore;
  const opponentName = isHuman ? (duel.opponent?.nickname || 'Oponente') : botConfig.name;
  const hasAnswered = isHuman ? myChoice !== null : playerAnswered;
  const revealedAnswer = isHuman ? (duel.roundResult?.correctAnswer ?? null) : (playerAnswered ? currentQuestion?.correctAnswer : null);

  return (
    <div className="who-knows-more-page page">
      <div className="container">
        {/* ================= LOBBY STATE ================= */}
        {gameState === 'lobby' && (
          <div className="lobby-container animate-fade-in-up">
            <div className="lobby-header">
              <span className="lobby-badge">⚔️ MODO DUELO ONLINE</span>
              <h1>Quem Sabe Mais?</h1>
              <p className="text-secondary">
                Este modo é online! Desafie outros estudantes de inglês em tempo real ou personalize seu duelo contra o Bot com <strong>todos os 8 jogos</strong> do EnglishPlay!
              </p>
            </div>

            <div className="mode-selection-grid">
              {/* HUMANO — duelo real, com matchmaking de verdade */}
              <div
                className="mode-card human-mode glass-card active-card"
                onClick={openHumanSearch}
              >
                <div className="mode-badge online-count-pill">
                  <span className="pulse-dot" /> {duel.onlineCount} online agora
                </div>
                <div className="mode-icon">👥</div>
                <h3>Jogar com Humano</h3>
                <p>Enfrente outros alunos da comunidade ao vivo em tempo real. Quem responder mais rápido vence!</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                  🔍 Procurar Oponente
                </button>
              </div>

              {/* BOT (CONFIGURÁVEL COM TODOS OS JOGOS) */}
              <div
                className="mode-card bot-mode glass-card active-card"
                onClick={openBotSetup}
              >
                <div className="mode-badge badge-green">8 Jogos Disponíveis 🎮</div>
                <div className="mode-icon">🤖</div>
                <h3>Jogar com Bot (IA)</h3>
                <p>Escolha qual dos 8 jogos da plataforma deseja disputar e selecione a dificuldade da IA!</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                  ⚙️ Escolher Jogo & Duelar
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link to="/games" className="btn btn-ghost">
                ← Voltar para Todos os Jogos
              </Link>
            </div>

            {/* Modal de Busca de Oponente Humano */}
            {showSearchModal && (
              <div className="modal-overlay" onClick={cancelHumanSearch}>
                <div className="modal-content glass-card animate-bounce-in" onClick={(e) => e.stopPropagation()}>
                  {duel.matchState === 'idle' && (
                    <>
                      <div className="modal-icon">🔍</div>
                      <h2>Procurar oponente</h2>
                      <div className="form-group" style={{ textAlign: 'left', margin: '1rem 0' }}>
                        <label htmlFor="duel-nickname">Seu apelido</label>
                        <input
                          id="duel-nickname"
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(e.target.value)}
                          maxLength={20}
                          placeholder="Como quer ser chamado?"
                        />
                      </div>
                      <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: '1rem' }}>
                        <span className="pulse-dot" style={{ marginRight: 6 }} /> {duel.onlineCount} pessoa(s) online agora
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={handleStartSearch}>🔍 Procurar Oponente</button>
                        <button className="btn btn-outline" onClick={cancelHumanSearch}>Cancelar</button>
                      </div>
                    </>
                  )}

                  {duel.matchState === 'searching' && (
                    <>
                      <div className="searching-spinner spinner" />
                      <h2>Procurando oponente...</h2>
                      <p className="text-secondary">{duel.onlineCount} pessoa(s) online agora</p>
                      <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={cancelHumanSearch}>
                        Cancelar busca
                      </button>
                    </>
                  )}

                  {duel.matchState === 'matched' && (
                    <div className="match-found-banner">
                      <div className="modal-icon">⚔️</div>
                      <h2>Oponente encontrado!</h2>
                      <p className="text-secondary">Você vai duelar contra <strong>{duel.opponent?.nickname}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal de Configuração do Bot (Todos os 8 jogos) */}
            {showBotSetupModal && (
              <div className="modal-overlay" onClick={() => setShowBotSetupModal(false)}>
                <div className="modal-content glass-card animate-bounce-in setup-modal-box" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-icon">⚙️</div>
                  <h2>Configurar Duelo contra o Bot</h2>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: '1.2rem' }}>
                    Escolha qual dos 8 jogos você deseja disputar e o nível de desafio da IA:
                  </p>

                  {/* 1. Escolha de TODOS os 8 Modos de Jogo */}
                  <div className="setup-group">
                    <label className="setup-label">🎮 Escolha o Jogo do Duelo (8 Modos):</label>
                    <div className="setup-options-grid-scroll">
                      {GAME_TYPES.map((gt) => (
                        <div
                          key={gt.id}
                          className={`setup-option-card ${selectedGameType === gt.id ? 'selected' : ''}`}
                          onClick={() => setSelectedGameType(gt.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '1.4rem' }}>{gt.icon}</span>
                            <div>
                              <strong>{gt.name}</strong>
                              <span>{gt.desc}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Escolha da Dificuldade */}
                  <div className="setup-group" style={{ marginTop: '1rem' }}>
                    <label className="setup-label">🤖 Dificuldade do Bot:</label>
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

                  {/* Ações */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={startBotGame}>
                      ⚔️ Iniciar Duelo Agora
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PLAYING STATE (Bot ou Humano) ================= */}
        {gameState === 'playing' && activeQuestion && (
          <div className="duel-match-container animate-fade-in-up">
            {/* Header: Scoreboard Duel */}
            <div className="duel-scoreboard glass-card">
              <div className="player-profile player-user">
                <div className="avatar">👤</div>
                <div className="profile-info">
                  <span className="profile-name">Você</span>
                  <span className="profile-score">{myScoreDisplay} pts</span>
                </div>
              </div>

              <div className="vs-badge">
                <span>VS</span>
                <small>Rodada {roundIndexDisplay + 1}/{totalRoundsDisplay}</small>
              </div>

              <div className="player-profile player-bot">
                <div className="profile-info" style={{ textAlign: 'right' }}>
                  <span className="profile-name">{opponentName}</span>
                  <span className="profile-score">{opponentScoreDisplay} pts</span>
                </div>
                <div className="avatar bot-avatar">{isHuman ? '🧑' : '🤖'}</div>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="timer-bar-container">
              <div
                className="timer-bar-fill"
                style={{
                  width: `${(timeLeftDisplay / 10) * 100}%`,
                  backgroundColor: timeLeftDisplay <= 3 ? '#ef4444' : 'var(--accent-primary)'
                }}
              />
              <span className="timer-text">⏱️ {timeLeftDisplay}s</span>
            </div>

            {/* Question Box: Dynamic per game type */}
            <div className="question-card glass-card">
              {activeQuestion.type === 'translation' && (
                <>
                  <span className="question-label">🎯 Tradução - Qual é a tradução de:</span>
                  <h2 className="target-word">{activeQuestion.word.en}</h2>
                  <span className="pronunciation">/{activeQuestion.word.pronunciation}/</span>
                </>
              )}

              {activeQuestion.type === 'trueFalse' && (
                <>
                  <span className="question-label">✅ Verdadeiro ou Falso - Julgue a tradução:</span>
                  <h2 className="target-word">{activeQuestion.word.en} = "{activeQuestion.displayedPt}"</h2>
                  <span className="pronunciation">/{activeQuestion.word.pronunciation}/</span>
                </>
              )}

              {activeQuestion.type === 'listening' && (
                <>
                  <span className="question-label">🎧 Jogo de Escuta - Ouça e identifique a palavra:</span>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => speakNormal(activeQuestion.word.en)}>
                      🔊 Ouvir em Inglês
                    </button>
                    <button className="btn btn-outline" onClick={() => speakSlow(activeQuestion.word.en)}>
                      🐢 Devagar
                    </button>
                  </div>
                </>
              )}

              {activeQuestion.type === 'wordBuilder' && (
                <>
                  <span className="question-label">🔤 Montar Palavras - Qual palavra se forma com estas letras:</span>
                  <h2 className="target-word" style={{ letterSpacing: '4px' }}>{activeQuestion.scrambledText}</h2>
                  <span className="pronunciation">Dica: {activeQuestion.word.pt}</span>
                </>
              )}

              {activeQuestion.type === 'sentenceBuilder' && (
                <>
                  <span className="question-label">📝 Montar Frases - Escolha a tradução exata da frase:</span>
                  <h3 className="target-word" style={{ fontSize: 'var(--fs-2xl)' }}>"{activeQuestion.word.example}"</h3>
                </>
              )}

              {activeQuestion.type === 'fillBlanks' && (
                <>
                  <span className="question-label">✏️ Completar Frases - Qual palavra preenche a lacuna:</span>
                  <h3 className="target-word" style={{ fontSize: 'var(--fs-2xl)' }}>"{activeQuestion.blankedSentence}"</h3>
                  <span className="pronunciation">Tradução da frase: {activeQuestion.word.examplePt}</span>
                </>
              )}

              {activeQuestion.type === 'hangman' && (
                <>
                  <span className="question-label">🎯 Jogo da Forca - Dica científica em Inglês:</span>
                  <p className="hangman-tip-box" style={{ fontSize: 'var(--fs-md)', margin: '0.8rem 0', fontStyle: 'italic' }}>
                    "{activeQuestion.word.tip}"
                  </p>
                  <span className="pronunciation">Qual é a palavra em inglês?</span>
                </>
              )}

              {activeQuestion.type === 'memory' && (
                <>
                  <span className="question-label">🃏 Jogo da Memória - Encontre o par correspondente para:</span>
                  <h2 className="target-word">{activeQuestion.word.en}</h2>
                  <span className="pronunciation">/{activeQuestion.word.pronunciation}/</span>
                </>
              )}
            </div>

            {/* Options Grid */}
            <div className={`options-grid ${activeQuestion.type === 'trueFalse' ? 'tf-grid' : ''}`}>
              {activeQuestion.options.map((option, idx) => {
                let statusClass = '';
                if (revealedAnswer != null) {
                  if (option === revealedAnswer) statusClass = 'correct';
                  else if (option === (isHuman ? myChoice : playerChoice)) statusClass = 'incorrect';
                } else if (isHuman && option === myChoice) {
                  statusClass = 'pending';
                }

                return (
                  <button
                    key={idx}
                    className={`option-btn ${statusClass} ${activeQuestion.type === 'trueFalse' ? (option === 'Verdadeiro' ? 'tf-true' : 'tf-false') : ''}`}
                    onClick={() => (isHuman ? handleHumanChoice(option) : handlePlayerChoice(option))}
                    disabled={hasAnswered || timeLeftDisplay === 0}
                  >
                    <span className="option-letter">{activeQuestion.type === 'trueFalse' ? (option === 'Verdadeiro' ? '✅' : '❌') : String.fromCharCode(65 + idx)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Opponent Status Indicator */}
            <div className="bot-status-bar glass-card">
              {isHuman ? (
                duel.roundResult ? (
                  (() => {
                    const opp = duel.roundResult.answers.find(a => a.id === duel.opponent?.id);
                    return (
                      <div className="bot-response animate-bounce-in">
                        <span>{opponentName} respondeu:</span>
                        <strong className={opp?.correct ? 'text-green' : 'text-red'}>
                          {opp?.choice ?? '(sem resposta)'} {opp?.correct ? `✅ (+${opp.pointsEarned} pts)` : '❌'}
                        </strong>
                      </div>
                    );
                  })()
                ) : (
                  <div className="bot-thinking">
                    <span className="spinner" />
                    <span>Aguardando {opponentName}... 💭</span>
                  </div>
                )
              ) : (
                botAnswered ? (
                  <div className="bot-response animate-bounce-in">
                    <span>{botConfig.name} respondeu:</span>
                    <strong className={botIsCorrect ? 'text-green' : 'text-red'}>
                      {botChoice} {botIsCorrect ? '✅ (+100 pts)' : '❌'}
                    </strong>
                  </div>
                ) : (
                  <div className="bot-thinking">
                    <span className="spinner" />
                    <span>{botConfig.name} está pensando... 💭</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ================= GAMEOVER STATE (Bot ou Humano) ================= */}
        {gameState === 'gameover' && (
          <div className="gameover-container glass-card animate-bounce-in">
            <div className="gameover-header">
              {(() => {
                const won = isHuman
                  ? (duel.matchEnd?.winnerId === duel.myId || duel.matchEnd?.reason === 'opponent_left')
                  : playerScore > botScore;
                const tied = isHuman
                  ? (duel.matchEnd?.winnerId === null && duel.matchEnd?.reason !== 'opponent_left')
                  : playerScore === botScore;

                if (won) return (
                  <>
                    <div className="result-icon">🏆</div>
                    <h1>Grande Vitória!</h1>
                    <p className="text-secondary">Você venceu {opponentName}!</p>
                  </>
                );
                if (tied) return (
                  <>
                    <div className="result-icon">🤝</div>
                    <h1>Empate Eletrizante!</h1>
                    <p className="text-secondary">Você e {opponentName} empataram!</p>
                  </>
                );
                return (
                  <>
                    <div className="result-icon">🥈</div>
                    <h1>Bom Duelo!</h1>
                    <p className="text-secondary">{opponentName} levou a melhor dessa vez!</p>
                  </>
                );
              })()}
            </div>

            {/* Score Comparison */}
            <div className="final-scoreboard">
              <div className="final-score-box">
                <span>Sua Pontuação</span>
                <h2>{myScoreDisplay} pts</h2>
              </div>
              <div className="final-score-vs">VS</div>
              <div className="final-score-box">
                <span>{opponentName}</span>
                <h2>{opponentScoreDisplay} pts</h2>
              </div>
            </div>

            {/* Recompensas — mesma moeda do resto do app (estrelas = totalScore).
                Não cravamos o valor exato do bônus de conclusão de fase aqui:
                ele pode variar com um multiplicador de pontos ativo da Loja. */}
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

            {/* Action Buttons */}
            <div className="gameover-actions">
              <button className="btn btn-primary btn-lg" onClick={() => { if (isHuman) duel.resetMatch(); openBotSetup(); }}>
                ⚙️ Alterar Modo / Jogar Novamente
              </button>
              <button className="btn btn-outline btn-lg" onClick={returnToLobby}>
                ⚔️ Voltar ao Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoKnowsMore;
