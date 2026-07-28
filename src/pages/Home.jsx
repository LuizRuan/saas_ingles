import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { getCurrentLevel, getNextLevel, getLevelProgress } from '../utils/levelSystem';
import { getWordsToReview } from '../utils/reviewSystem';
import { words } from '../data/words';
import './Home.css';

const quickLinks = [
  { name: 'Desafio Diário', desc: 'Complete o desafio do dia e mantenha sua sequência!', icon: '⚡', color: '#6366f1', bg: '#ede9fe', path: '/daily' },
  { name: 'Conversa', desc: 'Pratique diálogos e melhore sua comunicação.', icon: '💬', color: '#ec4899', bg: '#fdf2f8', path: '/conversation' },
  { name: 'Palavras', desc: 'Aprenda novas palavras de forma divertida.', icon: '📖', color: '#10b981', bg: '#ecfdf5', path: '/my-words' },
  { name: 'Conquistas', desc: 'Desbloqueie troféus e acompanhe sua evolução.', icon: '🏆', color: '#f59e0b', bg: '#fefce8', path: '/achievements' },
];

const gamesList = [
  { id: 'memory', name: 'Jogo da Memória', desc: 'Encontre os pares', icon: '🃏', color: '#6366f1', bg: '#ede9fe', path: '/games/memory' },
  { id: 'hangman', name: 'Jogo da Forca', desc: 'Adivinhe a palavra', icon: '🎯', color: '#ef4444', bg: '#fef2f2', path: '/games/hangman' },
  { id: 'wordBuilder', name: 'Montar Palavras', desc: 'Organize as letras', icon: '🔤', color: '#3b82f6', bg: '#eef4ff', path: '/games/word-builder' },
  { id: 'sentenceBuilder', name: 'Montar Frases', desc: 'Monte a frase correta', icon: '📝', color: '#f59e0b', bg: '#fefce8', path: '/games/sentence-builder' },
  { id: 'translation', name: 'Tradução', desc: 'Traduza corretamente', icon: '🔄', color: '#ec4899', bg: '#fdf2f8', path: '/games/translation' },
  { id: 'fillBlanks', name: 'Completar Frases', desc: 'Complete a frase', icon: '✏️', color: '#10b981', bg: '#ecfdf5', path: '/games/fill-blanks' },
  { id: 'trueFalse', name: 'Verdadeiro ou Falso', desc: 'Julgue a tradução', icon: '✅', color: '#06b6d4', bg: '#ecfeff', path: '/games/true-false' },
  { id: 'listening', name: 'Escuta', desc: 'Ouça e identifique', icon: '🎧', color: '#8b5cf6', bg: '#f5f3ff', path: '/games/listening' },
];

const Home = () => {
  const { progress } = useProgress();
  const currentLevel = getCurrentLevel(progress.wordsStudied);
  const nextLevel = getNextLevel(progress.wordsStudied);
  const levelProgress = getLevelProgress(progress.wordsStudied);
  const reviewWords = getWordsToReview(progress, words);

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero animate-fade-in-up">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-english">English</span><span className="hero-play">Play</span>
            </h1>
            <p className="hero-subtitle">Aprenda inglês jogando todos os dias</p>
            <p className="hero-desc">
              Jogos divertidos, desafios diários e prática constante para transformar seu inglês de forma leve e eficaz.
            </p>
            <Link to="/games" className="btn btn-primary btn-lg">
              🎮 Começar a Jogar
            </Link>
          </div>
          <div className="hero-illustration animate-float">
            <img src="/logo.png" alt="EnglishPlay" />
          </div>
        </section>

        {/* Stats */}
        <section className="stats-row animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fefce8' }}>⭐</div>
            <div className="stat-info">
              <span className="stat-label">Pontos</span>
              <span className="stat-value">{progress.totalScore}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5' }}>🌱</div>
            <div className="stat-info">
              <span className="stat-label">Nível</span>
              <span className="stat-value">{currentLevel.level}</span>
              <span className="stat-sub">{currentLevel.name}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#eef4ff' }}>📚</div>
            <div className="stat-info">
              <span className="stat-label">Palavras estudadas</span>
              <span className="stat-value">{progress.wordsStudied}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef2f2' }}>🔥</div>
            <div className="stat-info">
              <span className="stat-label">Sequência</span>
              <span className="stat-value">{progress.dayStreak || 0} {(progress.dayStreak || 0) === 1 ? 'dia' : 'dias'}</span>
            </div>
          </div>
        </section>

        {/* Level Progress */}
        {nextLevel && (
          <section className="level-bar card-flat animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="level-bar-top">
              <div className="level-info">
                <span style={{ fontSize: '1.2rem' }}>{currentLevel.icon}</span>
                <div>
                  <strong>Nível {currentLevel.level}</strong>
                  <span className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}> {currentLevel.name}</span>
                </div>
              </div>
              <Link to="/my-words" className="btn btn-ghost btn-sm">👁 Ver nível →</Link>
            </div>
            <div className="level-bar-bottom">
              <span className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{currentLevel.name}</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }}></div>
              </div>
              <span className="text-muted" style={{ fontSize: 'var(--fs-xs)' }}>{nextLevel.icon} {nextLevel.name}</span>
            </div>
            <p className="text-muted" style={{ fontSize: 'var(--fs-xs)', textAlign: 'center', marginTop: '4px' }}>
              {progress.wordsStudied} / {nextLevel.wordsNeeded} palavras para o próximo nível
            </p>
          </section>
        )}

        {/* Quick Actions */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h3>🎮 Jogar agora</h3>
            <Link to="/games" className="btn btn-ghost btn-sm">Ver todos os jogos →</Link>
          </div>
          <div className="quick-links">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.path} className="quick-card card">
                <div className="quick-icon" style={{ background: link.bg, color: link.color }}>
                  {link.icon}
                </div>
                <div className="quick-info">
                  <strong>{link.name}</strong>
                  <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>{link.desc}</span>
                </div>
                <span className="quick-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Review Section */}
        {reviewWords.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.25s', marginTop: 'var(--space-xl)' }}>
            <Link to="/review" className="review-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>🔄</span>
                <div>
                  <strong>Revisar Meus Erros</strong>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                    {reviewWords.length} {reviewWords.length === 1 ? 'palavra precisa' : 'palavras precisam'} de revisão
                  </p>
                </div>
              </div>
              <span className="btn btn-secondary btn-sm">Revisar →</span>
            </Link>
          </section>
        )}

        {/* Games Grid */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s', marginTop: 'var(--space-xl)' }}>
          <div className="section-header">
            <h3>🎮 Jogos Disponíveis</h3>
          </div>
          <div className="games-grid">
            {gamesList.map((game) => (
              <Link key={game.id} to={game.path} className="game-card card">
                <div className="game-icon" style={{ background: game.bg, color: game.color }}>
                  {game.icon}
                </div>
                <div className="game-info">
                  <strong>{game.name}</strong>
                  <span className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>{game.desc}</span>
                </div>
                {progress.gamesCompleted[game.id] > 0 && (
                  <span className="badge badge-green">✓ {progress.gamesCompleted[game.id]}x</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
