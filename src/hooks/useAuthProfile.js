import { useEffect, useState } from 'react';
import { getEntryChoice } from '../utils/entryChoice';
import { getProfileRequest } from '../utils/authClient';

// Estado REAL da conta, verificado no servidor — entryChoice é só a escolha
// local salva depois de um cadastro/login que pareceu funcionar; se o cookie
// de sessão nunca existiu de verdade (ou expirou), este pedido falha com 401
// e `status` vira 'error'. Compartilhado entre Layout (navbar) e Settings
// (card de Perfil) para as duas telas concordarem sobre "logado ou não" em
// vez de cada uma reimplementar a mesma checagem.
export const useAuthProfile = () => {
  const entryChoice = getEntryChoice();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | loaded | error

  useEffect(() => {
    if (entryChoice !== 'account') {
      setProfile(null);
      setStatus('idle');
      return;
    }
    let cancelado = false;
    setStatus('loading');
    getProfileRequest()
      .then(({ user }) => {
        if (cancelado) return;
        setProfile(user);
        setStatus('loaded');
      })
      .catch(() => {
        if (!cancelado) setStatus('error');
      });
    return () => { cancelado = true; };
  }, [entryChoice]);

  return { entryChoice, profile, status };
};

export default useAuthProfile;
