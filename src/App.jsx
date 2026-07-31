import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './hooks/useProgress';
import { PresenceProvider } from './hooks/usePresence';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import EntryGate from './components/EntryGate';
import Home from './pages/Home';
/* Welcome NÃO é lazy: quem chega em `/` pela primeira vez é redirecionado para
   cá, e um chunk separado custaria uma ida ao servidor bem no primeiro
   desenho da tela — no primeiro contato com o site, justamente. É pequena. */
import Welcome from './pages/Welcome';

/* A Home é a única tela carregada junto com o app — é onde todo mundo entra, e
   colocá-la atrás de um Suspense só adicionaria um piscar antes do conteúdo.
   Todo o resto é `lazy`: antes disso o bundle era um arquivo só de ~615 kB, e
   quem abria a Home baixava o socket.io-client inteiro (~40 kB, usado só pelo
   duelo de "Quem Sabe Mais?") e as 18 conversas em grafo (~72 kB, usadas só na
   tela de Conversa). Isso importa aqui mais que a média: o público é brasileiro,
   em boa parte no celular e em rede móvel.

   Os `import()` ficam inline de propósito. Extraí-los para uma constante antes
   do lazy() faz o Rollup perder o rastro estático e voltar a juntar tudo. */
const Games = lazy(() => import('./pages/Games'));
const MemoryGame = lazy(() => import('./games/MemoryGame/MemoryGame'));
const HangmanGame = lazy(() => import('./games/HangmanGame/HangmanGame'));
const WordBuilder = lazy(() => import('./games/WordBuilder/WordBuilder'));
const SentenceBuilder = lazy(() => import('./games/SentenceBuilder/SentenceBuilder'));
const TranslationQuiz = lazy(() => import('./games/TranslationQuiz/TranslationQuiz'));
const FillBlanks = lazy(() => import('./games/FillBlanks/FillBlanks'));
const TrueFalse = lazy(() => import('./games/TrueFalse/TrueFalse'));
const ListeningGame = lazy(() => import('./games/ListeningGame/ListeningGame'));
const WhoKnowsMore = lazy(() => import('./games/WhoKnowsMore/WhoKnowsMore'));
const Conversation = lazy(() => import('./pages/Conversation'));
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'));
const MyWords = lazy(() => import('./pages/MyWords'));
const Stories = lazy(() => import('./pages/Stories'));
const ReviewErrors = lazy(() => import('./pages/ReviewErrors'));
const Levels = lazy(() => import('./pages/Levels'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Settings = lazy(() => import('./pages/Settings'));
const Shop = lazy(() => import('./pages/Shop'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

/* Fica DENTRO do Layout, então a navbar não some enquanto o pedaço da rota
   chega — sem isso a tela inteira pisca a cada troca de página. */
const CarregandoTela = () => (
  <div className="page" role="status" aria-live="polite">
    <div className="container" style={{ textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
      <span className="spinner spinner-lg" />
      <p className="text-secondary">Carregando…</p>
    </div>
  </div>
);

function App() {
  return (
    <ProgressProvider>
      {/* Presença por heartbeat HTTP, em toda página (ver usePresence.jsx).
          O socket do duelo continua só na tela de "Quem Sabe Mais?". */}
      <PresenceProvider>
      <BrowserRouter>
        {/* Manda quem ainda não escolheu como entrar para /welcome. Fica FORA do
            Layout porque as telas de entrada não têm navbar. */}
        <EntryGate>
        <Layout>
          {/* Dentro do Layout de propósito: se uma tela quebrar, a navbar
              continua na página e dá para sair para outra rota sem recarregar. */}
          <ErrorBoundary>
          <Suspense fallback={<CarregandoTela />}>
            <Routes>
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/memory" element={<MemoryGame />} />
              <Route path="/games/hangman" element={<HangmanGame />} />
              <Route path="/games/word-builder" element={<WordBuilder />} />
              <Route path="/games/sentence-builder" element={<SentenceBuilder />} />
              <Route path="/games/translation" element={<TranslationQuiz />} />
              <Route path="/games/fill-blanks" element={<FillBlanks />} />
              <Route path="/games/true-false" element={<TrueFalse />} />
              <Route path="/games/listening" element={<ListeningGame />} />
              <Route path="/games/who-knows-more" element={<WhoKnowsMore />} />
              <Route path="/conversation" element={<Conversation />} />
              <Route path="/daily" element={<DailyChallenge />} />
              <Route path="/my-words" element={<MyWords />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/review" element={<ReviewErrors />} />
              <Route path="/levels" element={<Levels />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              {/* Sempre por último: React Router casa a primeira Route que bate,
                  então qualquer rota real acima desta continua vencendo. */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </Layout>
        </EntryGate>
      </BrowserRouter>
      </PresenceProvider>
    </ProgressProvider>
  );
}

export default App;
