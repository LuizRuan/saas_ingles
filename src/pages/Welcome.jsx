import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { setEntryChoice } from '../utils/entryChoice';
import './Welcome.css';

/**
 * Primeira tela de quem chega em `/`.
 *
 * Renderiza SEM a navbar (ver Layout.jsx): mostrar "583 ⭐" e o avatar para
 * alguém que ainda não entrou é justamente o que fazia a tela de login parecer
 * um pedaço do app em vez de uma tela própria.
 *
 * O "Jogar sem conta" existe por uma razão concreta, não por preguiça de gate:
 * todo o progresso do Wordly vive no `localStorage` do aparelho e nunca
 * dependeu de conta nenhuma. Exigir login para jogar não protegeria nada — só
 * trancaria a porta de um jogo que funciona offline. (E hoje, com o backend
 * ainda fora do ar, um bloqueio duro deixaria o site inteiro inacessível.)
 */
const Welcome = () => {
  const navigate = useNavigate();
  const { progress } = useProgress();

  // Quem já jogou neste aparelho não é um visitante novo: o texto muda de
  // "comece a jogar" para "continue de onde parou", com o progresso à vista
  // para deixar claro que nada se perde ao seguir sem conta.
  const jaJogou = (progress.totalScore || 0) > 0 || (progress.wordsStudied || 0) > 0;

  const entrarComoVisitante = () => {
    setEntryChoice('guest');
    navigate('/', { replace: true });
  };

  return (
    <div className="welcome">
      <div className="welcome-card">
        <img
          className="welcome-art"
          src="/hero.webp"
          alt=""
          aria-hidden="true"
          width="745"
          height="598"
          loading="eager"
          fetchPriority="high"
        />

        <h1 className="welcome-wordmark">
          <span>English</span><span className="welcome-wordmark-play">Play</span>
        </h1>

        <p className="welcome-tagline">
          {jaJogou
            ? 'Que bom te ver de novo. Continue de onde parou.'
            : 'Aprenda inglês jogando, alguns minutos por dia.'}
        </p>

        <div className="welcome-actions">
          <Link to="/login" className="btn btn-primary btn-lg welcome-action">
            Entrar
          </Link>
          <Link to="/register" className="btn btn-secondary btn-lg welcome-action">
            Criar conta
          </Link>
        </div>

        <button type="button" className="welcome-guest" onClick={entrarComoVisitante}>
          {jaJogou
            ? `Continuar sem conta — ${progress.totalScore} ⭐ salvos aqui →`
            : 'Jogar sem conta →'}
        </button>

        <p className="welcome-note">
          Seu progresso fica salvo neste aparelho. A conta serve para levá-lo
          para outros dispositivos.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
