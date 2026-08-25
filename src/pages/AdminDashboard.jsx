import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { getAdminDashboardRequest } from '../utils/authClient';
import { getCurrentLevel } from '../utils/levelSystem';
import './AdminDashboard.css';

const COURSE_NAMES = {
  'en-pt': 'Inglês',
  'es-pt': 'Espanhol',
};

const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Data não informada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data não informada' : date.toLocaleDateString('pt-BR');
};

const AdminDashboard = () => {
  const { profile, status: authStatus } = useAuthProfile();
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const isAdmin = authStatus === 'loaded' && profile?.isAdmin === true;

  useEffect(() => {
    if (!isAdmin) return undefined;

    let cancelled = false;
    setStatus('loading');
    setError('');

    getAdminDashboardRequest({ page, limit: 25, search })
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setStatus('loaded');
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError.message || 'Não foi possível carregar o Dashboard.');
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, [isAdmin, page, search, reloadKey]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  if (authStatus === 'loading') {
    return (
      <div className="page admin-dashboard-page">
        <div className="admin-state glass-card" role="status">
          <span className="spinner spinner-lg" />
          <p>Verificando permissão administrativa...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page admin-dashboard-page">
        <div className="admin-state glass-card">
          <span className="admin-state-icon" aria-hidden="true">🔒</span>
          <h1>Acesso restrito</h1>
          <p>Este Dashboard está disponível somente para a conta administradora.</p>
          <Link to="/" className="btn btn-primary">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 };

  return (
    <div className="page admin-dashboard-page">
      <div className="container admin-dashboard-container">
        <header className="admin-dashboard-header animate-fade-in-up">
          <div>
            <span className="admin-eyebrow">Área administrativa</span>
            <h1>📊 Dashboard</h1>
            <p>Acompanhe as contas, os níveis, as moedas e os jogos preferidos.</p>
          </div>
          <Link to="/admin/feedback" className="btn btn-secondary">💬 Ver feedbacks</Link>
        </header>

        <section className="admin-summary-grid" aria-label="Resumo das contas">
          <article className="admin-summary-card glass-card admin-summary-card--primary">
            <span className="admin-summary-icon" aria-hidden="true">👥</span>
            <div>
              <strong>{data ? formatNumber(data.summary?.totalUsers) : '—'}</strong>
              <span>contas criadas</span>
            </div>
          </article>
          <article className="admin-summary-card glass-card">
            <span className="admin-summary-icon" aria-hidden="true">🎮</span>
            <div>
              <strong>{data ? formatNumber(data.summary?.usersWithProgress) : '—'}</strong>
              <span>jogadores com progresso</span>
            </div>
          </article>
          <article className="admin-summary-card glass-card">
            <span className="admin-summary-icon" aria-hidden="true">🔎</span>
            <div>
              <strong>{data ? formatNumber(pagination.totalItems) : '—'}</strong>
              <span>{search ? 'contas encontradas' : 'contas na listagem'}</span>
            </div>
          </article>
        </section>

        <section className="admin-users-panel glass-card">
          <div className="admin-panel-toolbar">
            <div>
              <h2>Jogadores cadastrados</h2>
              <p>Ordenados da conta mais recente para a mais antiga.</p>
            </div>
            <form className="admin-search" role="search" onSubmit={handleSearch}>
              <input
                type="search"
                value={searchDraft}
                onChange={event => setSearchDraft(event.target.value)}
                placeholder="Buscar por apelido ou e-mail"
                aria-label="Buscar jogador por apelido ou e-mail"
                maxLength={100}
              />
              <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
            </form>
          </div>

          {status === 'loading' && (
            <div className="admin-table-state" role="status">
              <span className="spinner spinner-lg" />
              <p>Carregando jogadores...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="admin-table-state admin-table-state--error" role="alert">
              <span aria-hidden="true">⚠️</span>
              <p>{error}</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReloadKey(key => key + 1)}>
                Tentar novamente
              </button>
            </div>
          )}

          {status === 'loaded' && users.length === 0 && (
            <div className="admin-table-state">
              <span className="admin-empty-icon" aria-hidden="true">🔍</span>
              <h3>Nenhuma conta encontrada</h3>
              <p>Tente buscar outro apelido ou e-mail.</p>
            </div>
          )}

          {status === 'loaded' && users.length > 0 && (
            <div className="admin-table-scroll">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Conta</th>
                    <th>Nível atual</th>
                    <th>Moedas</th>
                    <th>2 jogos mais jogados</th>
                    <th>Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const level = getCurrentLevel(user.wordsStudied || 0, user.activeCourse).level;
                    return (
                      <tr key={user.id}>
                        <td data-label="Conta">
                          <div className="admin-user-cell">
                            <span className="admin-user-avatar" aria-hidden="true">
                              {(user.nickname || user.email || '?').charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <strong>{user.nickname || 'Sem apelido'}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td data-label="Nível atual">
                          <span className="admin-level-badge">Nível {level}</span>
                          <small>{COURSE_NAMES[user.activeCourse] || user.activeCourse}</small>
                        </td>
                        <td data-label="Moedas">
                          <span className="admin-coins">⭐ {formatNumber(user.coins)}</span>
                        </td>
                        <td data-label="Jogos favoritos">
                          <div className="admin-top-games">
                            {user.topGames.length > 0
                              ? user.topGames.map((game, index) => (
                                <span key={game.id} className="admin-game-chip">
                                  <b>{index + 1}º</b> {game.name} <small>{formatNumber(game.plays)}x</small>
                                </span>
                              ))
                              : <span className="admin-no-games">Ainda não jogou</span>}
                          </div>
                        </td>
                        <td data-label="Cadastro">
                          <time dateTime={user.createdAt || undefined}>{formatDate(user.createdAt)}</time>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {status === 'loaded' && pagination.totalPages > 1 && (
            <nav className="admin-pagination" aria-label="Paginação de jogadores">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(current => Math.max(1, current - 1))}
              >
                ← Anterior
              </button>
              <span>Página <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong></span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(current => current + 1)}
              >
                Próxima →
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
