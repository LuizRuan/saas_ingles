import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { getEntryChoice } from '../utils/entryChoice';
import { getProfileRequest } from '../utils/authClient';

// Estado REAL da conta, verificado no servidor — entryChoice é só a escolha
// local salva depois de um cadastro/login que pareceu funcionar; se o cookie
// de sessão nunca existiu de verdade (ou expirou), este pedido falha com 401
// e `status` vira 'error'.
//
// É um Context (não só um hook) de propósito: a navbar (Layout, monta uma
// vez por sessão) e a tela de Perfil (Settings, monta a cada visita) senão
// teriam cada uma sua própria cópia — trocar o apelido em Settings não
// atualizaria a navbar até um F5. `applyNickname` deixa quem salvou aplicar
// o valor novo na cópia compartilhada, sem precisar buscar tudo de novo.
//
// `refetch` PRECISA ser chamado explicitamente por quem muda entryChoice
// (Register/Login logo após setEntryChoice, Settings logo após
// clearEntryChoice) — este Provider mora acima do BrowserRouter e não lê
// nenhum contexto de rota, então nada o re-renderiza sozinho quando a escolha
// muda: sem o refetch explícito, o Provider ficava congelado no valor de
// quando montou (visitante ainda sem conta) e o modal de apelido obrigatório
// nunca aparecia depois de um cadastro de verdade.
const AuthProfileContext = createContext(null);

export const AuthProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | loaded | error

  const refetch = useCallback(() => {
    if (getEntryChoice() !== 'account') {
      setProfile(null);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    getProfileRequest()
      .then(({ user }) => {
        setProfile(user);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  // Uma vez no carregamento: cobre quem já chega com entryChoice='account' de
  // uma sessão anterior (localStorage persistiu). Depois disso, quem muda
  // entryChoice é responsável por chamar refetch() de novo.
  useEffect(() => { refetch(); }, [refetch]);

  const applyNickname = useCallback((nickname) => {
    setProfile((p) => (p ? { ...p, nickname } : p));
  }, []);

  return (
    <AuthProfileContext.Provider value={{ entryChoice: getEntryChoice(), profile, status, applyNickname, refetch }}>
      {children}
    </AuthProfileContext.Provider>
  );
};

export const useAuthProfile = () => useContext(AuthProfileContext);

export default useAuthProfile;
