import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fillBlanks } from '../../data/sentences';
import { shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import './FillBlanks.css';

const ROUNDS = 10;

const FillBlanks = () => {
  // A resposta certa vem sempre na posição 0 na fonte de dados; embaralha por
  // pergunta, uma única vez aqui — nunca no render.
  const [questions] = useState(() =>
    shuffleArray([...fillBlanks])
      .slice(0, ROUNDS)
      .map(q => ({ ...q, options: shuffleArray([...q.options]) }))
  );
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong } = useSound();

  const current = questions[round];

  const handleSelect = useCallback((option) => {
    if (feedback) return;
    setSelected(option);
    if (option === current.answer) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      handleCorrectAnswer(current.answer, 1);
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.answer);
      playWrong();
    }
  }, [feedback, current, handleCorrectAnswer, handleWrongAnswer, playCorrect, playWrong]);

  const nextRound = useCallback(() => {
    if (round + 1 >= questions.length) {
      setGameComplete(true);
      completeGame('fillBlanks');
    } else {
      setRound(prev => prev + 1);
      setSelected(null);
      setFeedback(null);
    }
  }, [round, questions.length, completeGame]);

  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <p className="text-secondary">Você completou todas as frases!</p>
            <div className="result-stats">
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
            <span className="icon">✏️</span>
            <h2>Completar</h2>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{round + 1}/{questions.length}</span></div>
            <div className="game-score-item"><span>⭐</span> <span className="value">{score}</span></div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(round / questions.length) * 100}%` }}></div>
        </div>

        <div className="fb-sentence glass-card animate-fade-in-up">
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Complete a frase:</div>
          <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 600 }}>
            {current.sentence.split('_____').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`fb-blank ${feedback === 'correct' ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}>
                    {feedback ? current.answer : '_____'}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="tq-options">
          {current.options.map((option, i) => {
            let cls = 'tq-option glass-card';
            if (feedback) {
              if (option === current.answer) cls += ' correct';
              else if (option === selected) cls += ' wrong';
              else cls += ' dimmed';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(option)}>
                <span className="tq-option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="tq-feedback animate-fade-in-up">
            <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
              <p style={{ fontWeight: 600, marginBottom: 'var(--space-sm)', color: feedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                {feedback === 'correct' ? '✅ Correto!' : '❌ Resposta correta: ' + current.answer}
              </p>
              <p style={{ fontSize: 'var(--fs-md)', fontWeight: 600 }}>"{current.fullSentence}"</p>
              <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>"{current.translation}"</p>
            </div>
            <button className="btn btn-primary" onClick={nextRound} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillBlanks;
