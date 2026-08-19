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
import { shuffleArray } from '../../data/words';
import { useProgress } from '../../hooks/useProgress';
import useCourseData from '../../hooks/useCourseData';
import useSound from '../../hooks/useSound';
import useSpeech from '../../hooks/useSpeech';
import WordExplanation from '../../components/Game/WordExplanation';
import './ImageQuiz.css';

// `levelSpan` é uma faixa RELATIVA (0 a 1) dentro dos níveis que o banco de
// imagens do curso realmente tem — não níveis absolutos.
//
// Absoluto não funciona com mais de um idioma: as imagens do inglês cobrem os
// níveis 3 a 50, as do espanhol 2 a 8. Um `[20, 50]` fixo significa "as mais
// difíceis" no inglês e "todas elas" no espanhol, onde nada chega a 20.
const DIFFICULTIES = [
  { id: 'easy',   label: 'Fácil',   icon: '🌱', rounds: 8,  levelSpan: [0, 0.45],    sizeRange: [260, 220], timeRange: [14, 10] },
  { id: 'medium', label: 'Médio',   icon: '⚡', rounds: 10, levelSpan: [0.2, 0.75],  sizeRange: [240, 190], timeRange: [11, 7] },
  { id: 'hard',   label: 'Difícil', icon: '🔥', rounds: 12, levelSpan: [0.45, 1],    sizeRange: [220, 170], timeRange: [8, 5] },
];

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

// Nível da palavra por trás da imagem. As entradas de imageWords guardam o
// objeto completo em `.word` (ver data/imageWords.js), então o nível NÃO está
// no topo da entrada.
const nivelDe = (item) => item?.word?.level || 1;

/**
 * Monta as rodadas de uma partida inteira de uma vez, no início — nunca
 * dentro do render. A mesma regra do dailyChallenge.js: sortear de novo a
 * cada re-render trocaria as opções debaixo do jogador no meio do clique.
 * Exportada para o teste de unidade poder conferir as garantias sem montar
 * o componente inteiro.
 */
// `items` é OBRIGATÓRIO de propósito. Antes tinha o banco de inglês como
// valor padrão, e um chamador que esquecesse de passar as imagens do curso
// recebia inglês silenciosamente — que é exatamente o bug que já aconteceu
// aqui (o componente importava useCourseData e nunca o chamava).
export const buildRounds = (difficulty, items) => {
  const { rounds, levelSpan, sizeRange, timeRange } = difficulty;
  const used = new Set();
  const result = [];

  // Converte a faixa relativa nos níveis que ESTE banco tem, começando do
  // menor nível existente e nunca de 1: no banco de imagens do inglês a
  // palavra mais fácil é nível 3, então qualquer corte em 1 esvaziaria o
  // sorteio e cairia direto no fallback — o que mascarava este eixo inteiro.
  const niveis = items.map(nivelDe);
  const nivelMin = Math.min(...niveis);
  const nivelMax = Math.max(...niveis);
  const nivelEm = (fracao) => Math.round(nivelMin + (nivelMax - nivelMin) * fracao);

  for (let i = 0; i < rounds; i++) {
    const t = rounds > 1 ? i / (rounds - 1) : 0;
    const levelFloor = nivelEm(levelSpan[0] + (levelSpan[1] - levelSpan[0]) * t);
    const imageSize = lerp(sizeRange[0], sizeRange[1], t);
    const timeSec = lerp(timeRange[0], timeRange[1], t);

    // Alvo: nível MÍNIMO subindo a cada rodada, que é o que o cabeçalho deste
    // arquivo sempre descreveu. Se a faixa esgotar (partida longa, poucas
    // palavras naquele nível), cai pra "qualquer uma ainda não usada" em vez
    // de travar a rodada.
    //
    // Duas coisas estavam erradas aqui e se escondiam uma na outra:
    //  1. o nível era lido de `w.level`, que não existe nas entradas de
    //     imageWords (mora em `w.word.level`) — o filtro dava sempre
    //     verdadeiro e não fazia nada;
    //  2. o corte era um TETO (`<=`), e teto que sobe não deixa a partida mais
    //     difícil: o pool só cresce, e como as palavras fáceis são a maioria,
    //     o sorteio aleatório continuava caindo nelas até o fim.
    const disponiveis = items.filter((w) => !used.has(w.word || w.en));
    let pool = disponiveis.filter((w) => nivelDe(w) >= levelFloor);

    // Fallback GRADUAL. Quando o banco não tem mais nada naquele piso — o
    // espanhol só tem 6 imagens de nível 7+, e "Difícil" pede 12 rodadas —,
    // pega as mais avançadas que ainda restam em vez de abrir para o banco
    // inteiro. Abrir tudo derrubava a dificuldade de volta ao começo, porque
    // as palavras fáceis são a maioria e o sorteio é aleatório.
    if (pool.length === 0 && disponiveis.length > 0) {
      const maiorNivel = Math.max(...disponiveis.map(nivelDe));
      pool = disponiveis.filter((w) => nivelDe(w) === maiorNivel);
    }
    if (pool.length === 0) pool = items;

    const target = shuffleArray(pool)[0];
    const targetKey = target.word || target.en;
    used.add(targetKey);

    // Distratores: SEMPRE da mesma categoria visual, sem filtro de nível —
    // são só texto, o jogador nunca vê o nível deles.
    const sameCategory = shuffleArray(
      items.filter((w) => w.category === target.category && (w.word || w.en) !== targetKey)
    );
    let distractors = sameCategory.slice(0, 3);
    if (distractors.length < 3) {
      const usedEn = new Set([targetKey, ...distractors.map((d) => d.word || d.en)]);
      const fillers = shuffleArray(items.filter((w) => !usedEn.has(w.word || w.en)));
      distractors = [...distractors, ...fillers].slice(0, 3);
    }

    const options = shuffleArray([target, ...distractors]).map((w) => w.en);
    result.push({ target, options, imageSize, timeSec });
  }

  return result;
};

