import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordField from '../components/Auth/PasswordField';
import EmailDomainSuggestions from '../components/Auth/EmailDomainSuggestions';
import { useEmailDomainSuggestions } from '../components/Auth/useEmailDomainSuggestions';
import { isValidEmailFormat, isValidPassword, passwordsMatch, applyEmailDomain, MIN_PASSWORD_LENGTH } from '../utils/authValidation';
import { registerRequest } from '../utils/authClient';
import { setEntryChoice } from '../utils/entryChoice';
import './Auth.css';

// Nome do arquivo/rota em inglês (Register/`/register`), como toda outra
// página do projeto (Settings→/settings, Shop→/shop) — "Cadastro" aparece só
// no texto visível.
const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [submitError, setSubmitError] = useState('');

  const domainSuggestions = useEmailDomainSuggestions(email);

  const emailError = touched.email && !isValidEmailFormat(email) ? 'Digite um e-mail válido.' : null;
  const passwordError = touched.password && !isValidPassword(password)
    ? `A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
    : null;
  const confirmError = touched.confirmPassword && !passwordsMatch(password, confirmPassword)
    ? 'As senhas não coincidem.'
    : null;

  const isFormValid = isValidEmailFormat(email) && isValidPassword(password) && passwordsMatch(password, confirmPassword);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setStatus('loading');
    setSubmitError('');
    try {
      await registerRequest(email, password);
      // Cadastro já loga (o cookie de sessão vem na própria resposta), então
      // vai direto para a Home em vez de mandar preencher o Login de novo.
      setEntryChoice('account');
      navigate('/', { replace: true });
    } catch (err) {
      setStatus('error');
      setSubmitError(err.message || 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  }, [email, password, isFormValid, navigate]);

  return (
    <div className="page auth-page">
      <div className="container" style={{ maxWidth: 480 }}>
        {/* Volta para /welcome pelo mesmo motivo do Login.jsx. */}
        <Link to="/welcome" className="btn btn-ghost" style={{ marginBottom: 'var(--space-md)' }}>← Voltar</Link>

        <div className="glass-card auth-card animate-fade-in-up">
          <div className="auth-header">
            <span className="icon" aria-hidden="true">📝</span>
            <h1>Criar conta</h1>
            <p className="text-secondary">Crie sua conta para salvar seu progresso</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="register-email">E-mail</label>
              <input
                id="register-email"
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
              id="register-password"
              label="Senha"
              value={password}
              onChange={setPassword}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              autoComplete="new-password"
              error={passwordError}
            />

            <PasswordField
              id="register-confirm-password"
              label="Confirmar senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
              autoComplete="new-password"
              error={confirmError}
            />

            {status === 'error' && <p className="auth-submit-error">{submitError}</p>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Criando conta…' : 'Criar conta'}
            </button>

            <p className="auth-consent">Seus dados são usados apenas para autenticação nesta plataforma.</p>
          </form>

          <p className="auth-footer">
            Já tem uma conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
