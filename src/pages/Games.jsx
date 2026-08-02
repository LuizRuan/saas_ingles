import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { gamesCatalog, halo } from '../data/gamesCatalog';
import './Home.css';

const Games = () => {
  const { progress } = useProgress();

  return (
    <div className="page">
      <div className="container">
        {/* Sem "← Voltar": /games está na navbar do desktop E na barra inferior do
            mobile, então o botão seria navegação redundante. As telas que ganham o
            botão são as que não têm entrada na barra inferior (Loja, Conquistas). */}
        <div className="page-header page-header--center animate-fade-in-up">
          <h1>🎮 Todos os Jogos</h1>
          <p className="text-secondary">
            Escolha um jogo e comece a aprender inglês se divertindo!
          </p>
        </div>

        <div className="games-list">
          {gamesCatalog.map((game, index) => (
            <Link
              key={game.id}
              to={game.path}
              className="game-list-card glass-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="game-list-icon" style={{ background: halo(game.color), color: game.color }}>
                {game.iconImage
                  ? <img src={game.iconImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  : game.icon}
              </div>
              <div className="game-list-info">
                <h3>{game.name}</h3>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>{game.descLong}</p>
                {progress.gamesCompleted[game.id] > 0 && (
                  <span className="badge badge-green" style={{ marginTop: 'var(--space-xs)' }}>
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
