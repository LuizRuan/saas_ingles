import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { loadSettings, saveSettings } from '../utils/storage';
import { THEMES, DEFAULT_THEME, applyAnimations } from '../utils/appearance';

const Settings = () => {
  const { progress, resetAllProgress, setTheme } = useProgress();
  const [settings, setSettings] = useState(() => loadSettings());
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const updateSetting = useCallback((key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);

    // Efeito imediato: o CSS reage ao atributo em <html>
    if (key === 'animationsEnabled') applyAnimations(value);
  }, [settings]);

  const ownedThemes = THEMES.filter(
    theme => theme.id === DEFAULT_THEME || (progress.shopItems || []).includes(`theme_${theme.id}`)
  );
  const activeTheme = progress.selectedTheme || DEFAULT_THEME;

  const handleReset = useCallback(() => {
    resetAllProgress();
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }, [resetAllProgress]);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-xl)' }}>
          <Link to="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-md)' }}>← Voltar</Link>
          <h1>⚙️ Configurações</h1>
        </div>

        {/* Sound */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>🔊 Sons</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Efeitos sonoros e pronúncia</p>
            </div>
            <button
              className={`btn ${settings.soundEnabled ? 'btn-success' : 'btn-secondary'} btn-sm`}
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}>
              {settings.soundEnabled ? 'Ligado' : 'Desligado'}
            </button>
          </div>
        </div>

        {/* Animations */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>✨ Animações</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Animações visuais do site</p>
            </div>
            <button
              className={`btn ${settings.animationsEnabled ? 'btn-success' : 'btn-secondary'} btn-sm`}
              onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}>
              {settings.animationsEnabled ? 'Ligado' : 'Desligado'}
            </button>
          </div>
        </div>

        {/* Auto pronounce */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>🗣️ Pronúncia automática</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Pronunciar palavras automaticamente</p>
            </div>
            <button
              className={`btn ${settings.autoPronounce ? 'btn-success' : 'btn-secondary'} btn-sm`}
              onClick={() => updateSetting('autoPronounce', !settings.autoPronounce)}>
              {settings.autoPronounce ? 'Ligado' : 'Desligado'}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.12s' }}>
          <h4 style={{ marginBottom: 'var(--space-xs)' }}>🎨 Tema</h4>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
            {ownedThemes.length > 1
              ? 'Escolha entre os temas que você já tem'
              : 'Compre novos temas na Loja para trocar as cores do site'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {ownedThemes.map(theme => (
              <button
                key={theme.id}
                className={`btn btn-sm ${activeTheme === theme.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTheme(theme.id)}>
                {theme.icon} {theme.name}
              </button>
            ))}
            {ownedThemes.length === 1 && (
              <Link to="/shop" className="btn btn-sm btn-ghost">🏪 Ver na Loja</Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.15s' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}>📊 Suas Estatísticas</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)', fontSize: 'var(--fs-sm)' }}>
            <div><span className="text-secondary">Pontuação total:</span> <strong>{progress.totalScore}</strong></div>
            <div><span className="text-secondary">Nível:</span> <strong>{progress.currentLevel}</strong></div>
            <div><span className="text-secondary">Palavras estudadas:</span> <strong>{progress.wordsStudied}</strong></div>
            <div><span className="text-secondary">Palavras aprendidas:</span> <strong>{progress.wordsLearned}</strong></div>
            <div><span className="text-secondary">Total de acertos:</span> <strong>{progress.totalCorrect}</strong></div>
            <div><span className="text-secondary">Total de erros:</span> <strong>{progress.totalWrong}</strong></div>
            <div><span className="text-secondary">Melhor sequência:</span> <strong>{progress.bestStreak}</strong></div>
            <div><span className="text-secondary">Dias seguidos:</span> <strong>{progress.dayStreak || 0}</strong></div>
            <div><span className="text-secondary">Conquistas:</span> <strong>{(progress.achievements || []).length}</strong></div>
            <div><span className="text-secondary">Desafios diários:</span> <strong>{progress.dailyChallengesCompleted || 0}</strong></div>
          </div>
        </div>

        {/* Reset */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.2s',
          borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ color: 'var(--accent-red-light)', marginBottom: 'var(--space-sm)' }}>⚠️ Apagar meu progresso</h4>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
            Isso vai apagar toda sua pontuação, palavras aprendidas, conquistas e progresso. Esta ação não pode ser desfeita.
          </p>
          {!showConfirm ? (
            <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>
              🗑️ Apagar tudo
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button className="btn btn-danger" onClick={handleReset}>
                ⚠️ Confirmar — Apagar tudo
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
            </div>
          )}
          {resetDone && (
            <p style={{ color: 'var(--accent-green)', marginTop: 'var(--space-sm)', fontSize: 'var(--fs-sm)' }}>
              ✅ Progresso apagado com sucesso!
            </p>
          )}
        </div>

        {/* About */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', animationDelay: '0.25s' }}>
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>ℹ️ Sobre o EnglishPlay</h4>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
            Plataforma gratuita para aprender inglês por meio de jogos educativos.
            Sem login, sem cadastro. Seu progresso é salvo no seu navegador.
          </p>
          <p className="text-muted" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
            Versão 1.0 • Feito com ❤️ para brasileiros aprendendo inglês
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
