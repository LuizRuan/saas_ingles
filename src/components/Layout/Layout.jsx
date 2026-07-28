import { NavLink } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import Celebration from '../Celebration/Celebration';
import './Layout.css';

const Layout = ({ children }) => {
  const { progress, newAchievement, scorePopup, celebration } = useProgress();

  return (
    <div className="layout">
      {/* Desktop Navbar */}
      <nav className="navbar hide-mobile">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-logo">
            <span className="logo-icon">🎮</span>
            <span>EnglishPlay</span>
          </NavLink>
          
          {/* O title não é decorativo: abaixo de 1040px o CSS esconde os rótulos
              e deixa só o ícone, então ele passa a ser a única dica no hover. */}
          <div className="navbar-links">
            <NavLink to="/" title="Início" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
              <span>🏠</span> Início
            </NavLink>
            <NavLink to="/games" title="Jogos" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>🎮</span> Jogos
            </NavLink>
            <NavLink to="/daily" title="Desafio" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>⚡</span> Desafio
            </NavLink>
            <NavLink to="/conversation" title="Conversa" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>💬</span> Conversa
            </NavLink>
            <NavLink to="/my-words" title="Palavras" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>📖</span> Palavras
            </NavLink>
            <NavLink to="/levels" title="Níveis" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>📊</span> Níveis
            </NavLink>
            <NavLink to="/achievements" title="Conquistas" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>🏆</span> Conquistas
            </NavLink>
          </div>

          <div className="navbar-stats">
            <div className="navbar-stat">
              <span>⭐</span>
              <span>{progress.totalScore}</span>
            </div>
            <NavLink to="/shop" className="navbar-stat" style={{ textDecoration: 'none' }} title="Dicas adquiridas na Loja">
              <span>💡</span>
              <span>{progress.hintsAvailable || 0}</span>
            </NavLink>
            <NavLink to="/shop" className="navbar-link" style={{ padding: '6px 10px' }} title="Loja">
              🏪
            </NavLink>
            <div className="navbar-stat">
              <span>🔥</span>
              <span>{progress.dayStreak || 0}</span>
            </div>
            <NavLink to="/settings" className="navbar-avatar">
              {progress.selectedAvatar || 'U'}
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav hide-desktop">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} end>
          <span className="icon">🏠</span>
          <span>Início</span>
        </NavLink>
        <NavLink to="/games" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">🎮</span>
          <span>Jogos</span>
        </NavLink>
        <NavLink to="/daily" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">⚡</span>
          <span>Desafio</span>
        </NavLink>
        <NavLink to="/my-words" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">📖</span>
          <span>Palavras</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="icon">⚙️</span>
          <span>Config</span>
        </NavLink>
      </nav>

      {/* Efeitos comprados na Loja (confetti / fogos). A key remonta o
          componente a cada disparo, que é o que re-sorteia as partículas. */}
      {celebration && <Celebration key={celebration.id} tipo={celebration.tipo} />}

      {/* Score Popup */}
      {scorePopup && (
        <div className="score-popup" key={Date.now()}>+{scorePopup}</div>
      )}

      {/* Achievement Toast */}
      {newAchievement && (
        <div className="toast-container">
          <div className="toast animate-fade-in-up">
            <span style={{ fontSize: '2rem' }}>{newAchievement.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>🎉 Nova Conquista!</div>
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>{newAchievement.title}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>{newAchievement.description}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
