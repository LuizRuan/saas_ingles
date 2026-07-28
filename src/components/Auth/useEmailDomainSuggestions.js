import { useMemo, useState, useCallback } from 'react';
import { getDomainSuggestions } from '../../utils/authValidation';

// Estado de UI (aberto/fechado, item ativo, navegação por teclado) em cima da
// função pura getDomainSuggestions. Separado do componente de apresentação
// porque as duas telas (Cadastro e Login) precisam da mesma lógica.
//
// `dismissedFor` guarda o valor do e-mail no instante em que o usuário fechou
// a lista (Escape ou seleção). Comparar contra o valor atual, em vez de um
// booleano solto, é o que faz a lista reabrir sozinha na próxima tecla digitada
// sem precisar de um efeito colateral separado para "resetar" o fechamento.
export const useEmailDomainSuggestions = (email) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dismissedFor, setDismissedFor] = useState(null);

  const suggestions = useMemo(() => getDomainSuggestions(email), [email]);
  const isOpen = suggestions.length > 0 && email !== dismissedFor;

  const dismiss = useCallback(() => setDismissedFor(email), [email]);

  const handleKeyDown = useCallback((e, onSelect) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      dismiss();
    } else if ((e.key === 'Enter' || e.key === 'Tab') && activeIndex >= 0) {
      e.preventDefault();
      onSelect(suggestions[activeIndex]);
      setDismissedFor(null);
      setActiveIndex(-1);
    }
  }, [isOpen, suggestions, activeIndex, dismiss]);

  const select = useCallback((domain, onSelect) => {
    onSelect(domain);
    setDismissedFor(null);
    setActiveIndex(-1);
  }, []);

  return { suggestions, isOpen, activeIndex, setActiveIndex, dismiss, handleKeyDown, select };
};

export default useEmailDomainSuggestions;
