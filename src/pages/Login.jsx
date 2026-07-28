import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordField from '../components/Auth/PasswordField';
import EmailDomainSuggestions from '../components/Auth/EmailDomainSuggestions';
import { useEmailDomainSuggestions } from '../components/Auth/useEmailDomainSuggestions';
import { isValidEmailFormat, applyEmailDomain } from '../utils/authValidation';
import { loginRequest } from '../utils/authClient';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [submitError, setSubmitError] = useState('');

  const domainSuggestions = useEmailDomainSuggestions(email);

  const emailError = touched.email && !isValidEmailFormat(email) ? 'Digite um e-mail válido.' : null;
  const isFormValid = isValidEmailFormat(email) && password.length > 0;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTouched({ email: true });
    if (!isFormValid) return;

    setStatus('loading');
    setSubmitError('');
    try {
      await loginRequest(email, password);
      navigate('/');
    } catch (err) {
      setStatus('error');
      setSubmitError(err.message || 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  }, [email, password, isFormValid, navigate]);

  return (
    <div className="page auth-page">
      <div className="container" style={{ maxWidth: 480 }}>
        <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-md)' }}>← Voltar</Link>

        <div className="glass-card auth-card animate-fade-in-up">
          <div className="auth-header">
            <span className="icon" aria-hidden="true">👋</span>
            <h1>Entrar</h1>
            <p className="text-secondary">Acesse sua conta do EnglishPlay</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                onKeyDown={(e) => domainSuggestions.handleKeyDown(e, (domain) => {
                  setEmail(v => applyEmailDomain(v, domain));
                })}
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
              />
              {domainSuggestions.isOpen && (
                <EmailDomainSuggestions
                  suggestions={domainSuggestions.suggestions}
                  activeIndex={domainSuggestions.activeIndex}
                  onHover={domainSuggestions.setActiveIndex}
                  onSelect={(domain) => domainSuggestions.select(domain, (d) => {
                    setEmail(v => applyEmailDomain(v, d));
                  })}
                />
              )}
              {emailError && <p className="form-error">{emailError}</p>}
            </div>

            <PasswordField
              id="login-password"
              label="Senha"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {status === 'error' && <p className="auth-submit-error">{submitError}</p>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="auth-footer">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
