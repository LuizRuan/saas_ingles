import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { loadSettings, saveSettings } from '../utils/storage';
import { THEMES, DEFAULT_THEME, applyAnimations } from '../utils/appearance';
import { clearEntryChoice } from '../utils/entryChoice';
import { logoutRequest, updateProfileRequest } from '../utils/authClient';
import { isValidNickname, MAX_NICKNAME_LENGTH } from '../utils/authValidation';

const Settings = () => {
  const navigate = useNavigate();
  const { progress, resetAllProgress, setTheme } = useProgress();
  const [settings, setSettings] = useState(() => loadSettings());
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Estado REAL da conta, verificado no servidor (ver useAuthProfile) — a
  // mesma checagem que a navbar usa, então as duas telas concordam sobre
  // "logado ou não" em vez de confiar cegamente no flag local.
  const { entryChoice, profile, status: profileStatus, applyNickname, refetch: refetchAuthProfile } = useAuthProfile();
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState('idle'); // idle | saving | saved | error
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => {
    if (profile) setNicknameDraft(profile.nickname || '');
  }, [profile]);

  const handleSaveNickname = useCallback(async () => {
    if (!isValidNickname(nicknameDraft)) {
      setNicknameStatus('error');
      setNicknameError(`O apelido pode ter no máximo ${MAX_NICKNAME_LENGTH} caracteres.`);
      return;
    }
    setNicknameStatus('saving');
    setNicknameError('');
    try {
      const { user } = await updateProfileRequest(nicknameDraft.trim() || null);
      setNicknameDraft(user.nickname || '');
      applyNickname(user.nickname);
      setNicknameStatus('saved');
      setTimeout(() => setNicknameStatus('idle'), 2000);
    } catch (err) {
      setNicknameStatus('error');
      setNicknameError(err.message || 'Não foi possível salvar. Tente novamente.');
    }
  }, [nicknameDraft, applyNickname]);

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

  const handleExit = useCallback(async () => {
    // Ordem importa: derruba a sessão no servidor ANTES de esquecer a escolha,
    // senão um erro de rede deixaria o cookie de pé com a pessoa já "fora".
    // logoutRequest nunca rejeita — ver authClient.js.
    if (entryChoice === 'account') await logoutRequest();
    clearEntryChoice();
    // Mesmo motivo do Register/Login: sem isto, a navbar continuaria
    // mostrando a conta antiga (avatar, apelido) até um F5.
    refetchAuthProfile();
    navigate('/welcome', { replace: true });
  }, [entryChoice, navigate, refetchAuthProfile]);

  const handleReset = useCallback(() => {
    resetAllProgress();
    setShowConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }, [resetAllProgress]);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="page-header animate-fade-in-up">
          <Link to="/" className="btn btn-ghost page-back">← Voltar</Link>
          <h1>⚙️ Configurações</h1>
          <p className="text-secondary">Som, pronúncia, tema e animações do EnglishPlay</p>
        </div>

        {/* Entrar/Cadastro — ponto de entrada mobile, já que o .mobile-nav não
            tem folga para um 6º item. No desktop o mesmo link mora em .navbar-stats.
            Só aparece sem conta: mostrar "Entre ou crie uma conta" pra quem já
            está logado é o tipo de mensagem contraditória que faz a pessoa achar
            que o cadastro não funcionou mesmo quando funcionou. */}
        {entryChoice !== 'account' && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              <div>
                <h4>👤 Conta</h4>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Entre ou crie uma conta para salvar seu progresso</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">Entrar</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Cadastre-se</Link>
              </div>
            </div>
          </div>
        )}

        {/* Perfil — só existe pra quem tem conta. Busca o estado REAL no
            servidor em vez de confiar só no entryChoice local (ver useEffect
            acima): se a sessão não existir de verdade, isso aparece aqui em vez
            de a tela ficar muda sobre o problema. */}
        {entryChoice === 'account' && (
          <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>👤 Perfil</h4>

            {profileStatus === 'loading' && (
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Carregando perfil…</p>
            )}

            {profileStatus === 'error' && (
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>
                Não foi possível confirmar sua conta agora. Se isso continuar aparecendo, sua sessão pode
                não ter sido criada de verdade — tente <Link to="/login">entrar</Link> de novo.
              </p>
            )}

            {profileStatus === 'loaded' && profile && (
              <>
                <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                  Conectado como <strong>{profile.email}</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="nickname-input">Apelido</label>
                  <input
                    id="nickname-input"
                    type="text"
                    value={nicknameDraft}
                    onChange={(e) => setNicknameDraft(e.target.value)}
                    maxLength={MAX_NICKNAME_LENGTH}
                    placeholder="Escolha um apelido"
                    aria-invalid={nicknameStatus === 'error'}
                  />
                  {nicknameStatus === 'error' && <p className="form-error">{nicknameError}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveNickname}
                    disabled={nicknameStatus === 'saving'}
                  >
                    {nicknameStatus === 'saving' ? 'Salvando…' : 'Salvar apelido'}
                  </button>
                  {nicknameStatus === 'saved' && (
                    <span style={{ color: 'var(--accent-green)', fontSize: 'var(--fs-sm)' }}>✅ Salvo!</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

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

        {/* Conta / saída.
            Sem esta saída a tela de boas-vindas viraria um caminho de mão única:
            depois de escolher uma vez, não haveria mais como voltar a ela. Note
            que sair NÃO apaga o progresso — ele fica no aparelho, e é por isso
            que este bloco é separado do "Apagar meu progresso" logo abaixo. */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.18s' }}>
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>👤 Conta</h4>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
            Você está jogando {entryChoice === 'account' ? 'com uma conta' : 'sem conta'}.
            Sair leva de volta à tela inicial — <strong>seu progresso não é apagado</strong>.
          </p>
          <button className="btn btn-secondary" onClick={handleExit}>
            🚪 Sair
          </button>
        </div>

        {/* Reset */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.2s',
          borderColor: 'var(--border-red)' }}>
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
            Dá para jogar sem conta: seu progresso é salvo neste navegador.
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
