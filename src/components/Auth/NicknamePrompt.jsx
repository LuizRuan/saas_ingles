import { useCallback, useState } from 'react';
import { updateProfileRequest } from '../../utils/authClient';
import { MAX_NICKNAME_LENGTH } from '../../utils/authValidation';

// Aparece por cima de QUALQUER tela (renderizado pelo Layout) sempre que uma
// conta logada ainda não tem apelido — vale tanto pra quem acabou de criar a
// conta quanto pra contas antigas, de antes deste campo existir. De propósito
// SEM botão de pular, sem fechar no overlay/Escape: o pedido foi que a
// escolha do apelido seja obrigatória, não uma sugestão.
const NicknamePrompt = ({ onSaved }) => {
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | error
  const [error, setError] = useState('');

  const trimmed = nickname.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= MAX_NICKNAME_LENGTH;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus('saving');
    setError('');
    try {
      const { user } = await updateProfileRequest(trimmed);
      onSaved(user.nickname);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Não foi possível salvar. Tente novamente.');
    }
  }, [trimmed, isValid, onSaved]);

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <span className="icon" aria-hidden="true">👋</span>
          <h1>Escolha seu apelido</h1>
          <p className="text-secondary">É assim que vamos te chamar por aqui. Dá pra trocar depois em Configurações.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="mandatory-nickname-input">Apelido</label>
            <input
              id="mandatory-nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="Como você quer ser chamado?"
              autoFocus
              aria-invalid={status === 'error'}
            />
            {status === 'error' && <p className="form-error">{error}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!isValid || status === 'saving'}>
            {status === 'saving' ? 'Salvando…' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NicknamePrompt;
