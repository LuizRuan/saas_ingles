/**
 * ImageQuiz — "Jogo da Imagem": mostra um emoji grande representando uma
 * palavra e 4 opções em inglês, sempre do MESMO grupo visual da resposta
 * certa (ex.: a imagem de um cachorro só aparece ao lado de outros animais,
 * nunca de uma cor ou uma peça de roupa) — isso é o que torna as opções
 * "sempre parecidas" em vez de 3 distratores aleatórios óbvios.
 *
 * Dificuldade sobe em DOIS eixos, escolhidos de propósito para nunca deixar
 * a imagem ilegível (um emoji borrado seria frustrante, não desafiador):
 *  - o nível mínimo do vocabulário sorteado sobe a cada rodada (palavras
 *    mais avançadas depois);
 *  - a imagem fica menor e o tempo de resposta encolhe.
 * Os distratores NÃO são filtrados por nível — são só texto (o jogador nunca
 * vê o nível deles), então a única coisa que importa ali é pertencer à mesma
 * categoria visual da imagem.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { imageWords } from '../../data/imageWords';
import { shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import './ImageQuiz.css';

const DIFFICULTIES = [
  { id: 'easy',   label: 'Fácil',   icon: '🌱', rounds: 8,  levelRange: [1, 20],  sizeRange: [112, 84], timeRange: [14, 10] },
  { id: 'medium', label: 'Médio',   icon: '⚡', rounds: 10, levelRange: [10, 35], sizeRange: [96, 68],  timeRange: [11, 7] },
  { id: 'hard',   label: 'Difícil', icon: '🔥', rounds: 12, levelRange: [20, 50], sizeRange: [86, 56],  timeRange: [8, 5] },
];

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

/**
 * Monta as rodadas de uma partida inteira de uma vez, no início — nunca
 * dentro do render. A mesma regra do dailyChallenge.js: sortear de novo a
 * cada re-render trocaria as opções debaixo do jogador no meio do clique.
 * Exportada para o teste de unidade poder conferir as garantias sem montar
 * o componente inteiro.
 */
export const buildRounds = (difficulty) => {
  const { rounds, levelRange, sizeRange, timeRange } = difficulty;
  const used = new Set();
  const result = [];

  for (let i = 0; i < rounds; i++) {
    const t = rounds > 1 ? i / (rounds - 1) : 0;
    const levelCap = lerp(levelRange[0], levelRange[1], t);
    const imageSize = lerp(sizeRange[0], sizeRange[1], t);
    const timeSec = lerp(timeRange[0], timeRange[1], t);

    // Alvo: respeita o teto de nível da rodada. Se essa faixa já estiver
    // esgotada (partida longa, poucas palavras naquele nível), cai pra
    // "qualquer uma ainda não usada" em vez de travar a rodada.
    let pool = imageWords.filter((w) => w.word.level <= levelCap && !used.has(w.en));
    if (pool.length === 0) pool = imageWords.filter((w) => !used.has(w.en));
    if (pool.length === 0) pool = imageWords;

    const target = shuffleArray(pool)[0];
    used.add(target.en);

    // Distratores: SEMPRE da mesma categoria visual, sem filtro de nível —
    // são só texto, o jogador nunca vê o nível deles.
    const sameCategory = shuffleArray(
      imageWords.filter((w) => w.category === target.category && w.en !== target.en)
    );
    let distractors = sameCategory.slice(0, 3);
    if (distractors.length < 3) {
      const usedEn = new Set([target.en, ...distractors.map((d) => d.en)]);
      const fillers = shuffleArray(imageWords.filter((w) => !usedEn.has(w.en)));
      distractors = [...distractors, ...fillers].slice(0, 3);
    }

    const options = shuffleArray([target, ...distractors]).map((w) => w.en);
    result.push({ target, options, imageSize, timeSec });
  }

  return result;
};

