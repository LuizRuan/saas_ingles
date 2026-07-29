import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './hooks/useProgress';
import { PresenceProvider } from './hooks/usePresence';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Games from './pages/Games';
import MemoryGame from './games/MemoryGame/MemoryGame';
import HangmanGame from './games/HangmanGame/HangmanGame';
import WordBuilder from './games/WordBuilder/WordBuilder';
import SentenceBuilder from './games/SentenceBuilder/SentenceBuilder';
import TranslationQuiz from './games/TranslationQuiz/TranslationQuiz';
import FillBlanks from './games/FillBlanks/FillBlanks';
import TrueFalse from './games/TrueFalse/TrueFalse';
import ListeningGame from './games/ListeningGame/ListeningGame';
import WhoKnowsMore from './games/WhoKnowsMore/WhoKnowsMore';
import Conversation from './pages/Conversation';
import DailyChallenge from './pages/DailyChallenge';
import MyWords from './pages/MyWords';
import ReviewErrors from './pages/ReviewErrors';
import Levels from './pages/Levels';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <ProgressProvider>
      {/* Presença por heartbeat HTTP, em toda página (ver usePresence.jsx).
          O socket do duelo continua só na tela de "Quem Sabe Mais?". */}
      <PresenceProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
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
            <Route path="/review" element={<ReviewErrors />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      </PresenceProvider>
    </ProgressProvider>
  );
}

export default App;
