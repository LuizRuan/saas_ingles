import { useState, useCallback } from 'react';
import { AVAILABLE_COURSES } from '../../data/index';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';

// Embaralha determinístico para as 6 cartas da memória
const shuffleCards = (pairWords) => {
  const cards = pairWords.flatMap((word, idx) => [
    { id: `en-${idx}`, wordIndex: idx, text: word.en, type: 'en', word },
    { id: `pt-${idx}`, wordIndex: idx, text: word.pt, type: 'pt', word },
  ]);
  // Simple deterministic shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
};

const DailyMemoryStep = ({ challenge, stepState, onAnswer }) => {
  const { words: pairWords, answer } = challenge;
  const { playFlip, playMatch, playCorrect } = useSound();
  const { progress } = useProgress();
  // Bandeira do idioma-alvo do curso ativo — senão a carta mostra 🇺🇸 mesmo
  // para quem está estudando espanhol.
  const targetFlag = AVAILABLE_COURSES.find(c => c.id === (progress.activeCourse || 'en-pt'))?.flag || '🇺🇸';

  const [cards] = useState(() => shuffleCards(pairWords));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const handleCardClick = useCallback((card) => {
    if (stepState !== 'playing') return;
    if (flipped.includes(card.id) || matched.includes(card.id)) return;
    if (flipped.length === 2) return;

    playFlip();
    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = cards.find(c => c.id === newFlipped[0]);
      const card2 = cards.find(c => c.id === newFlipped[1]);

      if (card1.wordIndex === card2.wordIndex) {
        // Encontrou um par!
        playMatch();
        const newMatched = [...matched, card1.id, card2.id];
        setMatched(newMatched);
        setFlipped([]);

        // Se completou todos os 3 pares!
        if (newMatched.length === cards.length) {
          playCorrect();
          onAnswer(answer, answer, true);
        }
      } else {
        // Não é par: desvira após meio segundo
        setTimeout(() => setFlipped([]), 650);
      }
    }
  }, [flipped, matched, cards, stepState, playFlip, playMatch, playCorrect, onAnswer, answer]);

  return (
    <div className="daily-memory-step animate-fade-in-up">
      <div className="text-center" style={{ marginBottom: 'var(--space-md)' }}>
        <p className="daily-prompt-label">Encontre os 3 pares de palavras:</p>
        <span className="badge badge-purple">
          {matched.length / 2} de 3 pares encontrados
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-sm)',
        maxWidth: '450px',
        margin: '0 auto var(--space-lg) auto'
      }}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isFlipped || stepState !== 'playing'}
              style={{
                height: '80px',
                borderRadius: 'var(--radius-lg)',
                border: isMatched ? '2px solid var(--accent-green)' : isFlipped ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: isMatched ? 'var(--bg-green-subtle)' : isFlipped ? 'var(--gradient-card)' : 'var(--bg-card)',
                color: isMatched ? 'var(--accent-green-dark)' : 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: card.type === 'en' ? 'var(--fs-md)' : 'var(--fs-sm)',
                fontWeight: 700,
                cursor: isFlipped ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-xs)',
                textAlign: 'center',
                boxShadow: isFlipped ? 'var(--shadow-md)' : 'var(--shadow-xs)'
              }}>
              {isFlipped ? (
                <div>
                  <div>{card.text}</div>
                  <span style={{ fontSize: '10px', opacity: 0.6 }}>{card.type === 'en' ? targetFlag : '🇧🇷'}</span>
                </div>
              ) : (
                <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>❓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyMemoryStep;
