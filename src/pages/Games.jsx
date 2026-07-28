import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import './Home.css';

const gamesList = [
  { id: 'whoKnowsMore', name: 'Quem Sabe Mais?', icon: '⚔️', path: '/games/who-knows-more', color: '#ec4899', desc: 'Duelo online! Teste quem responde mais rápido contra o Bot Inteligente em partidas ao vivo.' },
  { id: 'memory', name: 'Jogo da Memória', icon: '🃏', path: '/games/memory', color: '#8b5cf6', desc: 'Encontre os pares de palavras em inglês e português. Treine seu vocabulário de forma divertida!' },
  { id: 'hangman', name: 'Jogo da Forca', icon: '🎯', path: '/games/hangman', color: '#3b82f6', desc: 'Adivinhe a palavra em inglês letra por letra. Você tem 6 tentativas!' },
  { id: 'wordBuilder', name: 'Montar Palavras', icon: '🔤', path: '/games/word-builder', color: '#10b981', desc: 'Organize as letras embaralhadas para formar a palavra correta em inglês.' },
  { id: 'sentenceBuilder', name: 'Montar Frases', icon: '📝', path: '/games/sentence-builder', color: '#f59e0b', desc: 'Coloque as palavras na ordem correta para formar frases em inglês.' },
  { id: 'translation', name: 'Tradução', icon: '🔄', path: '/games/translation', color: '#ec4899', desc: 'Escolha a tradução correta entre 4 opções. Inglês ↔ Português.' },
  { id: 'fillBlanks', name: 'Completar Frases', icon: '✏️', path: '/games/fill-blanks', color: '#06b6d4', desc: 'Complete a frase escolhendo a palavra que falta.' },
  { id: 'trueFalse', name: 'Verdadeiro ou Falso', icon: '✅', path: '/games/true-false', color: '#ef4444', desc: 'A tradução está correta? Julgue rápido!' },
  { id: 'listening', name: 'Jogo de Escuta', icon: '🎧', path: '/games/listening', color: '#6366f1', desc: 'Ouça a palavra em inglês e identifique o que foi falado.' },
];

const Games = () => {
  const { progress } = useProgress();

  return (
    <div className="page">
      <div className="container">
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1>🎮 Todos os Jogos</h1>
          <p className="text-secondary" style={{ marginTop: 'var(--space-sm)' }}>
            Escolha um jogo e comece a aprender inglês se divertindo!
          </p>
        </div>

        <div className="games-list">
          {gamesList.map((game, index) => (
            <Link
              key={game.id}
              to={game.path}
              className="game-list-card glass-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="game-list-icon" style={{ background: `${game.color}15`, color: game.color }}>
                {game.icon}
              </div>
              <div className="game-list-info">
                <h3>{game.name}</h3>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>{game.desc}</p>
                {progress.gamesCompleted[game.id] > 0 && (
                  <span className="badge badge-green" style={{ marginTop: '4px' }}>
                    ✓ Jogado {progress.gamesCompleted[game.id]}x
                  </span>
                )}
              </div>
              <span className="btn btn-primary btn-sm">Jogar →</span>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          <Link to="/conversation" className="btn btn-success btn-lg">
            💬 Treino de Conversação
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Games;
