import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { words } from '../data/words';
import { useProgress } from '../hooks/useProgress';
import { generateDailyChallenge, isDailyChallengeCompleted } from '../utils/dailyChallenge';
import WordExplanation from '../components/Game/WordExplanation';

import DailyListeningStep from '../components/DailyChallenge/DailyListeningStep';
import DailyMemoryStep from '../components/DailyChallenge/DailyMemoryStep';
import DailyHangmanStep from '../components/DailyChallenge/DailyHangmanStep';
import DailyWordBuilderStep from '../components/DailyChallenge/DailyWordBuilderStep';
import DailySentenceBuilderStep from '../components/DailyChallenge/DailySentenceBuilderStep';
import DailyTrueFalseStep from '../components/DailyChallenge/DailyTrueFalseStep';
import DailyFillBlanksStep from '../components/DailyChallenge/DailyFillBlanksStep';
import DailyTranslationStep from '../components/DailyChallenge/DailyTranslationStep';

import './DailyChallenge.css';

const DailyChallenge = () => {
  const { progress, handleCorrectAnswer, handleWrongAnswer, completeDailyChallenge } = useProgress();

  const isCompleted = isDailyChallengeCompleted(progress);
  const [challenge] = useState(() => generateDailyChallenge(words));
  const [step, setStep] = useState(0);
  const [stepState, setStepState] = useState('playing'); // playing, feedback
  const [feedback, setFeedback] = useState(null); // correct, wrong

  const currentChallenge = challenge.challenges[step];

  const handleStepAnswer = useCallback((userOption, answerObj, isCorrect) => {
    if (stepState !== 'playing') return;

    if (isCorrect) {
      setFeedback('correct');
      if (answerObj?.en) handleCorrectAnswer(answerObj.en, 1);
    } else {
      setFeedback('wrong');
      if (answerObj?.en) handleWrongAnswer(answerObj.en);
    }
    setStepState('feedback');
  }, [stepState, handleCorrectAnswer, handleWrongAnswer]);

  const nextStep = useCallback(() => {
    if (step + 1 >= challenge.challenges.length) {
      completeDailyChallenge();
      return;
    }
    setStep(prev => prev + 1);
    setStepState('playing');
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

  const renderStepContent = () => {
    if (!currentChallenge) return <p>Carregando...</p>;

    switch (currentChallenge.type) {
      case 'listening':
        return (
          <DailyListeningStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'memory':
        return (
          <DailyMemoryStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'hangman':
        return (
          <DailyHangmanStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'wordBuilder':
        return (
          <DailyWordBuilderStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'sentenceBuilder':
        return (
          <DailySentenceBuilderStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'trueFalse':
        return (
          <DailyTrueFalseStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'fillBlanks':
        return (
          <DailyFillBlanksStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
      case 'translation':
      default:
        return (
          <DailyTranslationStep
            key={step}
            challenge={currentChallenge}
            stepState={stepState}
            onAnswer={handleStepAnswer}
          />
        );
    }
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
            <div className="game-score-item">
              <span>📝</span> <span className="value">{step + 1}/{challenge.challenges.length}</span>
            </div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="progress-bar-fill" style={{ width: `${(step / challenge.challenges.length) * 100}%` }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
          <span style={{ fontSize: '1.75rem' }}>{currentChallenge?.icon}</span>
          <h3 style={{ margin: 'var(--space-xs) 0' }}>{currentChallenge?.title}</h3>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            {currentChallenge?.description}
          </p>
        </div>

        {renderStepContent()}

        {stepState === 'feedback' && (
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            {feedback && (
              <p className={`daily-verdict ${feedback}`} style={{ textAlign: 'center', fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
                {feedback === 'correct' ? '✅ Excelente! Você acertou!' : `❌ Resposta certa: "${currentChallenge?.answer?.pt || currentChallenge?.answer?.en}"`}
              </p>
            )}

            {currentChallenge?.answer?.en && (
              <WordExplanation word={currentChallenge.answer} compact />
            )}

            <button
              className="btn btn-primary"
              onClick={nextStep}
              style={{ width: '100%', marginTop: 'var(--space-lg)', padding: 'var(--space-md)' }}>
              {step + 1 >= challenge.challenges.length ? '🎉 Finalizar Desafio' : 'Próximo →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenge;
