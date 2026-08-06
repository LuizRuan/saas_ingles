import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { getCurrentLevel, getNextLevel, getLevelProgress } from '../utils/levelSystem';
import { levels, stages } from '../data/categories';
import './Levels.css';

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
  const [selectedStage, setSelectedStage] = useState('all');

  const atual = getCurrentLevel(estudadas);
  const proximo = getNextLevel(estudadas);
  const percentual = getLevelProgress(estudadas);

  const contagem = levels.reduce((acc, n) => {
    acc[situacaoDe(n, atual)] += 1;
    return acc;
  }, { concluido: 0, atual: 0, bloqueado: 0 });

  const filteredLevels = selectedStage === 'all'
    ? levels
    : levels.filter(n => n.stage === selectedStage);

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-md)' }}>← Voltar</Link>

        {/* Cabeçalho + panorama */}
        <header className="levels-header animate-fade-in-up">
          <div className="levels-title">
            <span className="levels-title-icon" aria-hidden="true">📊</span>
            <div>
              <h1>Níveis ({levels.length})</h1>
              <p className="text-secondary">Acompanhe sua evolução e desbloqueie as 50 fases do aprendizado</p>
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
            <p className="levels-eyebrow">Nível {atual.level} de 50</p>
            <h2>{atual.name}</h2>
            <p className="text-secondary">{atual.description}</p>

            <div className="progress-bar levels-featured-bar">
              <div className="progress-bar-fill" style={{ width: `${percentual}%` }} />
            </div>

            <p className="levels-featured-meta">
              {proximo
                ? <><strong>{estudadas} / {proximo.wordsNeeded}</strong> palavras para o próximo nível</>
                : <>Você chegou ao último nível (Nível 50) com <strong>{estudadas}</strong> palavras estudadas!</>}
            </p>
          </div>

          <Link to="/games" className="btn btn-primary levels-featured-cta">
            {proximo ? 'Continuar' : 'Praticar'} →
          </Link>
        </section>

        {/* Filtros por Estágios */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <button
            className={`btn btn-sm ${selectedStage === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedStage('all')}>
            🌐 Todos os 50 Níveis
          </button>
          {stages.map(st => (
            <button
              key={st.stage}
              className={`btn btn-sm ${selectedStage === st.stage ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedStage(st.stage)}>
              {st.icon} Estágio {st.stage}: {st.name}
            </button>
          ))}
        </div>

        {/* A trilha de 50 níveis */}
        <ol className="levels-track">
          {filteredLevels.map((nivel, i) => {
            const situacao = situacaoDe(nivel, atual);
            const preenchimento = situacao === 'concluido' ? 100 : situacao === 'atual' ? percentual : 0;
            const faltam = Math.max(0, nivel.wordsNeeded - estudadas);

            return (
              <li
                key={nivel.level}
                className={`glass-card levels-step ${situacao}`}
                style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
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
