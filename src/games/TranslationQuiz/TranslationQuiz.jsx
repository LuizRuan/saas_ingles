import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { translationQuizzes } from '../../data/sentences';
import { shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import { generateTranslationDistractors } from '../../utils/distractorGenerator';
import './TranslationQuiz.css';

const ROUNDS = 10;

const generateQuizzes = () =>
  shuffleArray([...translationQuizzes])
    .slice(0, ROUNDS)
    .map(q => ({ ...q, options: generateTranslationDistractors(q, translationQuizzes) }));

const TranslationQuiz = () => {
  const [quizzes, setQuizzes] = useState(() => generateQuizzes());
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong } = useSound();
  const { speakNormal } = useSpeech();

  const current = quizzes[round];

  const handleSelect = useCallback((option) => {
    if (feedback) return;
    setSelected(option);
    // As opções só estão em inglês quando a pergunta está em português — a
    // voz é sempre en-US (ver useSpeech.js), falar o texto em português com
    // ela soaria errado.
    if (current.direction === 'pt-en') speakNormal(option);

    if (option === current.correct) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
      handleCorrectAnswer(current.question, 1);
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.question);
      playWrong();
    }
  }, [feedback, current, speakNormal, handleCorrectAnswer, handleWrongAnswer, playCorrect, playWrong]);

  const nextRound = useCallback(() => {
    const next = round + 1;
    if (next >= quizzes.length) {
      setGameComplete(true);
      completeGame('translation');
    } else {
      setRound(next);
      setSelected(null);
      setFeedback(null);
    }
  }, [round, quizzes.length, completeGame]);

  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <p className="text-secondary">Você completou o quiz de tradução!</p>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{correctCount}/{quizzes.length}</span>
                <span className="result-stat-label">Acertos</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{score}</span>
                <span className="result-stat-label">Pontos</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => {
                setQuizzes(generateQuizzes());
                setRound(0);
                setSelected(null);
                setFeedback(null);
                setScore(0);
                setCorrectCount(0);
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
            <img src="/translation-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Tradução</h2>
            <span className="badge badge-pink">{current.direction === 'en-pt' ? '🇺🇸→🇧🇷' : '🇧🇷→🇺🇸'}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{round + 1}/{quizzes.length}</span></div>
            <div className="game-score-item"><span>⭐</span> <span className="value">{score}</span></div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(round / quizzes.length) * 100}%` }}></div>
        </div>

        {/* Question */}
        <div className="tq-question glass-card animate-fade-in-up">
          <span style={{ fontSize: '1.5rem' }}>{current.direction === 'en-pt' ? '🇺🇸' : '🇧🇷'}</span>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
              {current.direction === 'en-pt' ? 'Traduza para o português:' : 'Traduza para o inglês:'}
            </div>
            <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 700 }}>"{current.question}"</div>
          </div>
        </div>

        {/* Options */}
        <div className="tq-options">
          {current.options.map((option, i) => {
            let optClass = 'tq-option glass-card';
            if (feedback) {
              if (option === current.correct) optClass += ' correct';
              else if (option === selected) optClass += ' wrong';
              else optClass += ' dimmed';
            }
            return (
              <button key={i} className={optClass} onClick={() => handleSelect(option)}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="tq-option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="tq-feedback animate-fade-in-up">
            {feedback === 'correct' ? (
              <p style={{ color: 'var(--accent-green)', fontWeight: 600, textAlign: 'center' }}>
                ✅ Correto! +10 pontos
              </p>
            ) : (
              <div>
                <p style={{ color: 'var(--accent-orange)', fontWeight: 600, textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                  A resposta correta é: "{current.correct}"
                </p>
                {current.wrongExplanations && selected && current.wrongExplanations[selected] && (
                  <div className="tq-explanation glass-card">
                    <p style={{ fontSize: 'var(--fs-sm)' }}>
                      💡 <strong>Por que "{selected}" está incorreto?</strong>
                    </p>
                    <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {current.wrongExplanations[selected]}
                    </p>
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-primary" onClick={nextRound}
              style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationQuiz;
