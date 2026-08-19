import { useState, useCallback } from 'react';
import useSound from '../../hooks/useSound';
import { useProgress } from '../../hooks/useProgress';
import { AVAILABLE_COURSES } from '../../data/index';

// Nome do idioma-alvo do curso ativo. Fixar "inglês" no texto fazia o
// desafio diário mandar "traduza para o inglês" para quem está estudando
// espanhol — a instrução contradizia a resposta esperada.
const nomeDoIdioma = (courseId) =>
  AVAILABLE_COURSES.find(c => c.id === courseId)?.targetName || 'Inglês';

// Normaliza string para comparação (remove pontuação final e espaço extra)
const normalize = (str) => (str || '').toLowerCase().replace(/[.,?!]/g, '').trim();

const stripPunctuation = (str) => (str || '').replace(/[.,?!:;'"“”]/g, '').trim();

const DailySentenceBuilderStep = ({ challenge, stepState, onAnswer }) => {
  const { progress } = useProgress();
  const idioma = nomeDoIdioma(progress?.activeCourse || 'en-pt');
  const { sentence, answer } = challenge;
  const { playClick, playCorrect, playWrong } = useSound();

  const [availableWords, setAvailableWords] = useState(() => {
    const rawWords = (sentence?.en || '').split(' ');
    const items = rawWords.map((w, i) => ({ id: i, word: stripPunctuation(w) })).filter(item => item.word.length > 0);
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });

  const [selectedWords, setSelectedWords] = useState([]);

  const handlePickWord = useCallback((item) => {
    if (stepState !== 'playing') return;
    playClick();
    setSelectedWords(prev => [...prev, item]);
    setAvailableWords(prev => prev.filter(w => w.id !== item.id));
  }, [stepState, playClick]);

  const handleRemoveWord = useCallback((item) => {
    if (stepState !== 'playing') return;
    playClick();
    setSelectedWords(prev => prev.filter(w => w.id !== item.id));
    setAvailableWords(prev => [...prev, item]);
  }, [stepState, playClick]);

  const handleSubmit = useCallback(() => {
    if (stepState !== 'playing' || selectedWords.length === 0) return;

    const formedSentence = selectedWords.map(w => w.word).join(' ');
    const isCorrect = normalize(formedSentence) === normalize(sentence.en);

    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }
    onAnswer({ en: formedSentence }, answer, isCorrect);
  }, [selectedWords, sentence?.en, stepState, playCorrect, playWrong, onAnswer, answer]);

  return (
    <div className="daily-sentence-builder-step animate-fade-in-up text-center">
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', display: 'block' }}>
          Monte a frase em {idioma.toLowerCase()}:
        </span>
        <h2 style={{ fontSize: '2rem', color: 'var(--accent-purple-light)', margin: 'var(--space-xs) 0' }}>
          {sentence?.pt}
        </h2>
      </div>

      {/* Caixa da Frase Montada */}
      <div style={{
        minHeight: '64px',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-xl)',
        border: selectedWords.length > 0 ? '2px solid var(--accent-purple)' : '2px dashed var(--border-color)',
        background: 'var(--bg-card)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        {selectedWords.length === 0 ? (
          <span className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            Clique nos blocos abaixo para montar a frase...
          </span>
        ) : (
          selectedWords.map((item) => (
            <button
              key={item.id}
              onClick={() => handleRemoveWord(item)}
              disabled={stepState !== 'playing'}
              style={{
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-purple-subtle)',
                border: '1px solid var(--accent-purple)',
                color: 'var(--accent-purple-light)',
                fontWeight: 700,
                fontSize: 'var(--fs-md)',
                cursor: 'pointer'
              }}>
              {item.word} ✕
            </button>
          ))
        )}
      </div>

      {/* Palavras disponíveis para clicar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
        {availableWords.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePickWord(item)}
            disabled={stepState !== 'playing'}
            style={{
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 'var(--fs-md)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}>
            {item.word}
          </button>
        ))}
      </div>

      {stepState === 'playing' && (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={selectedWords.length === 0}
          style={{ width: '100%', maxWidth: '300px' }}>
          ✓ Verificar Frase
        </button>
      )}
    </div>
  );
};

export default DailySentenceBuilderStep;
