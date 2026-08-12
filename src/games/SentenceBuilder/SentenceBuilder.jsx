import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { sentences } from '../../data/sentences';
import { shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import './SentenceBuilder.css';

const ROUNDS = 8;

const stripPunctuation = (str) => (str || '').replace(/[.,?!:;'"“”]/g, '').trim();

const generateGameSentences = () => shuffleArray([...sentences]).slice(0, ROUNDS);

const prepareWords = (s) => (s ? shuffleArray(s.words.map((w, i) => ({ ...w, en: stripPunctuation(w.en), id: i }))) : []);

const SentenceBuilder = () => {
  const [gameSentences, setGameSentences] = useState(() => generateGameSentences());
  const [round, setRound] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(() => prepareWords(gameSentences[0]));
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeSentence, completeGame } = useProgress();
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal, speakSlow } = useSpeech();

  const currentSentence = gameSentences[round];

  const setupRound = useCallback((roundIdx) => {
    const s = gameSentences[roundIdx];
    if (!s) { setGameComplete(true); completeGame('sentenceBuilder'); return; }
    setSelectedWords([]);
    setAvailableWords(prepareWords(s));
    setFeedback(null);
  }, [gameSentences, completeGame]);

  const handleWordClick = useCallback((wordObj) => {
    if (feedback) return;
    playClick();
    speakNormal(wordObj.en);
    const newSelected = [...selectedWords, wordObj];
    setSelectedWords(newSelected);
    setAvailableWords(prev => prev.filter(w => w.id !== wordObj.id));

    // Check if sentence is complete
    if (newSelected.length === currentSentence.words.length) {
      const formed = newSelected.map(w => stripPunctuation(w.en)).join(' ');
      const correct = currentSentence.words.map(w => stripPunctuation(w.en)).join(' ');
      
      if (formed.toLowerCase() === correct.toLowerCase()) {
        setFeedback('correct');
        playCorrect();
        setScore(prev => prev + 10);
        handleCorrectAnswer(currentSentence.en, 1);
        completeSentence();
      } else {
        setFeedback('wrong');
        playWrong();
        handleWrongAnswer(currentSentence.en);
      }
    }
  }, [feedback, selectedWords, currentSentence, playClick, speakNormal, playCorrect, playWrong, handleCorrectAnswer, handleWrongAnswer, completeSentence]);

  const handleRemoveWord = useCallback((wordObj, index) => {
    if (feedback) return;
    speakNormal(wordObj.en);
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, wordObj]);
  }, [feedback, speakNormal]);

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
            <p className="text-secondary">Você montou {ROUNDS} frases!</p>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{score}</span>
                <span className="result-stat-label">Pontos</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => {
                const newSentences = generateGameSentences();
                setGameSentences(newSentences);
                setRound(0);
                setScore(0);
                setGameComplete(false);
                const s = newSentences[0];
                setSelectedWords([]);
                setAvailableWords(prepareWords(s));
                setFeedback(null);
              }}>🔄 Jogar novamente</button>
              <Link to="/games" className="btn btn-ghost">← Outros jogos</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSentence) return null;

  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <img src="/sentencebuilder-icon.webp" alt="" className="icon" style={{ width: '1.25rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            <h2>Montar Frases</h2>
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
          <div className="progress-bar-fill" style={{ width: `${(round / ROUNDS) * 100}%` }}></div>
        </div>

        {/* Translation */}
        <div className="sb-prompt glass-card animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🇧🇷</span>
            <div>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Monte esta frase em inglês:</div>
              <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 600 }}>"{currentSentence.pt}"</div>
            </div>
          </div>
        </div>

        {/* Answer area */}
        <div className={`sb-answer ${feedback === 'correct' ? 'correct' : ''} ${feedback === 'wrong' ? 'wrong' : ''}`}>
          {selectedWords.length === 0 && (
            <span className="sb-placeholder">Toque nas palavras abaixo para montar a frase</span>
          )}
          {selectedWords.map((word, i) => (
            <button key={`sel-${word.id}`} className="sb-word-chip selected"
              onClick={() => handleRemoveWord(word, i)}>
              {word.en.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Available words */}
        {!feedback && (
          <div className="sb-words animate-fade-in-up">
            {availableWords.map((word) => (
              <button key={`av-${word.id}`} className="sb-word-chip available"
                onClick={() => handleWordClick(word)}>
                {word.en.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="sb-feedback animate-fade-in-up">
            {feedback === 'correct' ? (
              <div className="sb-correct">
                <h3 style={{ color: 'var(--accent-green)' }}>✅ Correto!</h3>
                <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, margin: 'var(--space-sm) 0' }}>
                  "{currentSentence.en}"
                </p>
                <p className="text-secondary">"{currentSentence.pt}"</p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => speakNormal(currentSentence.en)}>
                    🔊 Ouvir
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => speakSlow(currentSentence.en)}>
                    🐌 Devagar
                  </button>
                </div>
              </div>
            ) : (
              <div className="sb-wrong">
                <h3 style={{ color: 'var(--accent-orange)' }}>Quase! A ordem correta é:</h3>
                <p style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, margin: 'var(--space-sm) 0' }}>
                  "{currentSentence.en}"
                </p>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>"{currentSentence.pt}"</p>
              </div>
            )}
            
            {/* Grammar explanation */}
            <div className="sb-grammar glass-card">
              <h4>📚 Estrutura da frase:</h4>
              <div className="sb-word-breakdown">
                {currentSentence.words.map((w, i) => (
                  <div key={i} className="sb-word-item">
                    <span className="sb-word-en">{w.en}</span>
                    <span className="sb-word-arrow">→</span>
                    <span className="sb-word-pt">{w.pt}</span>
                  </div>
                ))}
              </div>
              {currentSentence.grammar && (
                <p className="sb-grammar-note">💡 {currentSentence.grammar}</p>
              )}
            </div>

            <button className="btn btn-primary" onClick={nextRound}
              style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima frase →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;
