import { useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { shuffleArray } from '../data/words';
import useCourseData from '../hooks/useCourseData';
import { useProgress } from '../hooks/useProgress';
import { getWordsToReview, getPhrasesToReview } from '../utils/reviewSystem';
import useSound from '../hooks/useSound';
import WordExplanation from '../components/Game/WordExplanation';

// Normaliza para comparação: lowercase, sem pontuação nas pontas, trim.
const normalize = (s) =>
  s.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');

const ReviewErrors = () => {
  const { progress, handleCorrectAnswer, handleWrongAnswer, incrementReviewed } = useProgress();
  const { words } = useCourseData();
  const { playCorrect, playWrong } = useSound();

  // === PALAVRAS (quiz de múltipla escolha — não muda) ===
  const [reviewWords] = useState(() => getWordsToReview(progress, words));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selected, setSelected] = useState(null);

  // === FRASES (quiz de digitação — novo) ===
  const [phraseQueue, setPhraseQueue] = useState(() => getPhrasesToReview(progress));
  const [phraseInput, setPhraseInput] = useState('');
  const [phraseFeedback, setPhraseFeedback] = useState(null); // null | 'correct' | 'wrong'
  const inputRef = useRef(null);

  const currentPhrase = phraseQueue[0] || null;
  const totalPhrases = useMemo(() => getPhrasesToReview(progress).length, []);
  const phrasesReviewed = totalPhrases - phraseQueue.length;

  // --- Handlers de PALAVRA (inalterado) ---
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

  // --- Handlers de FRASE (novo) ---
  const checkPhrase = useCallback(() => {
    if (!currentPhrase || phraseFeedback) return;
    const userAnswer = normalize(phraseInput);
    const correctAnswer = normalize(currentPhrase.text);

    if (userAnswer === correctAnswer) {
      setPhraseFeedback('correct');
      handleCorrectAnswer(currentPhrase.text, 1);
      incrementReviewed();
      playCorrect();
    } else {
      setPhraseFeedback('wrong');
      handleWrongAnswer(currentPhrase.text);
      playWrong();
    }
  }, [currentPhrase, phraseInput, phraseFeedback, handleCorrectAnswer, handleWrongAnswer, incrementReviewed, playCorrect, playWrong]);

  const nextPhrase = useCallback(() => {
    if (phraseFeedback === 'correct') {
      // Acertou → remove da fila
      setPhraseQueue(prev => prev.slice(1));
    } else {
      // Errou → move pro fim da fila para tentar de novo
      setPhraseQueue(prev => [...prev.slice(1), prev[0]]);
    }
    setPhraseInput('');
    setPhraseFeedback(null);
    // Foca no input da próxima frase
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [phraseFeedback]);

  const handlePhraseKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (phraseFeedback) {
        nextPhrase();
      } else {
        checkPhrase();
      }
    }
  }, [phraseFeedback, nextPhrase, checkPhrase]);

  // === TELA: Nenhuma revisão pendente ===
  if (reviewWords.length === 0 && phraseQueue.length === 0 && currentIndex === 0) {
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

  // === TELA: Quiz de PALAVRAS (múltipla escolha — inalterado) ===
  if (currentIndex < reviewWords.length) {
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
  }

  // === TELA: Quiz de FRASES (digitação — novo) ===
  if (phraseQueue.length > 0 && currentPhrase) {
    return (
      <div className="page">
        <div className="container game-container">
          <div className="game-header animate-fade-in">
            <div className="game-title">
              <Link to="/" className="btn btn-ghost btn-sm">←</Link>
              <span className="icon">💬</span>
              <h2>Revisar Frases</h2>
            </div>
            <div className="game-score">
              <div className="game-score-item"><span>📝</span> <span className="value">{phrasesReviewed}/{totalPhrases}</span></div>
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
            <div className="progress-bar-fill" style={{ width: `${(phrasesReviewed / totalPhrases) * 100}%` }}></div>
          </div>

          <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-xl)', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
              Digite a frase correta:
            </p>
            <p style={{ fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--accent-purple-light)' }}>
              "{currentPhrase.text}"
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              Errada {currentPhrase.wrong}x
            </p>
          </div>

          <div style={{ marginBottom: 'var(--space-md)' }}>
            <input
              ref={inputRef}
              type="text"
              className="input"
              placeholder="Digite a frase aqui..."
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              onKeyDown={handlePhraseKeyDown}
              disabled={!!phraseFeedback}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              style={{
                width: '100%',
                padding: 'var(--space-md) var(--space-lg)',
                fontSize: 'var(--fs-lg)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${
                  phraseFeedback === 'correct' ? 'var(--accent-green)'
                    : phraseFeedback === 'wrong' ? 'var(--accent-red)'
                    : 'var(--border-color)'
                }`,
                background: phraseFeedback === 'correct'
                  ? 'rgba(16,185,129,0.08)'
                  : phraseFeedback === 'wrong'
                    ? 'rgba(239,68,68,0.08)'
                    : 'var(--bg-input, var(--bg-card))',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {!phraseFeedback && (
            <button
              className="btn btn-primary"
              onClick={checkPhrase}
              disabled={!phraseInput.trim()}
              style={{ width: '100%' }}
            >
              Verificar ✓
            </button>
          )}

          {phraseFeedback && (
            <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-md)' }}>
              <p style={{
                textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-md)',
                color: phraseFeedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)'
              }}>
                {phraseFeedback === 'correct'
                  ? '✅ Correto! Você lembrou!'
                  : '❌ Não foi dessa vez...'}
              </p>

              {phraseFeedback === 'wrong' && (
                <div className="glass-card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginBottom: '4px' }}>A resposta correta era:</p>
                  <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {currentPhrase.text}
                  </p>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
                    Essa frase vai voltar para você tentar de novo.
                  </p>
                </div>
              )}

              <button className="btn btn-primary" onClick={nextPhrase} style={{ width: '100%' }}>
                {phraseFeedback === 'correct' ? 'Próxima →' : 'Tentar de novo →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === TELA: Revisão concluída ===
  return (
    <div className="page">
      <div className="container game-container text-center animate-bounce-in">
        <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
          <span style={{ fontSize: '4rem' }}>✅</span>
          <h2 style={{ margin: 'var(--space-md) 0' }}>Revisão Concluída!</h2>
          <p className="text-secondary">
            Você revisou {reviewWords.length > 0 ? `${reviewWords.length} palavra${reviewWords.length === 1 ? '' : 's'}` : ''}
            {reviewWords.length > 0 && totalPhrases > 0 ? ' e ' : ''}
            {totalPhrases > 0 ? `${totalPhrases} frase${totalPhrases === 1 ? '' : 's'}` : ''}.
            Continue praticando!
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
            <Link to="/" className="btn btn-primary">← Ir para o Início</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewErrors;

