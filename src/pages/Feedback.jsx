import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSound from '../hooks/useSound';

const Feedback = () => {
  const [reports, setReports]   = useState([]);
  const [status, setStatus]     = useState('loading'); // 'loading' | 'loaded' | 'unauthorized' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { playClick, playWrong } = useSound();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/feedback', { credentials: 'include' });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        setStatus('unauthorized');
        setErrorMsg(data.error || 'Acesso restrito a administradores.');
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao carregar relatórios.');
      }

      setReports(data.reports || []);
      setStatus('loaded');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Falha ao conectar com o servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (deletingId) return;
    playClick();
    setDeletingId(id);

    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao apagar relatório.');
      }

      setReports(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert(err.message || 'Não foi possível apagar.');
      playWrong();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header animate-fade-in-up">
          <Link to="/" className="btn btn-ghost page-back">← Voltar à Home</Link>
          <h1>⚙️ Painel de Administração</h1>
          <p className="text-secondary">Relatórios de bugs e feedbacks enviados pelos usuários</p>
        </div>

        {status === 'loading' && (
          <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <p className="text-secondary">Carregando relatórios…</p>
          </div>
        )}

        {status === 'unauthorized' && (
          <div className="glass-card animate-bounce-in" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🔒</div>
            <h2>Acesso Restrito</h2>
            <p className="text-secondary" style={{ margin: 'var(--space-sm) 0 var(--space-lg)' }}>
              {errorMsg}
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
              Se você é o desenvolvedor, certifique-se de configurar a variável de ambiente <code>ADMIN_EMAILS</code> no servidor e estar conectado com sua conta admin.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              🔑 Fazer Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-red)' }}>⚠️ {errorMsg}</p>
            <button className="btn btn-secondary btn-sm" onClick={fetchReports} style={{ marginTop: 'var(--space-md)' }}>
              🔄 Tentar Novamente
            </button>
          </div>
        )}

        {status === 'loaded' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
                Total de relatórios: <strong>{reports.length}</strong>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={fetchReports}>
                🔄 Atualizar Lista
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>✨</div>
                <h4>Nenhum relatório pendente!</h4>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                  Não há novos bugs reportados no momento.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {reports.map(report => {
                  const dateStr = new Date(report.createdAt).toLocaleString('pt-BR');

                  return (
                    <div
                      key={report._id}
                      className="glass-card animate-fade-in-up"
                      style={{ padding: 'var(--space-lg)', position: 'relative' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                          <span className="badge badge-purple" style={{ fontSize: 'var(--fs-xs)' }}>
                            📍 {report.page}
                          </span>
                          <span className="badge badge-green" style={{ fontSize: 'var(--fs-xs)' }}>
                            👤 {report.nickname || 'Convidado'}
                          </span>
                        </div>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                          🕒 {dateStr}
                        </span>
                      </div>

                      <p style={{
                        fontSize: 'var(--fs-base)',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 'var(--space-sm) 0 var(--space-md)',
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        {report.message}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(report._id)}
                          disabled={deletingId === report._id}
                          style={{ color: 'var(--accent-red)' }}
                        >
                          {deletingId === report._id ? 'Apagando…' : '🗑️ Apagar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