const ImageQuiz = () => {
  // As imagens vêm do curso ativo. Este hook já estava importado aqui mas
  // nunca era chamado — o jogo montava as rodadas com `defaultImageWords`
  // (inglês) mesmo em espanhol.
  const { imageWords } = useCourseData();
  const [difficulty, setDifficulty] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { handleCorrectAnswer, handleWrongAnswer, completeGame } = useProgress();
  const { playCorrect, playWrong } = useSound();
  const { speakNormal } = useSpeech();

  // Evita dupla contagem: um clique bem na hora em que o tempo esgota não
  // pode disparar handleAnswer E o timeout ao mesmo tempo.
  const submittedRef = useRef(false);
  const current = rounds[roundIndex];

  const startGame = useCallback((diff) => {
    setDifficulty(diff);
    setRounds(buildRounds(diff, imageWords));
    setRoundIndex(0);
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setCorrectCount(0);
    setGameComplete(false);
    setIsZoomed(false);
  }, [imageWords]);

  // Reseta o cronômetro sempre que uma rodada nova começa.
  useEffect(() => {
    if (!current) return;
    submittedRef.current = false;
    setIsZoomed(false);
    setTimeLeft(current.timeSec);
  }, [roundIndex, current]);

  const handleAnswer = useCallback((option) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSelected(option);
    if (option === current.target.en) {
      // Não fala aqui: seria a mesma palavra que o WordExplanation abaixo já
      // fala sozinho (pronúncia automática) — falar nos dois lugares dobrava
      // o áudio num acerto de primeira.
      setFeedback('correct');
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      handleCorrectAnswer(current.target.en, 1);
      playCorrect();
    } else {
      // Errado: fala a opção errada clicada — a certa quem fala é o
      // WordExplanation logo em seguida, então dá pra ouvir as duas.
      speakNormal(option);
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
          <div className="iq-image-wrapper" onClick={() => setIsZoomed(true)} title="Clique para ampliar">
            <img
              className="iq-image"
              src={current.target.icon}
              alt="Imagem para adivinhar"
              style={{ width: `${current.imageSize}px`, height: `${current.imageSize}px` }}
            />
            <span className="iq-zoom-hint">🔍 Ampliar</span>
          </div>
        </div>

        {isZoomed && (
          <div className="iq-modal-overlay" onClick={() => setIsZoomed(false)}>
            <div className="iq-modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <button className="iq-modal-close" onClick={() => setIsZoomed(false)}>✕</button>
              <img className="iq-modal-image" src={current.target.icon} alt="Imagem ampliada" />
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--fs-xs)' }}>
                Clique fora para fechar
              </p>
            </div>
          </div>
        )}

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
