import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useProgress } from '../hooks/useProgress';
import { getCurrentLevel, getNextLevel, getLevelProgress } from '../utils/levelSystem';
import { getReviewUrgencyLite } from '../utils/reviewSystem';
import { gamesCatalog, halo } from '../data/gamesCatalog';
import { AVAILABLE_COURSES } from '../data/index';

import './Home.css';

const quickLinks = [
  { name: 'Desafio Diário', desc: 'Complete o desafio do dia e mantenha sua sequência!', icon: '⚡', color: '#6366f1', path: '/daily' },
  { name: 'Conversa', desc: 'Pratique diálogos e melhore sua comunicação.', icon: '💬', color: '#ec4899', path: '/conversation' },
  { name: 'Palavras', desc: 'Aprenda novas palavras de forma divertida.', icon: '📖', color: '#10b981', path: '/my-words' },
  { name: 'Histórias', desc: 'Leia histórias curtas no seu idioma de estudo, clique nas palavras e veja exemplos.', iconImage: '/historias.png', color: '#0ea5e9', path: '/stories' },
  { name: 'Conquistas', desc: 'Desbloqueie troféus e acompanhe sua evolução.', iconImage: '/conquistas.png', color: '#f59e0b', path: '/achievements' },
];



const Home = () => {
  const { progress } = useProgress();
  // O curso ativo decide a escada: 200 palavras são nível ~30 em inglês e
  // nível ~60 em espanhol, porque os bancos têm tamanhos diferentes.
  const curso = progress.activeCourse || 'en-pt';
  // O idioma aparece no texto da Home; fixar "inglês" contradizia o curso
  // ativo de quem trocou para espanhol.
  const idioma = (AVAILABLE_COURSES.find(c => c.id === curso)?.targetName || 'Inglês').toLowerCase();
  const currentLevel = getCurrentLevel(progress.wordsStudied, curso);
  const nextLevel = getNextLevel(progress.wordsStudied, curso);
  const levelProgress = getLevelProgress(progress.wordsStudied, curso);


  // getReviewUrgencyLite: mesma contagem que a página de Revisão usa, só que
  // sem precisar importar o banco de palavras (~139 kB) no bundle principal
  // da Home — ver o comentário na função em reviewSystem.js sobre a
  // regressão que motivou extrair isto de uma cópia inline solta aqui.
  const reviewUrgency = useMemo(
    () => getReviewUrgencyLite({ wordStats: progress.wordStats, phraseStats: progress.phraseStats }),
    [progress.wordStats, progress.phraseStats]
  );

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero animate-fade-in-up">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-word">Word</span><span className="hero-ly">ly</span>
            </h1>
            <p className="hero-tagline">Mundo das Palavras</p>
            <p className="hero-subtitle">Aprenda {idioma} jogando todos os dias</p>
            <p className="hero-desc">
              Jogos divertidos, desafios diários e prática constante para transformar seu {idioma} de forma leve e eficaz.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link to="/games" className="btn btn-primary btn-lg">
                <img src="/jogos.png" alt="" width="1536" height="1024" style={{ height: '22px', width: 'auto', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }} /> Começar a Jogar
              </Link>
              <Link to="/shop" className="btn btn-secondary btn-lg">
                <img src="/loja.png" alt="" width="1536" height="1024" style={{ height: '22px', width: 'auto', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }} /> Loja
              </Link>
            </div>
          </div>
          <div className="hero-illustration animate-float">
            {/* Sem o wordmark: o <h1> ao lado já diz "Wordly", e o texto
                azul-marinho da arte sumia no tema escuro. */}
            <img
              src="/hero.webp"
              alt="Controle de videogame cercado por balões de fala em inglês"
              width="745"
              height="598"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </section>

        {/* Stats */}
        <section className="stats-row animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-yellow-subtle)' }}>⭐</div>
            <div className="stat-info">
              <span className="stat-label">Pontos</span>
              <span className="stat-value">{progress.totalScore}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-green-subtle)' }}>🌱</div>
            <div className="stat-info">
              <span className="stat-label">Nível</span>
              <span className="stat-value">{currentLevel.level}</span>
              <span className="stat-sub">{currentLevel.name}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-blue-subtle)' }}>📚</div>
            <div className="stat-info">
              <span className="stat-label">Palavras estudadas</span>
              <span className="stat-value">{progress.wordsStudied}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-red-subtle)' }}>🔥</div>
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
              <Link to="/levels" className="btn btn-ghost btn-sm">📊 Ver níveis →</Link>
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
                <div className="quick-icon" style={{ background: halo(link.color), color: link.color }}>
                  {link.iconImage
                    ? <img src={link.iconImage} alt="" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
                    : link.icon}
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
        {reviewUrgency.level !== 'none' && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.25s', marginTop: 'var(--space-xl)' }}>
            <Link to="/review" className="review-banner" style={{
              borderColor: reviewUrgency.level === 'urgent' ? 'var(--accent-red)' : 'var(--accent-orange)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '1.5rem' }}>{reviewUrgency.level === 'urgent' ? '🚨' : '🔄'}</span>
                <div>
                  <strong style={{ color: reviewUrgency.level === 'urgent' ? 'var(--accent-red)' : undefined }}>
                    {reviewUrgency.level === 'urgent' ? 'Revisão Urgente!' : 'Revisar Meus Erros'}
                  </strong>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                    {/* "item(ns)" porque a contagem agora inclui tanto palavras
                        quanto frases erradas em jogos como Montar Frases/Tradução. */}
                    {reviewUrgency.count} {reviewUrgency.count === 1 ? 'item precisa' : 'itens precisam'} de revisão
                    {reviewUrgency.daysOldest >= 1 && (
                      <span style={{ marginLeft: 4, color: reviewUrgency.level === 'urgent' ? 'var(--accent-red)' : 'var(--accent-orange)', fontWeight: 600 }}>
                        · há {reviewUrgency.daysOldest} {reviewUrgency.daysOldest === 1 ? 'dia' : 'dias'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span className={`btn btn-sm ${reviewUrgency.level === 'urgent' ? 'btn-danger' : 'btn-secondary'}`}>Revisar →</span>
            </Link>
          </section>
        )}

        {/* Games Grid */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.3s', marginTop: 'var(--space-xl)' }}>
          <div className="section-header">
            <h3>🎮 Jogos Disponíveis</h3>
          </div>
          <div className="games-grid">
            {gamesCatalog.map((game) => (
              <Link key={game.id} to={game.path} className="game-card card">
                <div className="game-icon" style={{ background: halo(game.color), color: game.color }}>
                  {game.iconImage
                    ? <img src={game.iconImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                    : game.icon}
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
