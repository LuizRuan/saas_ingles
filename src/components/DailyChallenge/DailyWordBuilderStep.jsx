import { useState, useCallback } from 'react';
import useSound from '../../hooks/useSound';
import { useProgress } from '../../hooks/useProgress';
import { AVAILABLE_COURSES } from '../../data/index';

// Nome do idioma-alvo do curso ativo. Fixar "inglês" no texto fazia o
// desafio diário mandar "traduza para o inglês" para quem está estudando
// espanhol — a instrução contradizia a resposta esperada.
const nomeDoIdioma = (courseId) =>
  AVAILABLE_COURSES.find(c => c.id === courseId)?.targetName || 'Inglês';

// Embaralha as letras da palavra com id único para cada letra
const makeLetters = (wordEn) => {
  const target = (wordEn || '').toUpperCase();
  const letters = target.split('').map((char, i) => ({ id: i, char }));
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  if (letters.map(l => l.char).join('') === target && target.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
  }
  return letters;
};

const DailyWordBuilderStep = ({ challenge, stepState, onAnswer }) => {
  const { progress } = useProgress();
  const idioma = nomeDoIdioma(progress?.activeCourse || 'en-pt');
  const { answer } = challenge;
  const targetWord = (answer?.en || '').toUpperCase();
  const { playClick, playCorrect, playWrong } = useSound();

  const [availableLetters, setAvailableLetters] = useState(() => makeLetters(answer.en));
  const [selectedSlots, setSelectedSlots] = useState(() => new Array(targetWord.length).fill(null));

  const handleTileClick = useCallback((letterObj) => {
    if (stepState !== 'playing') return;
    playClick();

    // Encontra a primeira posição vazia
    const emptyIndex = selectedSlots.findIndex(s => s === null);
    if (emptyIndex === -1) return;

    const newSlots = [...selectedSlots];
    newSlots[emptyIndex] = letterObj;
    setSelectedSlots(newSlots);

    const newAvailable = availableLetters.filter(l => l.id !== letterObj.id);
    setAvailableLetters(newAvailable);

    // Se preencheu todos os slots, avalia a resposta
    if (newSlots.every(s => s !== null)) {
      const formedWord = newSlots.map(s => s.char).join('');
      const isCorrect = formedWord === targetWord;
      if (isCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
      onAnswer({ en: formedWord }, answer, isCorrect);
    }
  }, [selectedSlots, availableLetters, targetWord, stepState, playClick, playCorrect, playWrong, onAnswer, answer]);

  const handleSlotClick = useCallback((slotIndex) => {
    if (stepState !== 'playing') return;
    const item = selectedSlots[slotIndex];
    if (!item) return;
    playClick();

    const newSlots = [...selectedSlots];
    newSlots[slotIndex] = null;
    setSelectedSlots(newSlots);

    setAvailableLetters(prev => [...prev, item]);
  }, [selectedSlots, stepState, playClick]);

  return (
    <div className="daily-word-builder-step animate-fade-in-up text-center">
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '1.25rem', display: 'block', color: 'var(--text-secondary)' }}>
          Traduza para o {idioma.toLowerCase()}:
        </span>
        <h2 style={{ fontSize: '2.25rem', color: 'var(--accent-purple-light)', margin: 'var(--space-xs) 0' }}>
          {answer.pt}
        </h2>
      </div>

      {/* Slots de resposta */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        {selectedSlots.map((slot, idx) => (
          <button
            key={idx}
            onClick={() => handleSlotClick(idx)}
            disabled={!slot || stepState !== 'playing'}
            style={{
              width: '46px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              border: slot ? '2px solid var(--accent-purple)' : '2px dashed var(--border-color)',
              background: slot ? 'var(--bg-card)' : 'transparent',
              color: 'var(--accent-purple-light)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.75rem',
              fontWeight: 700,
              cursor: slot && stepState === 'playing' ? 'pointer' : 'default'
            }}>
            {slot ? slot.char : ''}
          </button>
        ))}
      </div>

      {/* Peças de letras embaralhadas */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '400px', margin: '0 auto' }}>
        {availableLetters.map((letterObj) => (
          <button
            key={letterObj.id}
            onClick={() => handleTileClick(letterObj)}
            disabled={stepState !== 'playing'}
            style={{
              width: '44px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--gradient-card)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}>
            {letterObj.char}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyWordBuilderStep;
