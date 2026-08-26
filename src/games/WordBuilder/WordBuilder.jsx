import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useCourseData from '../../hooks/useCourseData';
import useUserLevel from '../../hooks/useUserLevel';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import useCourse from '../../hooks/useCourse';
import {
  createWordBuilderSlots,
  getWordBuilderTarget,
  getWordBuilderTokens,
  isWordBuilderAnswerCorrect,
  makeWordBuilderTiles,
} from '../../utils/wordBuilderCharacters';
import {
  addWordBuilderDistractors,
  getAllWordBuilderModes,
  getWordBuilderMode,
} from '../../utils/wordBuilderModes';
import { selectWordBuilderWords } from '../../utils/wordBuilderSelection';
import { buildWordBuilderWordResult } from '../../utils/wordBuilderPerformance';
import {
  calculateWordBuilderWordPoints,
  createWordBuilderGameResult,
} from '../../utils/wordBuilderScoring';
import { getWordBuilderSkillRating, updateWordBuilderSkill } from '../../utils/wordBuilderSkill';
import './WordBuilder.css';

// A resposta é um vetor POSICIONAL: cada índice é um espaço da palavra.
// Assim a dica pode revelar uma posição qualquer, e não só a próxima da fila.
const emptySlots = word => createWordBuilderSlots(word);
const formatDuration = milliseconds => `${Math.max(0, Math.round((Number(milliseconds) || 0) / 1000))}s`;

// Enviesado pelo nível do jogador em vez de sortear uniformemente do banco
// inteiro — ver levelSelection.js sobre o porquê.
const prepareWordBuilderRound = (word, mode, coursePair) => {
  const slots = emptySlots(word);
  let tiles = addWordBuilderDistractors(
    makeWordBuilderTiles(word),
    word,
    mode.distractorLetters,
    coursePair,
  );
  const lockedSlots = [];
  const tokens = getWordBuilderTokens(word.en);

  tokens.filter(token => token.isLetter).slice(0, mode.freeLetters).forEach((token) => {
    const tile = tiles.find(candidate => !candidate.distractor && candidate.letter === token.character);
    if (!tile) return;
    slots[token.index] = tile;
    lockedSlots.push(token.index);
    tiles = tiles.filter(candidate => candidate.id !== tile.id);
  });

  return { slots, tiles, lockedSlots };
};

