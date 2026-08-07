import { NavLink, useLocation } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import { useAuthProfile } from '../../hooks/useAuthProfile';
import { ROTAS_LIVRES } from '../../utils/entryChoice';
import Celebration from '../Celebration/Celebration';
import NicknamePrompt from '../Auth/NicknamePrompt';
import AvatarDisplay from '../Avatar/AvatarDisplay';
import BugReportModal from '../BugReport/BugReportModal';
import './Layout.css';

const Layout = ({ children }) => {
  const { progress, newAchievement, scorePopup, celebration } = useProgress();
  const { pathname } = useLocation();
  // Mesma checagem de sessão real que a tela de Perfil usa (ver useAuthProfile)
  // — sem isto, "Entrar" continuava aparecendo na navbar mesmo depois de um
  // cadastro/login que funcionou de verdade, porque nada aqui olhava pra
  // sessão, só pro flag local de "já escolheu como entrar".
  const { entryChoice, profile, status: authStatus, applyNickname } = useAuthProfile();
  const estaLogado = entryChoice === 'account' && authStatus === 'loaded' && profile;
  // Vale tanto pra quem acabou de se cadastrar quanto pra conta antiga que
  // nunca passou por essa etapa — em ambos os casos profile.nickname é null.
  const precisaEscolherApelido = Boolean(estaLogado && !profile.nickname);

  // Telas de entrada não têm navbar. A lista é a MESMA que o EntryGate usa, de
  // propósito: duas cópias divergiriam, e o resultado seria uma tela de login
  // com a navbar do app em volta ou um portão redirecionando em laço.
  if (ROTAS_LIVRES.has(pathname)) return children;

  return (
    <div className="layout">
      {/* Desktop Navbar */}
      <nav className="navbar hide-mobile">
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-logo">
            <span className="logo-icon">🎮</span>
            <span>EnglishPlay</span>
          </NavLink>
          
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
              <img src="/inicio.png" alt="" width="1024" height="1024" style={{ height: '20px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} /> Início
            </NavLink>
            <NavLink to="/games" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <img src="/jogos.png" alt="" width="1536" height="1024" style={{ height: '20px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} /> Jogos
            </NavLink>
            <NavLink to="/daily" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>⚡</span> Desafio
            </NavLink>
            <NavLink to="/conversation" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>💬</span> Conversa
            </NavLink>
            <NavLink to="/my-words" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span>📖</span> Palavras
            </NavLink>
            <NavLink to="/stories" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <img src="/historias.png" alt="" width="1024" height="1024" style={{ height: '20px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} /> Histórias
            </NavLink>
            <NavLink to="/achievements" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <img src="/conquistas.png" alt="" width="1536" height="1024" style={{ height: '20px', width: 'auto', display: 'inline-block', verticalAlign: 'middle' }} /> Conquistas
            </NavLink>
          </div>

          <div className="navbar-stats">
            <div className="navbar-stat">
              <span>⭐</span>
              <span>{progress.totalScore}</span>
            </div>
            <div className="navbar-stat" aria-label={`${progress.hintsAvailable || 0} dicas disponíveis`}>
              <span aria-hidden="true">💡</span>
              <span>{progress.hintsAvailable || 0}</span>
            </div>
            <NavLink to="/shop" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              title="Loja" aria-label="Abrir loja">
              <img src="/loja.png" alt="" width="1536" height="1024" style={{ height: '20px', width: 'auto', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }} /> <span>Loja</span>
            </NavLink>
            <div className="navbar-stat">
              <span>🔥</span>
              <span>{progress.dayStreak || 0}</span>
            </div>
            {!estaLogado && (
              <NavLink to="/login" className="btn btn-secondary btn-sm">Entrar</NavLink>
            )}
            {estaLogado && profile.nickname && (
              <NavLink to="/settings" className="navbar-nickname" title={profile.nickname}>
                {profile.nickname.length > 10 ? `${profile.nickname.slice(0, 10)}...` : profile.nickname}
              </NavLink>
            )}
            <NavLink to="/settings" style={{ textDecoration: 'none' }}
              aria-label={estaLogado ? `Perfil de ${profile.nickname || profile.email}` : 'Configurações e perfil'}>
              <AvatarDisplay avatar={progress.selectedAvatar || profile?.nickname?.[0]?.toUpperCase() || 'U'} size="sm" />
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
          <img src="/inicio.png" alt="" width="1024" height="1024" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
          <span>Início</span>
        </NavLink>
        <NavLink to="/games" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <img src="/jogos.png" alt="" width="1536" height="1024" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
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

      {/* Por cima de qualquer tela, sem botão de pular — ver NicknamePrompt.jsx
          pro porquê de ser obrigatório. */}
      {precisaEscolherApelido && <NicknamePrompt onSaved={applyNickname} />}

      {/* Botão Flutuante de Reportar Bug 🐛 */}
      <BugReportModal />
    </div>
  );
};

export default Layout;