const ImageQuiz = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong } = useSound();
  const { speakNormal } = useSpeech();

  // Evita dupla contagem: um clique bem na hora em que o tempo esgota não
  // pode disparar handleAnswer E o timeout ao mesmo tempo.
  const submittedRef = useRef(false);
  const current = rounds[roundIndex];

  const startGame = useCallback((diff) => {
    setDifficulty(diff);
    setRounds(buildRounds(diff));
    setRoundIndex(0);
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setCorrectCount(0);
    setGameComplete(false);
  }, []);

  // Reseta o cronômetro sempre que uma rodada nova começa.
  useEffect(() => {
    if (!current) return;
    submittedRef.current = false;
    setTimeLeft(current.timeSec);
  }, [roundIndex, current]);

  const handleAnswer = useCallback((option) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSelected(option);
    speakNormal(option);
    if (option === current.target.en) {
      setFeedback('correct');
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      handleCorrectAnswer(current.target.en, 1);
      playCorrect();
    } else {
      setFeedback('wrong');
      handleWrongAnswer(current.target.en);
      playWrong();
    }
  }, [current, speakNormal, handleCorrectAnswer, handleWrongAnswer, playCorrect, playWrong]);

  // Cronômetro da rodada — pausa durante o feedback, o momento em que o
  // jogador está lendo a explicação da palavra (mesma regra do TrueFalse
  // cronometrado: cobrar tempo disso puniria estudar).
  useEffect(() => {
    if (!current || feedback || gameComplete) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!submittedRef.current) {
            submittedRef.current = true;
            setFeedback('wrong');
            handleWrongAnswer(current.target.en);
            playWrong();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [roundIndex, feedback, gameComplete, current, handleWrongAnswer, playWrong]);

  const nextRound = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= rounds.length) {
      setGameComplete(true);
      completeGame('imageQuiz');
    } else {
      setRoundIndex(next);
      setSelected(null);
      setFeedback(null);
    }
  }, [roundIndex, rounds.length, completeGame]);

  const optionClass = (opt) => {
    if (!feedback || !current) return '';
    if (opt === current.target.en) return 'correct';
    if (opt === selected) return 'wrong';
    return 'dimmed';
  };

  // ── Tela de dificuldade ──────────────────────────────────────────────────
  if (!difficulty) {
    return (
      <div className="page">
        <div className="container game-container">
          <div className="text-center animate-fade-in-up">
            <Link to="/games" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>
              ← Voltar
            </Link>
            <h1 style={{ marginBottom: 'var(--space-sm)' }}>🖼️ Jogo da Imagem</h1>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-2xl)' }}>
              Veja a imagem e escolha a palavra certa em inglês entre 4 opções parecidas!
            </p>

            <div className="iq-difficulty-grid">
              {DIFFICULTIES.map((diff) => (
                <button key={diff.id} className="glass-card iq-difficulty-card" onClick={() => startGame(diff)}>
                  <span className="iq-diff-icon">{diff.icon}</span>
                  <span className="iq-diff-label">{diff.label}</span>
                  <span className="iq-diff-info">{diff.rounds} rodadas</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Tela de resultado ────────────────────────────────────────────────────
  if (gameComplete) {
    return (
      <div className="page">
        <div className="container game-container text-center animate-bounce-in">
          <div className="game-result-card glass-card">
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h2>Parabéns!</h2>
            <p className="text-secondary">Você completou o Jogo da Imagem no nível {difficulty.label}!</p>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-value">{correctCount}/{rounds.length}</span>
                <span className="result-stat-label">Acertos</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-value">{score}</span>
                <span className="result-stat-label">Pontos</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-primary" onClick={() => startGame(difficulty)}>
                🔄 Jogar novamente
              </button>
              <button className="btn btn-secondary" onClick={() => setDifficulty(null)}>
                Mudar dificuldade
              </button>
              <Link to="/games" className="btn btn-ghost">
                ← Outros jogos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  // ── Tela de jogo ─────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container game-container">
        <div className="game-header animate-fade-in">
          <div className="game-title">
            <Link to="/games" className="btn btn-ghost btn-sm">←</Link>
            <span className="icon">🖼️</span>
            <h2>Jogo da Imagem</h2>
            <span className="badge badge-purple">{difficulty.label}</span>
          </div>
          <div className="game-score">
            <div className="game-score-item"><span>📝</span> <span className="value">{roundIndex + 1}/{rounds.length}</span></div>
            <div className="game-score-item"><span>⭐</span> <span className="value">{score}</span></div>
            <div className={`game-score-item iq-clock ${timeLeft <= 3 ? 'urgente' : ''}`}>
              <span>{feedback ? '⏸️' : '⏱️'}</span> <span className="value">{timeLeft}s</span>
            </div>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="progress-bar-fill" style={{ width: `${(roundIndex / rounds.length) * 100}%` }}></div>
        </div>

        <div className="iq-image-card glass-card animate-fade-in-up">
          <span className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>O que é isso em inglês?</span>
          <img
            className="iq-image"
            src={current.target.icon}
            alt=""
            style={{ width: `${current.imageSize}px`, height: `${current.imageSize}px` }}
          />
        </div>
        <p className="text-secondary iq-credit">
          Ícones: <a href="https://openmoji.org" target="_blank" rel="noopener noreferrer">OpenMoji</a> (CC BY-SA 4.0)
        </p>

        <div className="iq-options">
          {current.options.map((opt, i) => (
            <button
              key={opt}
              className={`iq-option glass-card ${optionClass(opt)}`}
              onClick={() => handleAnswer(opt)}
              disabled={!!feedback}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="iq-option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            <p style={{ textAlign: 'center', fontWeight: 600, marginBottom: 'var(--space-md)',
              color: feedback === 'correct' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
              {feedback === 'correct' ? '✅ Correto!' : selected ? '❌ Quase!' : '⏰ O tempo acabou!'}
            </p>
            <WordExplanation word={current.target.word} showTip={false} />
            <button className="btn btn-primary" onClick={nextRound} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageQuiz;