const WordBuilder = () => {
  const { words } = useCourseData();
  const { userLevel } = useUserLevel();
  // Rótulos do par de idiomas ATIVO. Antes vinha de uma constante fixa em
  // 'en-pt', então a instrução dizia "Traduza para o Inglês" mesmo no
  // curso de espanhol.
  const { targetLabel, sourceFlag, coursePair } = useCourse();
  const {
    progress,
    consumeHint,
    rememberWordBuilderWords,
    completeWordBuilderGame,
  } = useProgress();
  const [difficulty, setDifficulty] = useState(null);
  const [gameWords, setGameWords] = useState([]);
  const [round, setRound] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  // Espaços revelados por dica: ficam travados para não virar dica infinita
  const [lockedSlots, setLockedSlots] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptNotice, setAttemptNotice] = useState('');
  const [incorrectSlots, setIncorrectSlots] = useState([]);
  const [moves, setMoves] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const roundStartedAt = useRef(Date.now());
  const gameStartedAt = useRef(Date.now());
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal } = useSpeech();

  const currentWord = gameWords[round];

  const startGame = useCallback((selectedMode) => {
    const mode = getWordBuilderMode(selectedMode?.id, progress.wordBuilderSkill, userLevel);
    const selection = selectWordBuilderWords({
      words,
      mode,
      courseId: coursePair,
      recentWordKeys: progress.recentWordBuilderKeys,
      wordBuilderStats: progress.wordBuilderStats,
      reviewQueue: progress.wordBuilderReviewQueue,
      completedGames: progress.gamesCompleted?.wordBuilder || 0,
    });
    const newWords = selection.words;
    const firstRound = newWords[0] ? prepareWordBuilderRound(newWords[0], mode, coursePair) : null;
    setDifficulty({ ...mode, sessionDifficulty: selection.averageDifficulty });
    setGameWords(newWords);
    rememberWordBuilderWords(newWords);
    setRound(0);
    setScore(0);
    setGameComplete(false);
    setFeedback(null);
    setShowExplanation(false);
    setHintUsed(false);
    setAttemptsUsed(0);
    setAttemptNotice('');
    setIncorrectSlots([]);
    setMoves(0);
    setHintsUsedCount(mode.freeLetters);
    setSessionResults([]);
    setFinalResult(null);
    gameStartedAt.current = Date.now();
    roundStartedAt.current = Date.now();
    setSelectedLetters(firstRound?.slots || []);
    setAvailableLetters(firstRound?.tiles || []);
    setLockedSlots(firstRound?.lockedSlots || []);
  }, [coursePair, progress.gamesCompleted?.wordBuilder, progress.recentWordBuilderKeys, progress.wordBuilderReviewQueue, progress.wordBuilderSkill, progress.wordBuilderStats, rememberWordBuilderWords, userLevel, words]);

  const setupRound = useCallback((roundIdx) => {
    const w = gameWords[roundIdx];
    if (!w) return;
    const prepared = prepareWordBuilderRound(w, difficulty, coursePair);
    setSelectedLetters(prepared.slots);
    setAvailableLetters(prepared.tiles);
    setLockedSlots(prepared.lockedSlots);
    setFeedback(null);
    setShowExplanation(false);
    setHintUsed(false);
    setAttemptsUsed(0);
    setAttemptNotice('');
    setIncorrectSlots([]);
    setMoves(0);
    setHintsUsedCount(difficulty.freeLetters);
    roundStartedAt.current = Date.now();
  }, [gameWords, difficulty, coursePair]);

  const recordRoundResult = useCallback((won, attempts, extraHint = false, extraMove = 0) => {
    const result = buildWordBuilderWordResult({
      word: currentWord,
      won,
      attempts,
      maxAttempts: difficulty.maxAttempts,
      moves: moves + extraMove,
      hintsUsed: hintsUsedCount + (extraHint ? 1 : 0),
      freeLetters: difficulty.freeLetters,
      durationMs: Date.now() - roundStartedAt.current,
      difficulty: currentWord.wordBuilderDifficulty,
    });
    setSessionResults(previous => [...previous, result]);
    setScore(previous => previous + calculateWordBuilderWordPoints(result, difficulty.id));
  }, [currentWord, difficulty, hintsUsedCount, moves]);

  // Põe uma letra num espaço específico e avalia quando todos estiverem cheios
  const placeLetter = useCallback((letterObj, slotIndex, viaHint = false, baseSlots = selectedLetters) => {
    const newSelected = [...baseSlots];
    newSelected[slotIndex] = letterObj;
    setSelectedLetters(newSelected);
    setAvailableLetters(prev => prev.filter(l => l.id !== letterObj.id));

    if (!newSelected.every(Boolean)) return;

    if (isWordBuilderAnswerCorrect(currentWord, newSelected)) {
      setFeedback('correct');
      setShowExplanation(true);
      playCorrect();
      recordRoundResult(true, attemptsUsed + 1, viaHint, viaHint ? 0 : 1);
    } else {
      playWrong();
      const nextAttempts = attemptsUsed + 1;
      setAttemptsUsed(nextAttempts);
      if (nextAttempts < difficulty.maxAttempts) {
        const target = getWordBuilderTarget(currentWord.en);
        const protectedSlots = viaHint ? [...lockedSlots, slotIndex] : lockedSlots;
        setAttemptNotice(`Ainda não. Você tem ${difficulty.maxAttempts - nextAttempts} tentativa${difficulty.maxAttempts - nextAttempts === 1 ? '' : 's'}.`);
        if (difficulty.showPositionFeedback) {
          setIncorrectSlots(newSelected
            .map((slot, index) => (!slot?.literal && slot?.letter !== target[index] ? index : -1))
            .filter(index => index >= 0));
        } else {
          const returned = newSelected.filter((slot, index) => slot && !slot.literal && !protectedSlots.includes(index));
          setSelectedLetters(newSelected.map((slot, index) => (slot?.literal || protectedSlots.includes(index) ? slot : null)));
          setAvailableLetters(prev => [...prev, ...returned]);
        }
      } else {
        setFeedback('wrong');
        setShowExplanation(true);
        recordRoundResult(false, nextAttempts, viaHint, viaHint ? 0 : 1);
      }
    }
  }, [selectedLetters, currentWord, attemptsUsed, difficulty, lockedSlots, playCorrect, playWrong, recordRoundResult]);

  const handleLetterClick = useCallback((letterObj) => {
    if (feedback) return;
    const slot = selectedLetters.findIndex(s => s === null);
    if (slot === -1) return;
    playClick();
    speakNormal(letterObj.letter);
    setMoves(previous => previous + 1);
    placeLetter(letterObj, slot);
  }, [feedback, selectedLetters, playClick, speakNormal, placeLetter]);

  const handleRemoveLetter = useCallback((index) => {
    if (feedback) return;
    if (lockedSlots.includes(index)) return; // letra de dica não sai
    const letterObj = selectedLetters[index];
    if (!letterObj) return;
    speakNormal(letterObj.letter);
    setMoves(previous => previous + 1);
    setSelectedLetters(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setAttemptNotice('');
    setIncorrectSlots(prev => prev.filter(slot => slot !== index));
    setAvailableLetters(prev => [...prev, letterObj]);
  }, [feedback, lockedSlots, selectedLetters, speakNormal]);

  // Sorteia um espaço (vazio ou com letra errada não-travada) para aplicar a dica
  const pickHintSlot = useCallback(() => {
    const targetWordUpper = getWordBuilderTarget(currentWord.en);
    const candidates = selectedLetters
      .map((slot, i) => {
        if (lockedSlots.includes(i)) return -1;
        // Se o slot tem a letra correta no lugar certo, pula
        if (slot !== null && slot.letter === targetWordUpper[i]) return -1;
        return i;
      })
      .filter(i => i !== -1)
      .map(i => {
        const correctChar = targetWordUpper[i];
        // Procura a letra na bandeja de disponíveis OU dentro do próprio slot não-travado
        const letterObj = availableLetters.find(l => l.letter === correctChar) ||
          selectedLetters.find((s, idx) => s && s.letter === correctChar && !lockedSlots.includes(idx));
        return { slot: i, letterObj };
      })
      .filter(c => c.letterObj);

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [selectedLetters, availableLetters, currentWord, lockedSlots]);

  const revealSlot = useCallback(({ slot, letterObj }) => {
    // Se o slot destino já tinha uma letra errada não-travada, devolve-a para disponíveis
    const existing = selectedLetters[slot];
    const sourceIndex = selectedLetters.findIndex(selected => selected?.id === letterObj.id);
    const baseSlots = [...selectedLetters];
    if (sourceIndex >= 0 && sourceIndex !== slot) baseSlots[sourceIndex] = null;
    if (existing && existing.id !== letterObj.id) {
      setAvailableLetters(prev => [...prev, existing]);
    }
    setLockedSlots(prev => [...prev, slot]);
    setIncorrectSlots(prev => prev.filter(index => index !== slot && index !== sourceIndex));
    placeLetter(letterObj, slot, true, baseSlots);
  }, [selectedLetters, placeLetter]);

  const handleHint = useCallback(() => {
    if (hintUsed || feedback) return;
    const pick = pickHintSlot();
    if (!pick) return;
    setHintUsed(true);
    setHintsUsedCount(previous => previous + 1);
    revealSlot(pick);
  }, [hintUsed, feedback, pickHintSlot, revealSlot]);

  const handleExtraHint = useCallback(() => {
    if (feedback || (progress.hintsAvailable || 0) <= 0) return;
    // Só cobra a dica se houver mesmo uma letra para revelar
    const pick = pickHintSlot();
    if (!pick) return;
    if (consumeHint()) {
      setHintsUsedCount(previous => previous + 1);
      revealSlot(pick);
    }
  }, [feedback, progress.hintsAvailable, pickHintSlot, consumeHint, revealSlot]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= gameWords.length) {
      const baseResult = createWordBuilderGameResult({
        wordResults: sessionResults,
        mode: difficulty.id,
        difficulty: difficulty.sessionDifficulty,
        durationMs: Date.now() - gameStartedAt.current,
        fallbackRating: userLevel,
      });
      const skillBefore = getWordBuilderSkillRating(progress.wordBuilderSkill, userLevel);
      const projectedSkill = updateWordBuilderSkill(progress.wordBuilderSkill, baseResult);
      const previousBest = progress.wordBuilderSkill?.bestByMode?.[difficulty.id];
      const result = {
        ...baseResult,
        skillBefore,
        skillAfter: projectedSkill.rating,
        skillDelta: projectedSkill.rating - skillBefore,
        newRecord: !previousBest || baseResult.performance > previousBest.performance,
      };
      setScore(result.points);
      setFinalResult(result);
      setGameComplete(true);
      completeWordBuilderGame(sessionResults, result);
      return;
    }
    setRound(next);
    setupRound(next);
  }, [completeWordBuilderGame, difficulty, gameWords.length, progress.wordBuilderSkill, round, sessionResults, setupRound, userLevel]);

  if (!difficulty) {
    const modes = getAllWordBuilderModes(progress.wordBuilderSkill, userLevel);
    return (
      <div className="page">
        <div className="container game-container animate-fade-in">
          <div className="game-title wb-mode-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/wordbuilder-icon.webp" alt="" className="icon" />
            <div>
              <h2>Montar Palavras</h2>
              <p>Escolha como quer praticar hoje.</p>
            </div>
          </div>
          <div className="word-builder-mode-grid">
            {modes.map((mode) => (
              <button
                key={mode.id}
                className={`word-builder-mode-card ${mode.id}`}
                onClick={() => startGame(mode)}
              >
                <span className="wb-mode-icon">{mode.id === 'easy' ? '🌱' : mode.id === 'hard' ? '🔥' : '🎯'}</span>
                <strong>{mode.label}</strong>
                <span>{mode.description}</span>
                <div className="wb-mode-details">
                  <small>{mode.rounds} palavras</small>
                  <small>{mode.maxAttempts} tentativas</small>
                  <small>Nível-alvo {mode.targetDifficulty}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span className="wb-result-medal">{finalResult?.medal?.icon || '💪'}</span>
            <h2>{finalResult?.medal?.label || 'Partida concluída'}</h2>
            <p className="text-secondary">
              {finalResult?.accuracy >= 0.75
                ? `Ótimo ritmo no modo ${difficulty.label}!`
                : 'As palavras difíceis já foram separadas para revisão.'}
            </p>
            {finalResult?.newRecord && <div className="wb-record-banner">✨ Novo recorde no modo {difficulty.label}</div>}
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{score}</span>
                <span className="result-stat-label">Pontos</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{finalResult?.correctCount || 0}/{finalResult?.totalRounds || gameWords.length}</span>
                <span className="result-stat-label">Palavras corretas</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{finalResult?.performance || 0}%</span>
                <span className="result-stat-label">Desempenho</span>
              </div>
            </div>
            <div className="wb-result-details">
              <span>🎯 Nível da sessão: {finalResult?.difficulty}</span>
              <span>🔁 Média: {finalResult?.averageAttempts?.toFixed(1)} tentativas</span>
              <span>💡 Dicas: {finalResult?.hintsUsed || 0}</span>
              <span>🧠 Para revisar: {finalResult?.reviewCount || 0}</span>
              <span>⏱️ Tempo: {formatDuration(finalResult?.durationMs)}</span>
              <span>
                📈 Habilidade: {finalResult?.skillBefore} → {finalResult?.skillAfter}
                {finalResult?.skillDelta > 0 ? ` (+${finalResult.skillDelta})` : finalResult?.skillDelta || ''}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => startGame(difficulty)}>🔄 Jogar novamente</button>
              <button className="btn btn-secondary" onClick={() => {
                setDifficulty(null);
                setGameComplete(false);
              }}>⚙️ Trocar dificuldade</button>
              <Link to="/games" className="btn btn-ghost">← Outros jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/wordbuilder-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Montar Palavras</h2>
            <span className={`wb-mode-badge ${difficulty.id}`}>{difficulty.label}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item">
              <span>📝</span> <span className="value">{round + 1}/{gameWords.length}</span>
            </div>
            <div className="game-score-item">
              <span>🎯</span> <span className="value">{difficulty.maxAttempts - attemptsUsed}</span>
            </div>
            <div className="game-score-item">
              <span>⭐</span> <span className="value">{score}</span>
            </div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${((round) / Math.max(1, gameWords.length)) * 100}%` }}></div>
        </div>

        {/* Translation hint */}
        <div className="wb-hint glass-card animate-fade-in-up">
          <span style={{ fontSize: '1.5rem' }}>{sourceFlag}</span>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Traduza para o {targetLabel}:</div>
            <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{currentWord.pt}</div>
          </div>
        </div>

        <div className="wb-round-metrics" aria-label="Detalhes da rodada">
          <span>🎚️ Palavra nível {currentWord.wordBuilderDifficulty}</span>
          <span>🎯 {difficulty.maxAttempts - attemptsUsed} tentativa{difficulty.maxAttempts - attemptsUsed === 1 ? '' : 's'} restante{difficulty.maxAttempts - attemptsUsed === 1 ? '' : 's'}</span>
          <span>👆 {moves} movimento{moves === 1 ? '' : 's'}</span>
          {currentWord.wordBuilderRole === 'spaced-review' && <span>🧠 Revisão programada</span>}
        </div>

        {/* Selected letters (answer area) */}
        <div className={`wb-answer ${feedback === 'correct' ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}>
          {getWordBuilderTokens(currentWord.en).map((token, i) => {
            const literal = !token.isLetter;
            const locked = literal || lockedSlots.includes(i);
            return (
              <button
                key={i}
                className={`wb-slot ${selectedLetters[i] ? 'filled' : ''} ${lockedSlots.includes(i) ? 'locked' : ''} ${incorrectSlots.includes(i) ? 'incorrect' : ''} ${literal ? 'literal' : ''}`}
                onClick={() => handleRemoveLetter(i)}
                disabled={locked || !selectedLetters[i]}
              >
                {selectedLetters[i]?.letter || ''}
              </button>
            );
          })}
        </div>

        {attemptNotice && !feedback && (
          <p className="wb-attempt-notice" role="status">{attemptNotice}</p>
        )}

        {/* Available letters */}
        {!feedback && (
          <div className="wb-letters animate-fade-in-up">
            {availableLetters.map((letterObj) => (
              <button
                key={letterObj.id}
                className="wb-letter-btn"
                onClick={() => handleLetterClick(letterObj)}
              >
                {letterObj.letter}
              </button>
            ))}
          </div>
        )}

        {/* Hint button */}
        {!feedback && (
          <div className="text-center" style={{ marginTop: 'var(--space-md)', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!hintUsed && (
              <button className="btn btn-ghost btn-sm" onClick={handleHint}>
                💡 Usar dica grátis (reduz a recompensa)
              </button>
            )}
            {(progress.hintsAvailable || 0) > 0 ? (
              <button className="btn btn-secondary btn-sm" onClick={handleExtraHint}>
                💡 Revelar Letra ({progress.hintsAvailable} disps)
              </button>
            ) : (
              <Link to="/shop" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--fs-xs)', textDecoration: 'none' }}>
                🛒 Comprar Dicas na Loja
              </Link>
            )}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            <p style={{ textAlign: 'center', marginBottom: 'var(--space-md)', fontSize: 'var(--fs-lg)', fontWeight: 600 }}>
              {feedback === 'correct' ? '✅ Correto!' : '❌ Resposta: ' + currentWord.en}
            </p>
            <p className="text-secondary text-center wb-round-performance">
              Desempenho nesta palavra: {sessionResults.at(-1)?.performance || 0}% · {sessionResults.at(-1)?.attempts || 1} tentativa{sessionResults.at(-1)?.attempts === 1 ? '' : 's'}
            </p>
            {feedback === 'wrong' && (
              <p className="text-secondary text-center" style={{ marginBottom: 'var(--space-md)' }}>
                Boa tentativa! Vamos aprender essa palavra.
              </p>
            )}
            <WordExplanation word={currentWord} showTip={false} />
            <button className="btn btn-primary" onClick={nextRound}
              style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima palavra →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordBuilder;
