import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { words, shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import WordExplanation from '../../components/Game/WordExplanation';
import './WordBuilder.css';

const ROUNDS = 8;

// Embaralha as letras da palavra; cada uma tem id próprio para lidar com repetidas
const makeLetters = (word) =>
  shuffleArray(word.en.toUpperCase().split('').map((l, i) => ({ letter: l, id: i })));

// A resposta é um vetor POSICIONAL: cada índice é um espaço da palavra.
// Assim a dica pode revelar uma posição qualquer, e não só a próxima da fila.
const emptySlots = (word) => new Array(word.en.length).fill(null);

const WordBuilder = () => {
  const [gameWords] = useState(() => shuffleArray(words.filter(w => !w.en.includes(' ') && w.en.length >= 3 && w.en.length <= 8)).slice(0, ROUNDS));
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

  const currentWord = gameWords[round];

  const setupRound = useCallback((roundIdx) => {
    const w = gameWords[roundIdx];
    if (!w) { setGameComplete(true); completeGame('wordBuilder'); return; }
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
      setScore(prev => prev + (usedHint ? 3 : 10));
      handleCorrectAnswer(currentWord.en, usedHint ? 3 : 1, usedHint);
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
    placeLetter(letterObj, slot);
  }, [feedback, selectedLetters, playClick, placeLetter]);

  const handleRemoveLetter = useCallback((index) => {
    if (feedback) return;
    if (lockedSlots.includes(index)) return; // letra de dica não sai
    const letterObj = selectedLetters[index];
    if (!letterObj) return;
    setSelectedLetters(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setAvailableLetters(prev => [...prev, letterObj]);
  }, [feedback, lockedSlots, selectedLetters]);

  // Sorteia um espaço vazio cuja letra ainda esteja disponível na bandeja
  const pickHintSlot = useCallback(() => {
    const candidates = selectedLetters
      .map((slot, i) => (slot === null ? i : -1))
      .filter(i => i !== -1)
      .map(i => ({ slot: i, letterObj: availableLetters.find(l => l.letter === currentWord.en[i].toUpperCase()) }))
      .filter(c => c.letterObj);

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [selectedLetters, availableLetters, currentWord]);

  const revealSlot = useCallback(({ slot, letterObj }) => {
    setLockedSlots(prev => [...prev, slot]);
    placeLetter(letterObj, slot, true);
  }, [placeLetter]);

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
              <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Jogar novamente</button>
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
            <span className="icon">🔤</span>
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
          <span style={{ fontSize: '1.5rem' }}>🇧🇷</span>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Traduza para o inglês:</div>
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
                title={locked ? 'Letra revelada por dica' : undefined}
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
            <WordExplanation word={currentWord} />
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
