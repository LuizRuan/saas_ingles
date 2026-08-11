import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getWords } from '../data/index';
import { categories } from '../data/categories';
import { useProgress } from '../hooks/useProgress';
import { getWordStatus } from '../utils/reviewSystem';
import WordExplanation from '../components/Game/WordExplanation';

const MyWords = () => {
  const { progress } = useProgress();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedWord, setExpandedWord] = useState(null);

  const activeCourse = progress.activeCourse || 'en-pt';
  const currentWords = useMemo(() => getWords(activeCourse), [activeCourse]);

  const wordsWithStats = useMemo(() => {
    return currentWords.map(word => ({
      ...word,
      stats: (progress.wordStats || {})[word.en] || null,
      status: getWordStatus(progress.wordStats[word.en]),
    }));
  }, [progress.wordStats]);

  const filtered = useMemo(() => {
    let result = wordsWithStats;
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(w => w.en.toLowerCase().includes(q) || w.pt.toLowerCase().includes(q));
    }
    if (filterCategory !== 'all') {
      result = result.filter(w => w.category === filterCategory);
    }
    if (filterStatus !== 'all') {
      result = result.filter(w => w.status === filterStatus);
    }
    
    return result;
  }, [wordsWithStats, search, filterCategory, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { nova: 0, aprendendo: 0, aprendida: 0 };
    wordsWithStats.forEach(w => counts[w.status]++);
    return counts;
  }, [wordsWithStats]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <Link to="/" className="btn btn-ghost page-back">← Voltar</Link>
          <h1>📖 Minhas Palavras</h1>
          <p className="text-secondary">
            Todas as palavras disponíveis para estudar
          </p>
        </div>

        {/* Status counts */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <div className="badge badge-green">✅ {statusCounts.aprendida} aprendidas</div>
          <div className="badge badge-orange">📝 {statusCounts.aprendendo} aprendendo</div>
          <div className="badge badge-blue">🆕 {statusCounts.nova} novas</div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <input type="text" placeholder="🔍 Buscar palavra..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Todas as categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos os status</option>
            <option value="aprendida">✅ Aprendidas</option>
            <option value="aprendendo">📝 Aprendendo</option>
            <option value="nova">🆕 Novas</option>
          </select>
        </div>

        {/* Word list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.length === 0 && (
            <p className="text-secondary text-center" style={{ padding: 'var(--space-2xl)' }}>
              Nenhuma palavra encontrada com esses filtros.
            </p>
          )}
          {filtered.map((word) => (
            <div key={word.en}>
              <button className="glass-card" onClick={() => setExpandedWord(expandedWord === word.en ? null : word.en)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)', cursor: 'pointer', border: 'none',
                  color: 'inherit', textAlign: 'left', background: 'var(--gradient-card)' }}>
                <span style={{ fontSize: '1.2rem', minWidth: 30 }}>
                  {word.status === 'aprendida' ? '✅' : word.status === 'aprendendo' ? '📝' : '🆕'}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-purple-light)' }}>
                    {word[ACTIVE_COURSE.targetLang]}
                  </span>
                  <span className="text-secondary"> — {word[ACTIVE_COURSE.sourceLang]}</span>
                </div>
                {word.stats && (
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', fontSize: 'var(--fs-xs)' }}>
                    <span style={{ color: 'var(--accent-green)' }}>✓{word.stats.correct}</span>
                    <span style={{ color: 'var(--accent-red)' }}>✗{word.stats.wrong}</span>
                  </div>
                )}
                <span className="text-muted">{expandedWord === word.en ? '▲' : '▼'}</span>
              </button>
              {expandedWord === word.en && (
                <div style={{ padding: 'var(--space-md)', paddingTop: 0 }}>
                  <WordExplanation word={word} />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-muted" style={{ marginTop: 'var(--space-lg)', fontSize: 'var(--fs-sm)' }}>
          Mostrando {filtered.length} de {words.length} palavras
        </p>
      </div>
    </div>
  );
};

export default MyWords;
