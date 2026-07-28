import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { getCurrentLevel, getNextLevel, getLevelProgress } from '../utils/levelSystem';
import { levels } from '../data/categories';
import './Levels.css';

// Os níveis são limiares sobre o total de palavras DISTINTAS já estudadas
// (progress.wordsStudied), não baldes de palavras. Não confundir com o campo
// `level` de data/words.js, que é dificuldade da palavra e vai só até 7.
const situacaoDe = (nivel, atual) => {
  if (nivel.level < atual.level) return 'concluido';
  if (nivel.level === atual.level) return 'atual';
  return 'bloqueado';
};

const ROTULO = {
  concluido: 'Concluído',
  atual: 'Em andamento',
  bloqueado: 'Bloqueado',
};

const Levels = () => {
  const { progress } = useProgress();
  const estudadas = progress.wordsStudied || 0;

  const atual = getCurrentLevel(estudadas);
  const proximo = getNextLevel(estudadas);
  const percentual = getLevelProgress(estudadas);

  const contagem = levels.reduce((acc, n) => {
    acc[situacaoDe(n, atual)] += 1;
    return acc;
  }, { concluido: 0, atual: 0, bloqueado: 0 });

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-md)' }}>← Voltar</Link>

        {/* Cabeçalho + panorama */}
        <header className="levels-header animate-fade-in-up">
          <div className="levels-title">
            <span className="levels-title-icon" aria-hidden="true">📊</span>
            <div>
              <h1>Níveis</h1>
              <p className="text-secondary">Acompanhe sua evolução e desbloqueie novas fases</p>
            </div>
          </div>

          <ul className="levels-summary">
            <li className="glass-card levels-summary-card">
              <span className="levels-summary-icon concluido" aria-hidden="true">✓</span>
              <div>
                <strong>{contagem.concluido}</strong>
                <span>{contagem.concluido === 1 ? 'concluído' : 'concluídos'}</span>
              </div>
            </li>
            <li className="glass-card levels-summary-card">
              <span className="levels-summary-icon atual" aria-hidden="true">▶</span>
              <div>
                <strong>{contagem.atual}</strong>
                <span>em andamento</span>
              </div>
            </li>
            <li className="glass-card levels-summary-card">
              <span className="levels-summary-icon bloqueado" aria-hidden="true">🔒</span>
              <div>
                <strong>{contagem.bloqueado}</strong>
                <span>{contagem.bloqueado === 1 ? 'bloqueado' : 'bloqueados'}</span>
              </div>
            </li>
          </ul>
        </header>

        {/* Nível atual em destaque */}
        <section className="glass-card levels-featured animate-fade-in-up">
          <span className="levels-featured-icon" aria-hidden="true">{atual.icon}</span>

          <div className="levels-featured-body">
            <p className="levels-eyebrow">Nível {atual.level}</p>
            <h2>{atual.name}</h2>
            <p className="text-secondary">{atual.description}</p>

            <div className="progress-bar levels-featured-bar">
              <div className="progress-bar-fill" style={{ width: `${percentual}%` }} />
            </div>

            <p className="levels-featured-meta">
              {proximo
                ? <><strong>{estudadas} / {proximo.wordsNeeded}</strong> palavras para o próximo nível</>
                : <>Você chegou ao último nível com <strong>{estudadas}</strong> palavras estudadas</>}
            </p>
          </div>

          <Link to="/games" className="btn btn-primary levels-featured-cta">
            {proximo ? 'Continuar' : 'Praticar'} →
          </Link>
        </section>

        {/* A trilha completa. É uma sequência de verdade, então numerar informa. */}
        <ol className="levels-track">
          {levels.map((nivel, i) => {
            const situacao = situacaoDe(nivel, atual);
            const preenchimento = situacao === 'concluido' ? 100 : situacao === 'atual' ? percentual : 0;
            const faltam = Math.max(0, nivel.wordsNeeded - estudadas);

            return (
              <li
                key={nivel.level}
                className={`glass-card levels-step ${situacao}`}
                style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
              >
                <span className="levels-step-number" aria-hidden="true">
                  {situacao === 'concluido' ? '✓' : nivel.level}
                </span>
                <span className="levels-step-icon" aria-hidden="true">{nivel.icon}</span>

                <div className="levels-step-body">
                  <p className="levels-eyebrow">Nível {nivel.level}</p>
                  <h3>{nivel.name}</h3>
                  <p className="text-secondary">{nivel.description}</p>
                </div>

                <div className="levels-step-progress">
                  {situacao !== 'bloqueado' ? (
                    <>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${preenchimento}%` }} />
                      </div>
                      <span className="text-muted">
                        {situacao === 'concluido'
                          ? 'Nível completo'
                          : proximo
                            ? `${estudadas} / ${proximo.wordsNeeded} palavras`
                            : `${estudadas} palavras`}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted">
                      {faltam === 1 ? 'Falta 1 palavra' : `Faltam ${faltam} palavras`}
                    </span>
                  )}
                </div>

                <span className={`levels-step-status ${situacao}`}>
                  {situacao === 'bloqueado' && <span aria-hidden="true">🔒 </span>}
                  {ROTULO[situacao]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default Levels;
