import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import useSound from '../../hooks/useSound';
import './BugReportModal.css';

const MAX_CHARS = 1000;

const BugReportModal = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [message, setMessage]   = useState('');
  const [status, setStatus]     = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();
  const { playClick, playCorrect } = useSound();

  const handleOpen = () => {
    playClick();
    setIsOpen(true);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessage('');
    setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: message.trim(),
          page: location.pathname,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível enviar o relatório agora.');
      }

      setStatus('success');
      playCorrect();
      setTimeout(() => {
        handleClose();
      }, 2200);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Erro de conexão.');
    }
  };

  return (
    <>
      {/* Botão Flutuante Global (FAB) */}
      <button
        className="bug-report-fab"
        onClick={handleOpen}
        title="Reportar um bug ou problema nesta página"
        aria-label="Reportar um bug ou problema"
      >
        <span>🐛</span>
        <span className="hide-mobile">Reportar Bug</span>
      </button>

      {/* Modal Popup */}
      {isOpen && (
        <div className="bug-report-backdrop animate-fade-in" onClick={handleClose}>
          <div className="bug-report-modal animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="bug-report-header">
              <h3>🐛 Reportar um Problema</h3>
              <button className="btn btn-ghost btn-sm" onClick={handleClose}>✕</button>
            </div>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-xs)' }}>✅</div>
                <h4 style={{ color: 'var(--accent-green)' }}>Relatório Enviado!</h4>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                  Obrigado pelo seu feedback. Nossa equipe vai analisar em breve!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--space-xs)' }}>
                  📍 Página atual: <code>{location.pathname}</code>
                </p>

                <textarea
                  className="bug-report-textarea"
                  placeholder="Descreva o erro que você encontrou..."
                  maxLength={MAX_CHARS}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  autoFocus
                />

                {status === 'error' && (
                  <p style={{ color: 'var(--accent-red)', fontSize: 'var(--fs-xs)', marginTop: '6px' }}>
                    ⚠️ {errorMsg}
                  </p>
                )}

                <div className="bug-report-footer">
                  <span>{message.length}/{MAX_CHARS} caracteres</span>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleClose}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={!message.trim() || status === 'sending'}
                    >
                      {status === 'sending' ? 'Enviando…' : '🚀 Enviar Relatório'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BugReportModal;
