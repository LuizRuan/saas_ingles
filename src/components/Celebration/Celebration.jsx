import { useMemo } from 'react';
import './Celebration.css';

// Efeitos comprados na Loja (itens `confetti` e `fireworks`). São puramente
// decorativos: nenhum estado de jogo depende deles, por isso Math.random() aqui
// é seguro — ao contrário do desafio diário, que precisa ser determinístico.
//
// Tudo é CSS + DOM próprio. A CSP é `default-src 'self'`, então nada de
// biblioteca de confete via CDN.

const CORES = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const PECAS_CONFETTI = 34;
const BURSTS = 4;
const PARTICULAS_POR_BURST = 18;

const entre = (min, max) => min + Math.random() * (max - min);
const cor = () => CORES[Math.floor(Math.random() * CORES.length)];

const montarConfetti = () =>
  Array.from({ length: PECAS_CONFETTI }, (_, i) => ({
    id: i,
    style: {
      left: `${entre(0, 100)}%`,
      background: cor(),
      animationDelay: `${entre(0, 0.35).toFixed(2)}s`,
      animationDuration: `${entre(1.1, 1.7).toFixed(2)}s`,
      // Consumidos pelo keyframe: deriva lateral e giro final de cada peça
      '--deriva': `${entre(-70, 70).toFixed(0)}px`,
      '--giro': `${entre(-540, 540).toFixed(0)}deg`,
      // Metade retangular, metade fita fina — dá textura sem virar poluição
      width: i % 2 ? '7px' : '10px',
      height: i % 2 ? '12px' : '7px',
    },
  }));

const montarFogos = () =>
  Array.from({ length: BURSTS }, (_, b) => {
    // O atraso precisa ir em cada faísca: animation-delay não é herdado, então
    // pô-lo no elemento do burst não seguraria as partículas filhas.
    const atraso = `${(b * 0.28).toFixed(2)}s`;
    return {
      id: b,
      style: { left: `${entre(15, 85)}%`, top: `${entre(18, 55)}%` },
      particulas: Array.from({ length: PARTICULAS_POR_BURST }, (_, p) => {
        const angulo = (p / PARTICULAS_POR_BURST) * Math.PI * 2;
        const raio = entre(70, 130);
        return {
          id: p,
          style: {
            background: cor(),
            animationDelay: atraso,
            '--dx': `${(Math.cos(angulo) * raio).toFixed(1)}px`,
            '--dy': `${(Math.sin(angulo) * raio).toFixed(1)}px`,
          },
        };
      }),
    };
  });

const montarEstrelas = () =>
  Array.from({ length: 28 }, (_, i) => ({
    id: i,
    char: i % 3 === 0 ? '✨' : '⭐',
    style: {
      left: `${entre(2, 98)}%`,
      fontSize: `${entre(16, 28).toFixed(0)}px`,
      animationDelay: `${entre(0, 0.4).toFixed(2)}s`,
      animationDuration: `${entre(1.2, 1.8).toFixed(2)}s`,
      '--deriva': `${entre(-60, 60).toFixed(0)}px`,
      '--giro': `${entre(-360, 360).toFixed(0)}deg`,
    },
  }));

const montarCoracoes = () =>
  Array.from({ length: 25 }, (_, i) => ({
    id: i,
    char: ['💖', '💗', '❤️', '💕'][i % 4],
    style: {
      left: `${entre(5, 95)}%`,
      bottom: '-30px',
      fontSize: `${entre(18, 30).toFixed(0)}px`,
      animationDelay: `${entre(0, 0.45).toFixed(2)}s`,
      animationDuration: `${entre(1.4, 2.0).toFixed(2)}s`,
      '--floatX': `${entre(-80, 80).toFixed(0)}px`,
    },
  }));

const montarMoedas = () =>
  Array.from({ length: 24 }, (_, i) => ({
    id: i,
    char: '🪙',
    style: {
      left: `${entre(3, 97)}%`,
      fontSize: `${entre(20, 32).toFixed(0)}px`,
      animationDelay: `${entre(0, 0.35).toFixed(2)}s`,
      animationDuration: `${entre(1.1, 1.6).toFixed(2)}s`,
      '--deriva': `${entre(-50, 50).toFixed(0)}px`,
    },
  }));

const montarArcoIris = () =>
  Array.from({ length: 20 }, (_, i) => ({
    id: i,
    char: '🌈',
    style: {
      left: `${entre(2, 98)}%`,
      fontSize: `${entre(22, 34).toFixed(0)}px`,
      animationDelay: `${entre(0, 0.4).toFixed(2)}s`,
      animationDuration: `${entre(1.3, 1.9).toFixed(2)}s`,
      '--deriva': `${entre(-70, 70).toFixed(0)}px`,
      '--giro': `${entre(-180, 180).toFixed(0)}deg`,
    },
  }));

const montarBolhas = () =>
  Array.from({ length: 22 }, (_, i) => ({
    id: i,
    char: '🫧',
    style: {
      left: `${entre(4, 96)}%`,
      bottom: '-30px',
      fontSize: `${entre(20, 36).toFixed(0)}px`,
      animationDelay: `${entre(0, 0.5).toFixed(2)}s`,
      animationDuration: `${entre(1.5, 2.2).toFixed(2)}s`,
      '--floatX': `${entre(-60, 60).toFixed(0)}px`,
    },
  }));

// O Layout monta este componente com key={celebration.id}, então cada disparo é
// uma instância nova. Isso é o que garante que o sorteio aconteça uma vez só.
const Celebration = ({ tipo }) => {
  const pecas = useMemo(() => (tipo === 'confetti' ? montarConfetti() : []), [tipo]);
  const fogos = useMemo(() => (tipo === 'fireworks' ? montarFogos() : []), [tipo]);
  const estrelas = useMemo(() => (tipo === 'stars' ? montarEstrelas() : []), [tipo]);
  const coracoes = useMemo(() => (tipo === 'hearts' ? montarCoracoes() : []), [tipo]);
  const moedas = useMemo(() => (tipo === 'coins' ? montarMoedas() : []), [tipo]);
  const arcoiris = useMemo(() => (tipo === 'rainbow' ? montarArcoIris() : []), [tipo]);
  const bolhas = useMemo(() => (tipo === 'bubbles' ? montarBolhas() : []), [tipo]);

  return (
    <div className="celebration" aria-hidden="true">
      {pecas.map(p => (
        <span key={p.id} className="celebration-confete" style={p.style} />
      ))}
      {fogos.map(b => (
        <span key={b.id} className="celebration-burst" style={b.style}>
          {b.particulas.map(p => (
            <span key={p.id} className="celebration-faisca" style={p.style} />
          ))}
        </span>
      ))}
      {estrelas.map(p => (
        <span key={p.id} className="celebration-estrela" style={p.style}>{p.char}</span>
      ))}
      {coracoes.map(p => (
        <span key={p.id} className="celebration-coracao" style={p.style}>{p.char}</span>
      ))}
      {moedas.map(p => (
        <span key={p.id} className="celebration-moeda" style={p.style}>{p.char}</span>
      ))}
      {arcoiris.map(p => (
        <span key={p.id} className="celebration-arcoiris" style={p.style}>{p.char}</span>
      ))}
      {bolhas.map(p => (
        <span key={p.id} className="celebration-bolha" style={p.style}>{p.char}</span>
      ))}
    </div>
  );
};

export default Celebration;
