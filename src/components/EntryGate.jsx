import { Navigate, useLocation } from 'react-router-dom';
import { hasEntered, deveMandarParaWelcome } from '../utils/entryChoice';

/**
 * Manda quem ainda não escolheu como entrar para `/welcome`.
 *
 * A decisão em si mora em `deveMandarParaWelcome` (entryChoice.js), pura e
 * testada: o modo de falha aqui é laço de redirecionamento, que não dá erro —
 * só trava o site — e é justamente o que um teste de componente não alcançaria
 * neste projeto, que roda sem jsdom.
 *
 * Deliberadamente NÃO é um controle de acesso. Quem digitar `/games` direto na
 * barra de endereços é mandado para `/welcome`, mas o jogo continua sendo
 * 100% client-side e o progresso continua no `localStorage`: isto organiza a
 * primeira visita, não protege recurso nenhum.
 */
const EntryGate = ({ children }) => {
  const { pathname } = useLocation();

  // Lido a cada navegação, de propósito, em vez de guardado em estado: a
  // escolha é gravada por outra tela (Welcome/Login/Register) e um estado
  // congelado no primeiro render deixaria o portão preso no valor antigo.
  if (deveMandarParaWelcome(pathname, hasEntered())) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default EntryGate;
