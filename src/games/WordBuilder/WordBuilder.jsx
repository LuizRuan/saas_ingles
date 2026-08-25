import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { shuffleArray } from '../../data/words';
import useCourseData from '../../hooks/useCourseData';
import useUserLevel from '../../hooks/useUserLevel';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import useCourse from '../../hooks/useCourse';
import { pickByLevel } from '../../utils/levelSelection';
import { GAME_REWARDS } from '../../utils/scoring';
import './WordBuilder.css';

const ROUNDS = 8;

const makeLetters = (word) => {
  const target = word.en.toUpperCase();
  let letters = shuffleArray(target.split('').map((l, i) => ({ letter: l, id: i })));
  if (letters.map(l => l.letter).join('') === target && target.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
};

// A resposta é um vetor POSICIONAL: cada índice é um espaço da palavra.
// Assim a dica pode revelar uma posição qualquer, e não só a próxima da fila.
const emptySlots = (word) => new Array(word.en.length).fill(null);

// Enviesado pelo nível do jogador em vez de sortear uniformemente do banco
// inteiro — ver levelSelection.js sobre o porquê.
const generateGameWords = (words, userLevel, maxLevel) =>
  pickByLevel(words.filter(w => !w.en.includes(' ') && w.en.length >= 3 && w.en.length <= 8), userLevel, maxLevel, ROUNDS);

const WordBuilder = () => {
  const { words } = useCourseData();
  const { userLevel, maxLevel } = useUserLevel();
  // Rótulos do par de idiomas ATIVO. Antes vinha de uma constante fixa em
  // 'en-pt', então a instrução dizia "Traduza para o Inglês" mesmo no
  // curso de espanhol.
  const { targetLabel, sourceFlag } = useCourse();
  const [gameWords, setGameWords] = useState(() => generateGameWords(words, userLevel, maxLevel));
  const [round, setRound] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState(() => gameWords[0] ? emptySlots(gameWords[0]) : []);
  const [availableLetters, setAvailableLetters] = useState(() => gameWords[0] ? makeLetters(gameWords[0]) : []);
  // Espaços revelados por dica: ficam travados para não virar dica infinita
  const [lockedSlots, setLockedSlots] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { progress, consumeHint, handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal } = useSpeech();

  const currentWord = gameWords[round];

  const setupRound = useCallback((roundIdx) => {
    const w = gameWords[roundIdx];
    if (!w) {
      setScore(prev => prev + GAME_REWARDS.wordBuilder.completion);
      setGameComplete(true);
      completeGame('wordBuilder', GAME_REWARDS.wordBuilder.completion);
      return;
    }
    setSelectedLetters(emptySlots(w));
    setAvailableLetters(makeLetters(w));
    setLockedSlots([]);
    setFeedback(null);
    setShowExplanation(false);
    setHintUsed(false);
  }, [gameWords, completeGame]);

  // Põe uma letra num espaço específico e avalia quando todos estiverem cheios
  const placeLetter = useCallback((letterObj, slotIndex, viaHint = false) => {
    const newSelected = [...selectedLetters];
    newSelected[slotIndex] = letterObj;
    setSelectedLetters(newSelected);
    setAvailableLetters(prev => prev.filter(l => l.id !== letterObj.id));

    if (!newSelected.every(Boolean)) return;

    const formed = newSelected.map(l => l.letter).join('');
    const usedHint = hintUsed || viaHint;
    if (formed === currentWord.en.toUpperCase()) {
      setFeedback('correct');
      setShowExplanation(true);
      playCorrect();
      const wordPoints = usedHint ? GAME_REWARDS.wordBuilder.withHint : GAME_REWARDS.wordBuilder.perWord;
      setScore(prev => prev + wordPoints);
      handleCorrectAnswer(currentWord.en, usedHint ? 3 : 1, usedHint, wordPoints);
    } else {
      setFeedback('wrong');
      setShowExplanation(true);
      playWrong();
      handleWrongAnswer(currentWord.en);
    }
  }, [selectedLetters, currentWord, hintUsed, playCorrect, playWrong, handleCorrectAnswer, handleWrongAnswer]);

  const handleLetterClick = useCallback((letterObj) => {
    if (feedback) return;
    const slot = selectedLetters.findIndex(s => s === null);
    if (slot === -1) return;
    playClick();
    speakNormal(letterObj.letter);
    placeLetter(letterObj, slot);
  }, [feedback, selectedLetters, playClick, speakNormal, placeLetter]);

  const handleRemoveLetter = useCallback((index) => {
    if (feedback) return;
    if (lockedSlots.includes(index)) return; // letra de dica não sai
    const letterObj = selectedLetters[index];
    if (!letterObj) return;
    speakNormal(letterObj.letter);
    setSelectedLetters(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setAvailableLetters(prev => [...prev, letterObj]);
  }, [feedback, lockedSlots, selectedLetters, speakNormal]);

  // Sorteia um espaço (vazio ou com letra errada não-travada) para aplicar a dica
  const pickHintSlot = useCallback(() => {
    const targetWordUpper = currentWord.en.toUpperCase();
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
    if (existing && existing.id !== letterObj.id) {
      setAvailableLetters(prev => [...prev, existing]);
    }
    setLockedSlots(prev => [...prev, slot]);
    placeLetter(letterObj, slot, true);
  }, [selectedLetters, placeLetter]);

  const handleHint = useCallback(() => {
    if (hintUsed || feedback) return;
    const pick = pickHintSlot();
    if (!pick) return;
    setHintUsed(true);
    revealSlot(pick);
  }, [hintUsed, feedback, pickHintSlot, revealSlot]);

  const handleExtraHint = useCallback(() => {
    if (feedback || (progress.hintsAvailable || 0) <= 0) return;
    // Só cobra a dica se houver mesmo uma letra para revelar
    const pick = pickHintSlot();
    if (!pick) return;
    if (consumeHint()) revealSlot(pick);
  }, [feedback, progress.hintsAvailable, pickHintSlot, consumeHint, revealSlot]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    setRound(next);
    setupRound(next);
  }, [round, setupRound]);

  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <p className="text-secondary">Você completou {ROUNDS} palavras!</p>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{score}</span>
                <span className="result-stat-label">Pontos</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => {
                const newWords = generateGameWords(words, userLevel, maxLevel);
                setGameWords(newWords);
                setRound(0);
                setScore(0);
                setGameComplete(false);
                // setupRound lerá gameWords depois que setGameWords aplicar
                // via o próximo render — inicializar o estado diretamente aqui
                const w = newWords[0];
                if (w) {
                  setSelectedLetters(emptySlots(w));
                  setAvailableLetters(makeLetters(w));
                  setLockedSlots([]);
                  setFeedback(null);
                  setShowExplanation(false);
                  setHintUsed(false);
                }
              }}>🔄 Jogar novamente</button>
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
          </div>
          <div className="game-score">
            <div className="game-score-item">
              <span>📝</span> <span className="value">{round + 1}/{ROUNDS}</span>
            </div>
            <div className="game-score-item">
              <span>⭐</span> <span className="value">{score}</span>
            </div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${((round) / ROUNDS) * 100}%` }}></div>
        </div>

        {/* Translation hint */}
        <div className="wb-hint glass-card animate-fade-in-up">
          <span style={{ fontSize: '1.5rem' }}>{sourceFlag}</span>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Traduza para o {targetLabel}:</div>
            <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{currentWord.pt}</div>
          </div>
        </div>

        {/* Selected letters (answer area) */}
        <div className={`wb-answer ${feedback === 'correct' ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}>
          {currentWord.en.split('').map((_, i) => {
            const locked = lockedSlots.includes(i);
            return (
              <button
                key={i}
                className={`wb-slot ${selectedLetters[i] ? 'filled' : ''} ${locked ? 'locked' : ''}`}
                onClick={() => handleRemoveLetter(i)}
                disabled={locked || !selectedLetters[i]}
              >
                {selectedLetters[i]?.letter || ''}
              </button>
            );
          })}
        </div>

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
                💡 Usar dica grátis (3 pontos)
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
