import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { words } from '../data/words';
import { useProgress } from '../hooks/useProgress';
import { generateDailyChallenge, isDailyChallengeCompleted } from '../utils/dailyChallenge';
import useSound from '../hooks/useSound';
import WordExplanation from '../components/Game/WordExplanation';
import './DailyChallenge.css';

const DailyChallenge = () => {
  const { progress, handleCorrectAnswer, handleWrongAnswer, completeDailyChallenge } = useProgress();
  const { playCorrect, playWrong } = useSound();

  const isCompleted = isDailyChallengeCompleted(progress);
  const [challenge] = useState(() => generateDailyChallenge(words));
  const [step, setStep] = useState(0);
  const [stepState, setStepState] = useState('playing'); // playing, feedback
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const currentChallenge = challenge.challenges[step];

  // Recebe os dois lados como objeto-palavra e compara pela chave `en`.
  // (Antes comparava o objeto da opção com a string da resposta, então
  // NENHUMA resposta certa era contabilizada.)
  const handleAnswer = useCallback((option, answer) => {
    if (stepState !== 'playing') return;
    setSelectedAnswer(option);

    if (option.en === answer.en) {
      setFeedback('correct');
      playCorrect();
      handleCorrectAnswer(answer.en, 1);
    } else {
      setFeedback('wrong');
      playWrong();
      handleWrongAnswer(answer.en);
    }
    setStepState('feedback');
  }, [stepState, playCorrect, playWrong, handleCorrectAnswer, handleWrongAnswer]);

  const nextStep = useCallback(() => {
    if (step + 1 >= challenge.challenges.length) {
      completeDailyChallenge();
      return;
    }
    setStep(prev => prev + 1);
    setStepState('playing');
    setSelectedAnswer(null);
    setFeedback(null);
  }, [step, challenge.challenges.length, completeDailyChallenge]);

  if (isCompleted) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="glass-card" style={{ padding: 'var(--space-2xl)', maxWidth: 500, margin: '0 auto' }}>
            <span style={{ fontSize: '4rem' }}>✅</span>
            <h2 style={{ margin: 'var(--space-md) 0' }}>Desafio Concluído!</h2>
            <p className="text-secondary">Você já completou o desafio de hoje. Volte amanhã para um novo desafio!</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <Link to="/games" className="btn btn-primary">🎮 Jogar outros jogos</Link>
              <Link to="/" className="btn btn-ghost">← Início</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // As alternativas vêm prontas de generateDailyChallenge (semeadas pelo dia).
  // Nada aqui pode sortear nada: este corpo roda a cada render.
  const renderChallenge = () => {
    const answer = currentChallenge?.answer;
    const options = currentChallenge?.options;
    if (!answer || !options?.length) return <p>Carregando...</p>;

    // Tradução e V/F perguntam em inglês; os demais perguntam em português.
    const askInEnglish = currentChallenge.type === 'translation' || currentChallenge.type === 'trueFalse';

    return (
      <div className="animate-fade-in-up">
        <div className="glass-card daily-prompt">
          <p className="daily-prompt-label">
            {askInEnglish ? 'Qual é a tradução de:' : currentChallenge.description}
          </p>
          <p className="daily-prompt-word">{askInEnglish ? answer.en : answer.pt}</p>
        </div>

        {feedback && (
          <p className={`daily-verdict ${feedback}`}>
            {feedback === 'correct' ? '✅ Acertou!' : `❌ A resposta certa era "${askInEnglish ? answer.pt : answer.en}"`}
          </p>
        )}

        <div className="daily-options">
          {options.map((opt) => {
            let cls = 'glass-card daily-option';
            if (stepState === 'feedback') {
              if (opt.en === answer.en) cls += ' correct';
              else if (opt === selectedAnswer) cls += ' wrong';
            }
            return (
              <button
                key={opt.en}
                className={cls}
                onClick={() => handleAnswer(opt, answer)}
                disabled={stepState !== 'playing'}>
                {askInEnglish ? opt.pt : opt.en}
              </button>
            );
          })}
        </div>

        {stepState === 'feedback' && (
          <div className="animate-fade-in-up daily-explanation">
            <WordExplanation word={answer} compact />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/" className="btn btn-ghost btn-sm">←</Link>
            <span className="icon">⚡</span>
            <h2>Desafio Diário</h2>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{step + 1}/{challenge.challenges.length}</span></div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="progress-bar-fill" style={{ width: `${(step / challenge.challenges.length) * 100}%` }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <span style={{ fontSize: '1.5rem' }}>{currentChallenge?.icon}</span>
          <h3>{currentChallenge?.title}</h3>
        </div>

        {renderChallenge()}

        {stepState === 'feedback' && (
          <button className="btn btn-primary" onClick={nextStep}
            style={{ width: '100%', marginTop: 'var(--space-lg)' }}>
            {step + 1 >= challenge.challenges.length ? '🎉 Finalizar Desafio' : 'Próximo →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
