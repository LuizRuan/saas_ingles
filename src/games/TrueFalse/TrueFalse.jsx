import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCourseData from '../../hooks/useCourseData';
import useUserLevel from '../../hooks/useUserLevel';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import WordExplanation from '../../components/Game/WordExplanation';
import { pickByLevel } from '../../utils/levelSelection';
import './TrueFalse.css';

const ROUNDS = 12;
const TEMPO_INICIAL = 75; // segundos para as 12 rodadas do modo cronometrado

// Os dados vêm do CURSO ATIVO (useCourseData), nunca do banco de inglês
// importado direto — senão trocar para espanhol mantinha o jogo em inglês.
// Enviesado pelo nível do jogador em vez de sortear uniformemente do banco
// inteiro — ver levelSelection.js sobre o porquê.
const generateQuestions = (trueFalse, userLevel, maxLevel) => pickByLevel(trueFalse, userLevel, maxLevel, ROUNDS);

const TrueFalse = () => {
  const { trueFalse, words } = useCourseData();
  const { userLevel, maxLevel } = useUserLevel();
  const [questions, setQuestions] = useState(() => generateQuestions(trueFalse, userLevel, maxLevel));
  const [modo, setModo] = useState(null); // null = tela de escolha | 'calmo' | 'contrarelogio'
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [tempoEsgotado, setTempoEsgotado] = useState(false);
  const [tempo, setTempo] = useState(TEMPO_INICIAL);
  const { progress, handleCorrectAnswer, handleWrongAnswer, completeGame, consumeExtraTime } = useProgress();
  const { playCorrect, playWrong } = useSound();

  const current = questions[round];
  const cronometrado = modo === 'contrarelogio';

  // O relógio pausa durante o feedback: ali o jogador está lendo a explicação da
  // palavra, que é o momento de ensino. Cobrar tempo disso puniria estudar.
  useEffect(() => {
    if (!cronometrado || gameComplete || feedback) return;
    const id = setInterval(() => setTempo(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [cronometrado, gameComplete, feedback]);

  // Fim por tempo em efeito separado, e não dentro do updater acima: o
  // StrictMode invoca updaters duas vezes, então eles precisam ficar puros.
  useEffect(() => {
    if (!cronometrado || gameComplete || tempo > 0) return;
    setTempoEsgotado(true);
    setGameComplete(true);
  }, [cronometrado, gameComplete, tempo]);

  const usarTempoExtra = useCallback(() => {
    const segundos = consumeExtraTime();
    if (segundos > 0) setTempo(t => t + segundos);
  }, [consumeExtraTime]);

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

  if (modo === null) {
    return (
      <div className="page">
        <div className="container game-container">
          <div className="game-header animate-fade-in">
            <div className="game-title">
              <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
              <img src="/truefalse-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
              <h2>Verdadeiro ou Falso</h2>
            </div>
          </div>

          <p className="text-secondary text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            Como você quer jogar?
          </p>

          <div className="tf-modes animate-fade-in-up">
            <button className="glass-card tf-mode" onClick={() => setModo('calmo')}>
              <span className="tf-mode-icon">🧘</span>
              <strong>Tranquilo</strong>
              <span className="text-secondary">Sem cronômetro. Responda no seu ritmo.</span>
            </button>

            <button className="glass-card tf-mode" onClick={() => setModo('contrarelogio')}>
              <span className="tf-mode-icon">⏱️</span>
              <strong>Contra o Relógio</strong>
              <span className="text-secondary">
                {TEMPO_INICIAL}s para as {questions.length} rodadas. O relógio pausa enquanto
                você lê a explicação.
              </span>
              <span className="badge badge-purple" style={{ marginTop: 'var(--space-sm)' }}>
                ⏰ {progress.extraTimeAvailable || 0} usos de Tempo Extra
              </span>
            </button>
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
            <span style={{ fontSize: '4rem' }}>{tempoEsgotado ? '⏰' : '🎉'}</span>
            <h2>{tempoEsgotado ? 'Tempo esgotado!' : 'Parabéns!'}</h2>
            {tempoEsgotado && (
              <p className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
                Você guardou os pontos que já tinha feito. O bônus de conclusão fica
                para quando terminar as {questions.length} rodadas.
              </p>
            )}
            <div className="result-stats">
              <div className="result-stat"><span className="result-stat-value">{correctCount}/{questions.length}</span><span className="result-stat-label">Acertos</span></div>
              <div className="result-stat"><span className="result-stat-value">{score}</span><span className="result-stat-label">Pontos</span></div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => {
                setQuestions(generateQuestions(trueFalse, userLevel, maxLevel));
                setModo(null);
                setRound(0);
                setFeedback(null);
                setScore(0);
                setCorrectCount(0);
                setTempo(TEMPO_INICIAL);
                setTempoEsgotado(false);
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
            <img src="/truefalse-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Verdadeiro ou Falso</h2>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{round + 1}/{questions.length}</span></div>
            <div className="game-score-item"><span>⭐</span> <span className="value">{score}</span></div>
            {cronometrado && (
              <div className={`game-score-item tf-clock ${tempo <= 10 ? 'urgente' : ''}`}>
                <span>{feedback ? '⏸️' : '⏱️'}</span> <span className="value">{tempo}s</span>
              </div>
            )}
          </div>
        </div>

        {cronometrado && (progress.extraTimeAvailable || 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-sm)' }}>
            <button className="btn btn-secondary btn-sm" onClick={usarTempoExtra}>
              ⏰ +10s ({progress.extraTimeAvailable} {progress.extraTimeAvailable === 1 ? 'uso' : 'usos'})
            </button>
          </div>
        )}

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

            {getWordData() && <WordExplanation word={getWordData()} showTip={false} />}
            
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
