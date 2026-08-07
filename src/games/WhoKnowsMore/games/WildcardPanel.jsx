import { useState } from 'react';
import { useProgress } from '../../../hooks/useProgress';

const WILDCARD_CONFIGS = [
  { value: 'flip',       id: 'wildcard_flip',       icon: '🙃', name: 'Inverter' },
  { value: 'blur',       id: 'wildcard_blur',       icon: '🌫️', name: 'Névoa' },
  { value: 'shuffle',    id: 'wildcard_shuffle',    icon: '🔀', name: 'Embaralhar' },
  { value: 'time_steal', id: 'wildcard_time_steal', icon: '⏩', name: '-5s Tempo' },
  { value: 'mute',       id: 'wildcard_mute',       icon: '🤫', name: 'Silenciar' },
];

const EMOTE_OPTIONS = ['😂', '😎', '😱', '🔥', '👏', '💩'];

const WildcardPanel = ({ onUseWildcard, onSendEmote, isRoundActive = true }) => {
  const { progress, useWildcard } = useProgress();
  const [usedInMatch, setUsedInMatch] = useState([]); // array de valores usados nesta partida
  const [showEmotes, setShowEmotes]   = useState(false);
  const [emoteCooldown, setEmoteCooldown] = useState(false);

  const shopItems = progress.shopItems || [];

  // Agrupa a contagem dos coringas no inventário
  const inventoryCounts = WILDCARD_CONFIGS.reduce((acc, wc) => {
    const count = shopItems.filter(id => id === wc.id).length;
    acc[wc.value] = count;
    return acc;
  }, {});

  const handleActivate = (wc) => {
    if (!isRoundActive) return;
    if (usedInMatch.includes(wc.value)) return;
    if ((inventoryCounts[wc.value] || 0) <= 0) return;

    // Consome 1 item do inventário do jogador
    const consumed = useWildcard(wc.id);
    if (consumed) {
      setUsedInMatch(prev => [...prev, wc.value]);
      onUseWildcard(wc.value);
    }
  };

  const handleEmoteClick = (emoji) => {
    if (emoteCooldown || !onSendEmote) return;
    onSendEmote(emoji);
    setShowEmotes(false);
    setEmoteCooldown(true);
    setTimeout(() => setEmoteCooldown(false), 1500);
  };

  return (
    <div className="wildcard-panel animate-fade-in-up">
      {/* Botão de Reação / Emotes */}
      <div className="emote-picker-container">
        <button
          className="wildcard-btn"
          onClick={() => setShowEmotes(prev => !prev)}
          disabled={emoteCooldown}
          title="Enviar Reação / Emote ao oponente"
          style={{ background: 'var(--bg-purple-subtle)', borderColor: 'var(--accent-purple, #a855f7)' }}
        >
          <span>😀</span>
          <span>{emoteCooldown ? '...' : 'Reação'}</span>
        </button>

        {showEmotes && (
          <div className="emote-picker-popover">
            {EMOTE_OPTIONS.map(emoji => (
              <button
                key={emoji}
                className="emote-btn-item"
                onClick={() => handleEmoteClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, color: 'var(--accent-purple, #a855f7)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'var(--space-xs)' }}>
        🃏 Coringas:
      </span>

      {WILDCARD_CONFIGS.map(wc => {
        const count = inventoryCounts[wc.value] || 0;
        const used = usedInMatch.includes(wc.value);
        if (count === 0 && !used) return null;

        return (
          <button
            key={wc.value}
            className="wildcard-btn"
            onClick={() => handleActivate(wc)}
            disabled={!isRoundActive || used || count === 0}
            title={used ? 'Já usado nesta partida' : `Usar ${wc.name} (${count} no inventário)`}
          >
            <span>{wc.icon}</span>
            <span>{wc.name}</span>
            <span style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '99px',
              background: used ? 'var(--text-muted)' : 'var(--accent-purple, #a855f7)',
              color: 'white',
            }}>
              {used ? '✓' : `x${count}`}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WildcardPanel;
