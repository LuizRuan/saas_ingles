import { useState, useEffect, useRef, useCallback } from 'react';
import useSound from '../../../hooks/useSound';
import useSpeech from '../../../hooks/useSpeech';
import AvatarDisplay from '../../../components/Avatar/AvatarDisplay';
import '../../../games/HangmanGame/HangmanGame.css';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Tempo simulado do bot para resolver a forca (ms) — bem mais lento que múltipla escolha
const BOT_HANGMAN_RANGE = {
  easy:   { min: 22000, max: 38000 },
  medium: { min: 11000, max: 20000 },
  hard:   { min:  5000, max: 11000 },
};

const DuelHangman = ({
  word,           // { en, pt, tip, pronunciation }
  botConfig,      // { id, accuracy, name, ... }
  roundIndex,     // 0-based
  totalRounds,
  playerScore,
  botScore,
  playerAvatar,
  onRoundEnd,     // ({ playerScoreDelta, botScoreDelta })
  confirmExit,
  onRequestExit,
  onConfirmExit,
  onCancelExit,
}) => {
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [playerState, setPlayerState] = useState('playing'); // playing | won | lost
  const [botDone, setBotDone] = useState(false);
  const [botWon, setBotWon] = useState(false);
  const roundEndCalledRef = useRef(false);
  const { playCorrect, playWrong, playClick } = useSound();
  const { speakNormal } = useSpeech();

  const wordUpper = word.en.toUpperCase();
  const isRoundOver = playerState !== 'playing';

  // ─── Bot timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    const range = BOT_HANGMAN_RANGE[botConfig.id] || BOT_HANGMAN_RANGE.medium;
    const delay = Math.random() * (range.max - range.min) + range.min;
    const timer = setTimeout(() => {
      const correct = Math.random() < botConfig.accuracy;
      setBotWon(correct);
      setBotDone(true);
    }, delay);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Se o jogador terminar e o bot ainda não respondeu, forçar resposta em 3s
  useEffect(() => {
    if (playerState === 'playing' || botDone) return;
    const timer = setTimeout(() => {
      const correct = Math.random() < botConfig.accuracy;
      setBotWon(correct);
      setBotDone(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [playerState, botDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quando ambos terminam → aguarda 2s mostrando resultado → avança rodada
  useEffect(() => {
    if (playerState === 'playing' || !botDone || roundEndCalledRef.current) return;
    roundEndCalledRef.current = true;

    const playerWon = playerState === 'won';
    // Pontuação: 100 base + até 60 de bônus por poucos erros
    const playerScoreDelta = playerWon ? 100 + Math.max(0, (MAX_WRONG - wrongCount) * 10) : 0;
    const botScoreDelta    = botWon ? 100 : 0;

    const timer = setTimeout(() => onRoundEnd({ playerScoreDelta, botScoreDelta }), 2000);
    return () => clearTimeout(timer);
  }, [playerState, botDone, botWon, wrongCount, onRoundEnd]);

  // ─── Lógica do jogo ───────────────────────────────────────────────────────
  const handleLetterGuess = useCallback((letter) => {
    if (guessedLetters.includes(letter) || playerState !== 'playing') return;

    playClick();
    speakNormal(letter);
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (!wordUpper.includes(letter)) {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) {
        setPlayerState('lost');
        playWrong();
      }
    } else {
      const allRevealed = wordUpper.split('').every(l => newGuessed.includes(l));
      if (allRevealed) {
        setPlayerState('won');
        playCorrect();
      }
    }
  }, [guessedLetters, playerState, wordUpper, wrongCount, playClick, speakNormal, playWrong, playCorrect]);

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderHangman = () => (
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

  const renderWord = () =>
    wordUpper.split('').map((letter, i) => (
      <span key={i} className={`hangman-letter ${guessedLetters.includes(letter) ? 'revealed' : ''}`}>
        {guessedLetters.includes(letter) || isRoundOver ? letter : '_'}
      </span>
    ));

  const playerScoreDelta = playerState === 'won'
    ? 100 + Math.max(0, (MAX_WRONG - wrongCount) * 10)
    : 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="duel-match-container animate-fade-in-up">

      {/* Barra de saída */}
      <div className="duel-topbar">
        {confirmExit ? (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Sair? A rodada será perdida.</span>
            <button className="btn btn-danger btn-sm" onClick={onConfirmExit}>Sair</button>
            <button className="btn btn-ghost btn-sm"  onClick={onCancelExit}>Ficar</button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onRequestExit}>✕ Sair da partida</button>
        )}
      </div>

      {/* Placar */}
      <div className="duel-scoreboard glass-card">
        <div className="player-profile player-profile--you">
          <AvatarDisplay avatar={playerAvatar || '👤'} size="sm" />
          <div className="profile-info">
            <span className="profile-name">Você</span>
            <span className="profile-score">{playerScore} pts</span>
          </div>
        </div>
        <div className="vs-badge">
          <span>VS</span>
          <small>Rodada {roundIndex + 1}/{totalRounds}</small>
        </div>
        <div className="player-profile player-profile--opponent">
          <div className="avatar">🤖</div>
          <div className="profile-info">
            <span className="profile-name">{botConfig.name}</span>
            <span className="profile-score">{botScore} pts</span>
          </div>
        </div>
      </div>

      {/* Dica */}
      <div className="hangman-hint glass-card animate-fade-in-up"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span>💡 Dica: <strong>{word.tip}</strong></span>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>❌ {wrongCount}/{MAX_WRONG}</span>
      </div>

      {/* Desenho da forca */}
      <div className="hangman-drawing">{renderHangman()}</div>

      {/* Palavra */}
      <div className="hangman-word animate-fade-in-up">{renderWord()}</div>

      {/* Banner de resultado (quando o jogador termina) */}
      {isRoundOver && (
        <div className="duel-status-bar glass-card animate-bounce-in" style={{
          marginBottom: 'var(--space-md)',
          background:   playerState === 'won' ? 'var(--bg-green-subtle)' : 'var(--bg-red-subtle)',
          border:       `1px solid ${playerState === 'won' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
        }}>
          <strong style={{ color: playerState === 'won' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {playerState === 'won'
              ? `✅ Você acertou! +${playerScoreDelta} pts`
              : `❌ A palavra era: ${word.en}`}
          </strong>
        </div>
      )}

      {/* Teclado */}
      <div className="hangman-keyboard animate-fade-in-up">
        {ALPHABET.map(letter => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = isGuessed &&  wordUpper.includes(letter);
          const isWrong   = isGuessed && !wordUpper.includes(letter);
          return (
            <button
              key={letter}
              className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              onClick={() => handleLetterGuess(letter)}
              disabled={isGuessed || isRoundOver}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Status do bot */}
      <div className="duel-status-bar glass-card" style={{ marginTop: 'var(--space-md)' }}>
        {botDone ? (
          <div className="opponent-response animate-bounce-in">
            <span>{botConfig.name} terminou:</span>
            <strong className={botWon ? 'text-green' : 'text-red'}>
              {botWon ? `${word.en} ✅ +100` : '❌ Errou!'}
            </strong>
          </div>
        ) : (
          <div className="opponent-thinking">
            <span className="spinner" />
            <span>{botConfig.name} está jogando a forca...</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default DuelHangman;
