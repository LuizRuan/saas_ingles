import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useAuthProfile } from '../hooks/useAuthProfile';
import { loadSettings, saveSettings } from '../utils/storage';
import { THEMES, DEFAULT_THEME, applyAnimations } from '../utils/appearance';
import { clearEntryChoice } from '../utils/entryChoice';
import { logoutRequest, updateProfileRequest } from '../utils/authClient';
import { isValidNickname, MAX_NICKNAME_LENGTH } from '../utils/authValidation';
import AvatarDisplay from '../components/Avatar/AvatarDisplay';
import CourseSelector from '../components/Navbar/CourseSelector';
import { getCurrentLevel, getUserTitle } from '../utils/levelSystem';

const Settings = () => {
  const navigate = useNavigate();
  const { progress, resetAllProgress, setTheme, setSelectedEffect } = useProgress();
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
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showEditNicknameModal, setShowEditNicknameModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setNicknameDraft(profile.nickname || '');
      // Se a conta ainda não tem apelido definido, libera o campo direto
      if (!profile.nickname) setIsEditingNickname(true);
    }
  }, [profile]);

  const getNicknameCooldownDays = useCallback((nicknameUpdatedAt) => {
    if (!nicknameUpdatedAt) return 0;
    const elapsed = Date.now() - new Date(nicknameUpdatedAt).getTime();
    const cooldownMs = 30 * 24 * 60 * 60 * 1000;
    if (elapsed >= cooldownMs) return 0;
    return Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000));
  }, []);

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
      refetchAuthProfile();
      setNicknameStatus('saved');
      setIsEditingNickname(false);
      setShowEditNicknameModal(false);
      setTimeout(() => setNicknameStatus('idle'), 2000);
    } catch (err) {
      setNicknameStatus('error');
      setNicknameError(err.message || 'Não foi possível salvar. Tente novamente.');
    }
  }, [nicknameDraft, applyNickname, refetchAuthProfile]);

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

        {/* Course */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <h4 style={{ marginBottom: 'var(--space-xs)' }}>🌐 Idioma do curso</h4>
          <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
            O espanhol fica visivel aqui, mas ainda esta bloqueado.
          </p>
          <CourseSelector variant="settings" />
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

            {profileStatus === 'loaded' && profile && (() => {
              const cooldownDays = getNicknameCooldownDays(profile.nicknameUpdatedAt);
              const hasNickname = Boolean(profile.nickname);

              return (
                <>
                  <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                    Conectado como <strong>{profile.email}</strong>
                  </p>

                  {!isEditingNickname && hasNickname ? (
                    <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                      <label>Apelido & Avatar</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: '8px' }}>
                        <AvatarDisplay avatar={progress.selectedAvatar || profile?.nickname?.[0]?.toUpperCase() || 'U'} size="md" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {profile.nickname}
                            </span>
                            <span className="badge badge-purple" style={{ fontSize: 'var(--fs-xs)' }}>
                              {getUserTitle(getCurrentLevel(progress.wordsStudied || 0).level).tag}
                            </span>
                          </div>
                        </div>
                        {cooldownDays > 0 ? (
                          <span className="badge badge-purple" style={{ fontSize: 'var(--fs-xs)' }}>
                            🔒 Alteração em {cooldownDays} dia(s)
                          </span>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowNicknameModal(true)}
                          >
                            ✏️ Mudar apelido
                          </button>
                        )}
                      </div>
                      {cooldownDays > 0 && (
                        <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: '6px' }}>
                          O apelido só pode ser alterado uma vez a cada 30 dias.
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
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
                        {hasNickname && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setNicknameDraft(profile.nickname || '');
                              setIsEditingNickname(false);
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                        {nicknameStatus === 'saved' && (
                          <span style={{ color: 'var(--accent-green)', fontSize: 'var(--fs-sm)' }}>✅ Salvo!</span>
                        )}
                      </div>
                    </>
                  )}


                </>
              );
            })()}
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

        {/* Music */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.03s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4>🎵 Música</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)' }}>Música de fundo e pacotes de som comprados</p>
            </div>
            <button
              className={`btn ${settings.musicEnabled ? 'btn-success' : 'btn-secondary'} btn-sm`}
              onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}>
              {settings.musicEnabled ? 'Ligado' : 'Desligado'}
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

        {/* Efeitos Visuais — só aparece quando o usuário tem ao menos um */}
        {(() => {
          const shopItems = progress.shopItems || [];
          const temConfetti = shopItems.includes('confetti');
          const temStars = shopItems.includes('stars');
          const temHearts = shopItems.includes('hearts');
          const temCoins = shopItems.includes('coins');
          const temFireworks = shopItems.includes('fireworks');
          const temRainbow = shopItems.includes('rainbow');
          const temBubbles = shopItems.includes('bubbles');
          const temAlgumEfeito = temConfetti || temStars || temHearts || temCoins || temFireworks || temRainbow || temBubbles;

          if (!temAlgumEfeito) return null;

          const activeEffect = progress.selectedEffect || null;

          const effectOptions = [
            { id: null,         label: 'Nenhum',             icon: '🚫' },
            ...(temConfetti  ? [{ id: 'confetti',  label: 'Confetti',           icon: '🎊' }] : []),
            ...(temStars     ? [{ id: 'stars',     label: 'Chuva de Estrelas',  icon: '⭐' }] : []),
            ...(temHearts    ? [{ id: 'hearts',    label: 'Chuva de Corações',  icon: '💖' }] : []),
            ...(temCoins     ? [{ id: 'coins',     label: 'Moedas Douradas',    icon: '🪙' }] : []),
            ...(temFireworks ? [{ id: 'fireworks', label: 'Fogos de Artifício', icon: '🎆' }] : []),
            ...(temRainbow   ? [{ id: 'rainbow',   label: 'Arco-Íris Mágico',   icon: '🌈' }] : []),
            ...(temBubbles   ? [{ id: 'bubbles',   label: 'Bolhas Brilhantes',  icon: '🫧' }] : []),
          ];

          return (
            <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.13s' }}>
              <h4 style={{ marginBottom: 'var(--space-xs)' }}>🎉 Efeito Visual</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', marginBottom: 'var(--space-md)' }}>
                Escolha qual efeito aparece ao acertar ou terminar uma partida
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {effectOptions.map(opt => (
                  <button
                    key={String(opt.id)}
                    className={`btn btn-sm ${activeEffect === opt.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedEffect(opt.id)}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
              {activeEffect === null && temAlgumEfeito && (
                <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
                  Nenhum efeito ativo — selecione um para vê-lo durante os jogos.
                </p>
              )}
              {activeEffect && (
                <p className="text-secondary" style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--space-sm)' }}>
                  Efeito <strong>{activeEffect === 'confetti' ? 'Confetti 🎊' : 'Fogos de Artifício 🎆'}</strong> ativo — aparecerá nos acertos e ao concluir partidas.
                </p>
              )}
            </div>
          );
        })()}

        {/* Stats */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', animationDelay: '0.15s' }}>
          <h4 style={{ marginBottom: 'var(--space-md)' }}>📊 Suas Estatísticas</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)', fontSize: 'var(--fs-sm)' }}>
            <div><span className="text-secondary">Pontuação total:</span> <strong>{progress.totalScore}</strong></div>
            {/* Nível é derivado de wordsStudied na hora, nunca lido de
                progress.currentLevel — esse campo guardado pode ficar
                desatualizado (ex.: depois de uma migração que reduz
                wordsStudied) e mostrar um número que não bate com mais nada
                no app. Mesma regra da Home.jsx e do ranking de níveis. */}
            <div><span className="text-secondary">Nível:</span> <strong>{getCurrentLevel(progress.wordsStudied || 0).level}</strong></div>
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
            Versão 3.0 • Feito com ❤️ para brasileiros aprendendo inglês
          </p>
        </div>
      </div>

      {/* Modal de Confirmação para Alterar Apelido (Posicionado na raiz para cobrir 100% da tela) */}
      {showNicknameModal && (
        <div className="modal-backdrop animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: 'var(--space-md)'
        }}>
          <div className="modal-card glass-card animate-bounce-in" style={{
            maxWidth: 440, width: '100%', padding: 'var(--space-xl)', textAlign: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 'var(--space-xs)' }}>⚠️</span>
            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Mudar Apelido?</h3>
            <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.5, marginBottom: 'var(--space-lg)' }}>
              Tem certeza que quer mudar o apelido? Você não poderá mudá-lo nos próximos <strong>30 dias</strong>.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowNicknameModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowNicknameModal(false);
                  setShowEditNicknameModal(true);
                }}
              >
                Sim, quero mudar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para digitar o novo apelido, aberto depois da confirmação acima —
          antes disso caía numa edição inline no meio da página, uma transição
          bem menos coerente vindo de um modal. */}
      {showEditNicknameModal && (
        <div className="modal-backdrop animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: 'var(--space-md)'
        }}>
          <div className="modal-card glass-card animate-bounce-in" style={{
            maxWidth: 440, width: '100%', padding: 'var(--space-xl)'
          }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>✏️ Novo Apelido</h3>
            <div className="form-group">
              <label htmlFor="nickname-modal-input">Apelido</label>
              <input
                id="nickname-modal-input"
                type="text"
                value={nicknameDraft}
                onChange={(e) => setNicknameDraft(e.target.value)}
                maxLength={MAX_NICKNAME_LENGTH}
                placeholder="Escolha um apelido"
                aria-invalid={nicknameStatus === 'error'}
                autoFocus
              />
              {nicknameStatus === 'error' && <p className="form-error">{nicknameError}</p>}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setNicknameDraft(profile?.nickname || '');
                  setNicknameStatus('idle');
                  setNicknameError('');
                  setShowEditNicknameModal(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveNickname}
                disabled={nicknameStatus === 'saving'}
              >
                {nicknameStatus === 'saving' ? 'Salvando…' : 'Salvar apelido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
