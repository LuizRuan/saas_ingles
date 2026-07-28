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

// O Layout monta este componente com key={celebration.id}, então cada disparo é
// uma instância nova. Isso é o que garante que o sorteio aconteça uma vez só: um
// useMemo sem a remontagem manteria as partículas do efeito anterior, e sortear
// no corpo do render mudaria as posições a cada re-render do Layout.
const Celebration = ({ tipo }) => {
  const pecas = useMemo(() => (tipo === 'confetti' ? montarConfetti() : []), [tipo]);
  const fogos = useMemo(() => (tipo === 'fireworks' ? montarFogos() : []), [tipo]);

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
    </div>
  );
};

export default Celebration;
