import { useState } from 'react';
import { Link } from 'react-router-dom';
import { stories, STORY_LEVELS } from '../data/stories';
import StoryText from '../components/Story/StoryText';
import StoryWordModal from '../components/Story/StoryWordModal';
import './Stories.css';

// Tela de leitura pura: sem useProgress, sem pontos, sem conquista. Ler uma
// história aqui não conta como jogo — é referência/estudo, igual a Palavras.
const LEVEL_BADGE = { iniciante: 'badge-blue', intermediario: 'badge-purple' };

const Stories = () => {
  const [levelFilter, setLevelFilter] = useState('todos');
  const [activeStory, setActiveStory] = useState(null);
  const [activeWordKey, setActiveWordKey] = useState(null);

  const visibleStories = levelFilter === 'todos'
    ? stories
    : stories.filter((s) => s.level === levelFilter);

  if (activeStory) {
    return (
      <div className="page">
        <div className="container">
          <div className="page-header animate-fade-in-up">
            <button className="btn btn-ghost page-back" onClick={() => setActiveStory(null)}>← Voltar</button>
            <h1>{activeStory.icon} {activeStory.title}</h1>
            <p className="text-secondary">
              {activeStory.titlePt} · <span className={`badge ${LEVEL_BADGE[activeStory.level]}`}>{STORY_LEVELS[activeStory.level]}</span>
            </p>
          </div>

          <div className="glass-card story-reader">
            {activeStory.paragraphs.map((p, i) => (
              <StoryText key={i} text={p} onWordClick={setActiveWordKey} />
            ))}
          </div>

          <p className="text-muted story-hint" style={{ textAlign: 'center' }}>
            💡 Clique em qualquer palavra do texto para ver 5 frases de exemplo.
          </p>
        </div>

        {activeWordKey && (
          <StoryWordModal wordKey={activeWordKey} onClose={() => setActiveWordKey(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <Link to="/" className="btn btn-ghost page-back">← Voltar</Link>
          <h1>📜 Histórias</h1>
          <p className="text-secondary">
            Histórias curtas em inglês. Clique em qualquer palavra do texto para ver exemplos de uso.
          </p>
        </div>

        <div className="story-filters animate-fade-in-up">
          <button
            className={`btn btn-sm ${levelFilter === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLevelFilter('todos')}
          >
            Todos
          </button>
          {Object.entries(STORY_LEVELS).map(([id, label]) => (
            <button
              key={id}
              className={`btn btn-sm ${levelFilter === id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLevelFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="story-grid animate-fade-in-up">
          {visibleStories.map((s) => (
            <button key={s.id} className="glass-card story-card" onClick={() => setActiveStory(s)}>
              <span className="story-card-icon">{s.icon}</span>
              <div className="story-card-body">
                <h3>{s.title}</h3>
                <p className="text-secondary">{s.titlePt}</p>
                <p className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>{s.summaryPt}</p>
              </div>
              <span className={`badge ${LEVEL_BADGE[s.level]} story-card-level`}>{STORY_LEVELS[s.level]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stories;
