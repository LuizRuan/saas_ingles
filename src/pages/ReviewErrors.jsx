import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { words, shuffleArray } from '../data/words';
import { useProgress } from '../hooks/useProgress';
import { getWordsToReview } from '../utils/reviewSystem';
import useSound from '../hooks/useSound';
import WordExplanation from '../components/Game/WordExplanation';

const ReviewErrors = () => {
  const { progress, handleCorrectAnswer, handleWrongAnswer, incrementReviewed } = useProgress();
  const { playCorrect, playWrong } = useSound();
  
  const reviewWords = useMemo(() => getWordsToReview(progress, words), [progress]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);

  const current = reviewWords[currentIndex];
  const options = useMemo(() => {
    if (!current) return [];
    const wrong = shuffleArray(words.filter(w => w.en !== current.en)).slice(0, 3);
    return shuffleArray([current, ...wrong]);
  }, [current]);

  const handleAnswer = useCallback((option) => {
    if (feedback) return;
    setSelected(option);
    if (option.en === current.en) {
      setFeedback('correct');
      handleCorrectAnswer(current.en, 1);
      incrementReviewed();
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.en);
      playWrong();
    }
  }, [feedback, current, handleCorrectAnswer, handleWrongAnswer, incrementReviewed, playCorrect, playWrong]);

  const nextWord = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    setFeedback(null);
    setSelected(null);
  }, []);

  if (reviewWords.length === 0) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-fade-in-up">
          <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2 style={{ margin: 'var(--space-md) 0' }}>Nenhuma revisão pendente!</h2>
            <p className="text-secondary">Continue jogando para encontrar novas palavras para revisar.</p>
            <Link to="/games" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>🎮 Ir para os jogos</Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= reviewWords.length) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
            <span style={{ fontSize: '4rem' }}>✅</span>
            <h2 style={{ margin: 'var(--space-md) 0' }}>Revisão Concluída!</h2>
            <p className="text-secondary">Você revisou {reviewWords.length} palavras. Continue praticando!</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => { setCurrentIndex(0); setFeedback(null); }}>🔄 Revisar novamente</button>
              <Link to="/games" className="btn btn-ghost">← Jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/" className="btn btn-ghost btn-sm">←</Link>
            <span className="icon">🔄</span>
            <h2>Revisar Erros</h2>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{currentIndex + 1}/{reviewWords.length}</span></div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(currentIndex / reviewWords.length) * 100}%` }}></div>
        </div>

        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-xl)', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>Qual é a tradução de:</p>
          <p style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-purple-light)' }}>{current.pt}</p>
          {progress.wordStats[current.en] && (
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              Erros anteriores: {progress.wordStats[current.en].wrong}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {options.map((opt, i) => {
            let style = {};
            if (feedback && opt.en === current.en) style = { background: 'rgba(16,185,129,0.15)', borderColor: 'var(--accent-green)' };
            else if (feedback && opt === selected) style = { background: 'rgba(239,68,68,0.1)', borderColor: 'var(--accent-red)' };
            
            return (
              <button key={i} className="btn btn-secondary" style={{ padding: 'var(--space-md)', justifyContent: 'flex-start', ...style }}
                onClick={() => handleAnswer(opt)} disabled={!!feedback}>
                {opt.en}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            <p style={{ textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-md)',
              color: feedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
              {feedback === 'correct' ? '✅ Correto!' : '❌ Errar faz parte do aprendizado!'}
            </p>
            <WordExplanation word={current} />
            <button className="btn btn-primary" onClick={nextWord} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewErrors;
