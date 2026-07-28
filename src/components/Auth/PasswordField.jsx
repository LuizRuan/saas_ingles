import { useState, useId } from 'react';
import './PasswordField.css';

// Campo de senha com alternância de visibilidade própria — cada instância tem
// seu próprio estado, então "Senha" e "Confirmar senha" no Cadastro alternam
// independentemente uma da outra.
const PasswordField = ({ id, label, value, onChange, autoComplete, error }) => {
  const [visible, setVisible] = useState(false);
  const gerarId = useId();
  const inputId = id || gerarId;

  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      <div className="password-field-wrap">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="password-field-input"
        />
        <button
          type="button"
          className="password-field-toggle"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          title={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default PasswordField;
