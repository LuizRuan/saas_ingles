import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { trueFalse } from '../../data/sentences';
import { words, shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import WordExplanation from '../../components/Game/WordExplanation';
import './TrueFalse.css';

const ROUNDS = 12;

const TrueFalse = () => {
  const [questions] = useState(() => shuffleArray([...trueFalse]).slice(0, ROUNDS));
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong } = useSound();

  const current = questions[round];

  const handleAnswer = useCallback((answer) => {
    if (feedback) return;
    const isCorrect = (answer === current.isCorrect);
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
      handleCorrectAnswer(current.word, 1);
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.word);
      playWrong();
    }
  }, [feedback, current, handleCorrectAnswer, handleWrongAnswer, playCorrect, playWrong]);

  const nextRound = useCallback(() => {
    if (round + 1 >= questions.length) {
      setGameComplete(true);
      completeGame('trueFalse');
    } else {
      setRound(prev => prev + 1);
      setFeedback(null);
    }
  }, [round, questions.length, completeGame]);

  const getWordData = () => words.find(w => w.en === current.word);

  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <div className="result-stats">
              <div className="result-stat"><span className="result-stat-value">{correctCount}/{questions.length}</span><span className="result-stat-label">Acertos</span></div>
              <div className="result-stat"><span className="result-stat-value">{score}</span><span className="result-stat-label">Pontos</span></div>
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

  if (!current) return null;

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <span className="icon">✅</span>
            <h2>Verdadeiro ou Falso</h2>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{round + 1}/{questions.length}</span></div>
            <div className="game-score-item"><span>⭐</span> <span className="value">{score}</span></div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(round / questions.length) * 100}%` }}></div>
        </div>

        <div className="tf-card glass-card animate-fade-in-up">
          <div className="tf-statement">
            <span className="tf-word">{current.word}</span>
            <span className="tf-equals">=</span>
            <span className="tf-translation">{current.translation}</span>
          </div>
          <p className="text-secondary" style={{ textAlign: 'center', fontSize: 'var(--fs-sm)' }}>
            Esta tradução está correta?
          </p>
        </div>

        {!feedback && (
          <div className="tf-buttons animate-fade-in-up">
            <button className="tf-btn tf-true" onClick={() => handleAnswer(true)}>
              ✅ Verdadeiro
            </button>
            <button className="tf-btn tf-false" onClick={() => handleAnswer(false)}>
              ❌ Falso
            </button>
          </div>
        )}

        {feedback && (
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            <p style={{ textAlign: 'center', fontSize: 'var(--fs-lg)', fontWeight: 600, marginBottom: 'var(--space-md)',
              color: feedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
              {feedback === 'correct' ? '✅ Correto!' : '❌ Errado!'}
            </p>
            
            {!current.isCorrect && feedback === 'wrong' && (
              <p className="text-center text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                A tradução correta de "{current.word}" é: <strong>{current.correctTranslation}</strong>
              </p>
            )}
            {current.isCorrect && feedback === 'wrong' && (
              <p className="text-center text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
                A tradução estava correta! "{current.word}" realmente significa "{current.correctTranslation}"
              </p>
            )}

            {getWordData() && <WordExplanation word={getWordData()} />}
            
            <button className="btn btn-primary" onClick={nextRound} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrueFalse;
