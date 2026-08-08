import { useState, useEffect, useRef } from 'react';
import useSound from '../../../hooks/useSound';
import useSpeech from '../../../hooks/useSpeech';
import '../../../games/HangmanGame/HangmanGame.css';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Desenho progressivo da forca — mesmo SVG do modo Bot (DuelHangman.jsx),
// parametrizado por wrongCount em vez de ler de state local.
const renderHangman = (wrongCount) => (
  <svg viewBox="0 0 200 250" className="hangman-svg">
    <line x1="20" y1="230" x2="180" y2="230" stroke="var(--text-muted)" strokeWidth="3" />
    <line x1="60" y1="230" x2="60" y2="20"  stroke="var(--text-muted)" strokeWidth="3" />
    <line x1="60" y1="20"  x2="130" y2="20"  stroke="var(--text-muted)" strokeWidth="3" />
    <line x1="130" y1="20"  x2="130" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
    {wrongCount >= 1 && <circle cx="130" cy="65"  r="15"  stroke="var(--accent-red)" strokeWidth="3" fill="none" className="animate-fade-in" />}
    {wrongCount >= 2 && <line x1="130" y1="80"  x2="130" y2="150" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 3 && <line x1="130" y1="100" x2="100" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 4 && <line x1="130" y1="100" x2="160" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 5 && <line x1="130" y1="150" x2="105" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 6 && <line x1="130" y1="150" x2="155" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
  </svg>
);

/**
 * Forca online: mesma aparência do modo Bot (forca desenhada, teclado A-Z),
 * mas cada chute de letra vai pro servidor (hangman:guess) — a palavra
 * nunca existe neste componente, só o que já foi revelado pelos acks.
 * Sem limite de erros que force perda antecipada: dá pra tentar letras até
 * acertar a palavra toda ou o tempo da rodada (compartilhado, 20s) acabar.
 */
const OnlineHangman = ({ tip, wordTemplate, duel, onAnswer }) => {
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal } = useSpeech();
  const [correctLetters, setCorrectLetters] = useState(new Set());
  const [wrongLetters, setWrongLetters] = useState(new Set());
  const [positions, setPositions] = useState({}); // { [índice]: letra }
  const answeredRef = useRef(false);

  const handleGuess = (letter) => {
    if (answeredRef.current || correctLetters.has(letter) || wrongLetters.has(letter)) return;
    playClick();
    speakNormal(letter);
    duel.guessLetter(letter, (ack) => {
      if (!ack?.ok) return; // rodada fechou / já tentada — o servidor já recusou, nada a fazer aqui
      if (ack.inWord) {
        playCorrect();
        setCorrectLetters(prev => new Set(prev).add(letter));
        setPositions(prev => {
          const next = { ...prev };
          for (const pos of ack.positions) next[pos] = letter;
          return next;
        });
      } else {
        playWrong();
        setWrongLetters(prev => new Set(prev).add(letter));
      }
    });
  };

  // Assim que todas as posições mascaradas do template forem reveladas,
  // monta a palavra e entrega pro pai — mesmo fluxo de handleAnswer usado
  // pelos outros tipos de jogo (fecha a rodada via round:answer).
  useEffect(() => {
    if (answeredRef.current) return;
    const chars = wordTemplate.split('');
    const done = chars.every((ch, i) => ch !== '#' || positions[i] !== undefined);
    if (!done) return;
    answeredRef.current = true;
    const word = chars.map((ch, i) => (ch === '#' ? positions[i] : ch)).join('');
    onAnswer(word);
  }, [positions, wordTemplate, onAnswer]);

  const wrongCount = wrongLetters.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
      <div className="question-card glass-card" style={{ width: '100%' }}>
        <span className="question-label">🎯 Dica:</span>
        <p style={{ fontSize: 'var(--fs-lg)', fontStyle: 'italic', textAlign: 'center' }}>"{tip}"</p>
      </div>

      <div className="hangman-drawing">{renderHangman(wrongCount)}</div>

      <div className="hangman-word animate-fade-in-up">
        {wordTemplate.split('').map((ch, i) => (
          ch === '#'
            ? (
              <span key={i} className={`hangman-letter ${positions[i] ? 'revealed' : ''}`}>
                {positions[i] || '_'}
              </span>
            )
            : (
              <span key={i} className="hangman-letter hangman-letter--literal">
                {ch === ' ' ? ' ' : ch}
              </span>
            )
        ))}
      </div>

      <div className="hangman-keyboard animate-fade-in-up">
        {ALPHABET.map(letter => {
          const isCorrect = correctLetters.has(letter);
          const isWrong = wrongLetters.has(letter);
          return (
            <button
              key={letter}
              className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              onClick={() => handleGuess(letter)}
              disabled={isCorrect || isWrong || answeredRef.current}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineHangman;
