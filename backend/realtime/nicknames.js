// Saneamento do apelido de convidado — mesmo espírito de storage.js's
// saneiaProgresso no frontend: entrada de rede é não confiável por padrão,
// e aqui é a primeira vez que o texto de UM usuário é mostrado para OUTRO.
// React já escapa texto por padrão (renderizado como children, não
// dangerouslySetInnerHTML), então isto não é defesa contra XSS — é só
// contra lixo/tamanho desproporcional vindo de um cliente de socket cru
// (que não passa pelo formulário do navegador).
const MAX_LEN = 20;
const FALLBACK = 'Convidado';

export const sanitizeNickname = (raw) => {
  if (typeof raw !== 'string') return FALLBACK;
  const trimmed = raw.trim().slice(0, MAX_LEN);
  return trimmed || FALLBACK;
};
