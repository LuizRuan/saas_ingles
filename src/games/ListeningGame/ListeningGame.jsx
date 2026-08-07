import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { words, shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import './ListeningGame.css';

const ROUNDS = 10;

const generateGameWords = () => {
  const filtered = words.filter(w => !w.en.includes(' ') && w.en.length >= 3);
  return shuffleArray(filtered).slice(0, ROUNDS);
};

const ListeningGame = () => {
  const [gameWords, setGameWords] = useState(() => generateGameWords());
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState(() => generateOptions(gameWords, 0));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong } = useSound();
  const { speakNormal, speakSlow, isAvailable } = useSpeech();

  const current = gameWords[round];

  function generateOptions(allWords, idx) {
    const correct = allWords[idx];
    if (!correct) return [];
    const others = shuffleArray(words.filter(w => w.en !== correct.en)).slice(0, 3);
    return shuffleArray([correct, ...others]);
  }

  const handleSelect = useCallback((word) => {
    if (feedback) return;
    setSelected(word);
    if (word.en === current.en) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      handleCorrectAnswer(current.en, 1);
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.en);
      playWrong();
    }
  }, [feedback, current, handleCorrectAnswer, handleWrongAnswer, playCorrect, playWrong]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= gameWords.length) {
      setGameComplete(true);
      completeGame('listening');
    } else {
      setRound(next);
      setOptions(generateOptions(gameWords, next));
      setSelected(null);
      setFeedback(null);
    }
  }, [round, gameWords, completeGame]);

  if (!isAvailable) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-fade-in-up">
          <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
            <span style={{ fontSize: '4rem' }}>🔇</span>
            <h2 style={{ margin: 'var(--space-md) 0' }}>Áudio não disponível</h2>
            <p className="text-secondary">
              Seu navegador não suporta a funcionalidade de voz. Tente usar o Google Chrome.
            </p>
            <Link to="/games" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
              ← Escolher outro jogo
            </Link>
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
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <div className="result-stats">
              <div className="result-stat"><span className="result-stat-value">{score}</span><span className="result-stat-label">Pontos</span></div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => {
                const newWords = generateGameWords();
                setGameWords(newWords);
                setRound(0);
                setOptions(generateOptions(newWords, 0));
                setSelected(null);
                setFeedback(null);
                setScore(0);
                setGameComplete(false);
              }}>🔄 Jogar novamente</button>
              <Link to="/games" className="btn btn-ghost">← Outros jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/listening-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Escuta</h2>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{round + 1}/{gameWords.length}</span></div>
            <div className="game-score-item"><span>⭐</span> <span className="value">{score}</span></div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(round / gameWords.length) * 100}%` }}></div>
        </div>

        {/* Listen area */}
        <div className="listen-card glass-card animate-fade-in-up">
          <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>Ouça a palavra e escolha a correta:</p>
          <div className="listen-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => speakNormal(current.en)}>
              🔊 Ouvir
            </button>
            <button className="btn btn-secondary" onClick={() => speakSlow(current.en)}>
              🐢 Ouvir devagar
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="lg-options">
          {options.map((word, i) => {
            let cls = 'lg-option';
            if (feedback) {
              if (word.en === current.en) cls += ' correct';
              else if (word === selected) cls += ' wrong';
              else cls += ' dimmed';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(word)}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="lg-option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{word.en} — {word.pt}</span>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            <p style={{ textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-md)',
              color: feedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
              {feedback === 'correct' ? '✅ Correto!' : '❌ A palavra era: ' + current.en}
            </p>
            <WordExplanation word={current} showTip={false} />
            <button className="btn btn-primary" onClick={nextRound} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningGame;
