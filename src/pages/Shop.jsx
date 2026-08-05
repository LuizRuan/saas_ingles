import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import useSound from '../hooks/useSound';

// Preços em estrelas. Referência de ganho (ver utils/scoring.js): acerto = 10,
// bônus de sequência = 20 a cada 5, conclusão de rodada = 50, desafio diário =
// 100 — ou seja, uma partida rende algo perto de 200. Os valores antigos (25 a
// 100) esvaziavam a loja na primeira sessão; estes ficam entre 7x e 8,6x deles,
// arredondados, para que cada item custe algumas partidas de verdade.
const shopItems = [
  // ── Temas ──────────────────────────────────────────────────────────────────
  { id: 'theme_ocean',  name: 'Tema Oceano',       description: 'Mude as cores do site para tons de azul oceano',      icon: '🌊', price: 400,  category: 'tema',    type: 'theme', value: 'ocean'  },
  { id: 'theme_forest', name: 'Tema Floresta',      description: 'Cores verdes e naturais para o site',                icon: '🌲', price: 400,  category: 'tema',    type: 'theme', value: 'forest' },
  { id: 'theme_sunset', name: 'Tema Pôr do Sol',    description: 'Tons quentes de laranja e rosa',                     icon: '🌅', price: 400,  category: 'tema',    type: 'theme', value: 'sunset' },
  { id: 'theme_dark',   name: 'Modo Escuro',        description: 'Tema escuro para os olhos descansarem',              icon: '🌙', price: 600,  category: 'tema',    type: 'theme', value: 'dark'   },
  { id: 'theme_rose',   name: 'Tema Rosa',          description: 'Visual delicado em tons de rosa e pink',             icon: '🌸', price: 450,  category: 'tema',    type: 'theme', value: 'rose'   },
  { id: 'theme_galaxy', name: 'Tema Galáxia',       description: 'Fundo estrelado profundo com roxo cósmico',          icon: '🌌', price: 700,  category: 'tema',    type: 'theme', value: 'galaxy' },
  { id: 'theme_winter', name: 'Tema Inverno',       description: 'Visual gelado em azul cristal e índigo',             icon: '❄️', price: 450,  category: 'tema',    type: 'theme', value: 'winter' },

  // ── Power-ups ─────────────────────────────────────────────────────────────
  { id: 'hint_pack_5',   name: 'Pacote de 5 Dicas',   description: 'Ganhe 5 dicas extras para usar nos jogos',            icon: '💡', price: 250,  category: 'powerup', type: 'hints', value: 5   },
  { id: 'hint_pack_15',  name: 'Pacote de 15 Dicas',  description: 'Ganhe 15 dicas extras — melhor custo por dica',       icon: '💡', price: 600,  category: 'powerup', type: 'hints', value: 15  },
  { id: 'hint_pack_30',  name: 'Pacote de 30 Dicas',  description: 'Ganhe 30 dicas extras — economia máxima!',            icon: '🔦', price: 1000, category: 'powerup', type: 'hints', value: 30  },
  { id: 'hint_pack_50',  name: 'Pacote de 50 Dicas',  description: '50 dicas de uma vez — para o estudante dedicado!',   icon: '🏮', price: 1500, category: 'powerup', type: 'hints', value: 50  },
  { id: 'extra_time_3',  name: 'Tempo Extra ×3',      description: '3 usos de +10s no modo Contra o Relógio',             icon: '⏰', price: 300,  category: 'powerup', type: 'timer', value: 3   },
  { id: 'extra_time_5',  name: 'Tempo Extra ×5',      description: '5 usos de +10s no modo Contra o Relógio',             icon: '⏱️', price: 450,  category: 'powerup', type: 'timer', value: 5   },
  { id: 'extra_time_10', name: 'Tempo Extra ×10',     description: '10 usos de +10s — estocar para a maratona!',          icon: '🕐', price: 750,  category: 'powerup', type: 'timer', value: 10  },
  { id: 'double_points', name: 'Pontos Duplos',       description: 'Sua próxima partida vale o dobro de pontos!',         icon: '✨', price: 750,  category: 'powerup', type: 'multiplier', value: 2 },
  { id: 'tip_trans_1',  name: 'Tradução de Dica ×1', description: '1 uso: traduz a dica do inglês pro português no Jogo da Forca', icon: '🌐', price: 200,  category: 'powerup', type: 'tip_translation', value: 1  },
  { id: 'tip_trans_3',  name: 'Tradução de Dica ×3', description: '3 usos de tradução de dica',                                      icon: '🌍', price: 600,  category: 'powerup', type: 'tip_translation', value: 3  },
  { id: 'tip_trans_5',  name: 'Tradução de Dica ×5', description: '5 usos de tradução de dica — melhor custo por uso!',              icon: '📖', price: 900,  category: 'powerup', type: 'tip_translation', value: 5  },

  // ── Avatares ──────────────────────────────────────────────────────────────
  { id: 'avatar_cat',       name: 'Avatar Gato',        description: 'Um gatinho fofo como avatar',              icon: '🐱', price: 200,  category: 'avatar', type: 'avatar', value: '🐱' },
  { id: 'avatar_dog',       name: 'Avatar Cachorro',    description: 'Um doguinho como avatar',                  icon: '🐶', price: 200,  category: 'avatar', type: 'avatar', value: '🐶' },
  { id: 'avatar_fox',       name: 'Avatar Raposa',      description: 'Uma raposa esperta como avatar',           icon: '🦊', price: 200,  category: 'avatar', type: 'avatar', value: '🦊' },
  { id: 'avatar_frog',      name: 'Avatar Sapo',        description: 'Um sapinho saltitante como avatar',        icon: '🐸', price: 200,  category: 'avatar', type: 'avatar', value: '🐸' },
  { id: 'avatar_butterfly', name: 'Avatar Borboleta',   description: 'Uma borboleta colorida como avatar',       icon: '🦋', price: 250,  category: 'avatar', type: 'avatar', value: '🦋' },
  { id: 'avatar_panda',     name: 'Avatar Panda',       description: 'Um panda fofo e tranquilo como avatar',    icon: '🐼', price: 250,  category: 'avatar', type: 'avatar', value: '🐼' },
  { id: 'avatar_robot',     name: 'Avatar Robô',        description: 'Um robô futurista como avatar',            icon: '🤖', price: 300,  category: 'avatar', type: 'avatar', value: '🤖' },
  { id: 'avatar_alien',     name: 'Avatar Alien',       description: 'Um extraterrestre misterioso como avatar', icon: '👾', price: 300,  category: 'avatar', type: 'avatar', value: '👾' },
  { id: 'avatar_lion',      name: 'Avatar Leão',        description: 'Um leão corajoso como avatar',             icon: '🦁', price: 350,  category: 'avatar', type: 'avatar', value: '🦁' },
  { id: 'avatar_unicorn',   name: 'Avatar Unicórnio',   description: 'Um unicórnio mágico como avatar',          icon: '🦄', price: 400,  category: 'avatar', type: 'avatar', value: '🦄' },
  { id: 'avatar_dragon',    name: 'Avatar Dragão',      description: 'Um dragão épico como avatar',              icon: '🐉', price: 450,  category: 'avatar', type: 'avatar', value: '🐉' },

  // ── Efeitos ───────────────────────────────────────────────────────────────
  { id: 'confetti',   name: 'Confetti',            description: 'Chuva de confete a cada resposta certa',      icon: '🎊', price: 350,  category: 'efeito', type: 'effect', value: 'confetti'  },
  { id: 'fireworks',  name: 'Fogos de Artifício',  description: 'Fogos na tela ao terminar uma partida',       icon: '🎆', price: 450,  category: 'efeito', type: 'effect', value: 'fireworks' },
];

const categories = [
  { id: 'all', name: 'Todos', icon: '🏪' },
  { id: 'tema', name: 'Temas', icon: '🎨' },
  { id: 'powerup', name: 'Power-ups', icon: '⚡' },
  { id: 'avatar', name: 'Avatares', icon: '😊' },
  { id: 'efeito', name: 'Efeitos', icon: '✨' },
];

const Shop = () => {
  const { progress, buyShopItem } = useProgress();
  const { playCorrect, playWrong } = useSound();
  const [filter, setFilter] = useState('all');
  const [buyResult, setBuyResult] = useState(null);

  const purchased = progress.shopItems || [];
  const balance = progress.totalScore;

  // Lê de `progress` em vez de `purchased`/`balance`: esses são recalculados a
  // cada render e fariam o callback trocar de identidade sem necessidade.
  const handleBuy = useCallback((item) => {
    const jaComprados = progress.shopItems || [];
    const saldo = progress.totalScore;

    const isConsumable = item.category === 'powerup' || item.type === 'hints';
    if (!isConsumable && jaComprados.includes(item.id)) return;
    if (saldo < item.price) {
      playWrong();
      setBuyResult({ type: 'error', message: `Estrelas insuficientes! Você precisa de ${item.price} ⭐ mas tem ${saldo} ⭐` });
      setTimeout(() => setBuyResult(null), 3000);
      return;
    }

    buyShopItem(item);
    playCorrect();
    setBuyResult({ type: 'success', message: `🎉 Você comprou "${item.name}"!` });
    setTimeout(() => setBuyResult(null), 3000);
  }, [progress.shopItems, progress.totalScore, buyShopItem, playCorrect, playWrong]);

  const filtered = filter === 'all' ? shopItems : shopItems.filter(i => i.category === filter);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <Link to="/" className="btn btn-ghost page-back">← Voltar</Link>
          <h1>🏪 Loja</h1>
          <p className="text-secondary">
            Gaste suas estrelas em itens especiais!
          </p>
        </div>

        {/* Balance */}
        <div className="card-flat animate-fade-in-up" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)',
          background: 'var(--gradient-primary)', color: 'white', borderColor: 'transparent'
        }}>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', opacity: 0.9 }}>Seu saldo</div>
            <div style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              ⭐ {balance}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 'var(--fs-sm)', opacity: 0.9 }}>
            <div>💡 {progress.hintsAvailable || 0} Dicas disponíveis</div>
            <div>⏰ {progress.extraTimeAvailable || 0} usos de Tempo Extra</div>
            <div>🌐 {progress.tipTranslationsAvailable || 0} Traduções de Dica</div>
            <div style={{ opacity: 0.75, fontSize: 'var(--fs-xs)' }}>
              {purchased.length} {purchased.length === 1 ? 'item comprado' : 'itens comprados'}
            </div>
          </div>
        </div>

        {/* Buy result notification */}
        {buyResult && (
          <div className="animate-fade-in-up" style={{
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-md)',
            fontWeight: 600, fontSize: 'var(--fs-sm)',
            background: buyResult.type === 'success' ? 'var(--bg-green-subtle)' : 'var(--bg-red-subtle)',
            color: buyResult.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
            border: `1px solid ${buyResult.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
          }}>
            {buyResult.message}
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat.id}
              className={`btn ${filter === cat.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(cat.id)}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
          {filtered.map((item) => {
            const isConsumable = item.category === 'powerup' || item.type === 'hints';
            const owned = !isConsumable && purchased.includes(item.id);
            const canAfford = balance >= item.price;
            
            return (
              <div key={item.id} className="card animate-fade-in-up" style={{
                opacity: owned ? 0.65 : 1,
                borderColor: owned ? 'var(--accent-green)' : undefined,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <div style={{
                    width: 52, height: 52, minWidth: 52,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--radius-lg)', fontSize: '1.5rem',
                    background: owned ? 'var(--bg-green-subtle)' : 'var(--bg-purple-subtle)',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 'var(--fs-base)', marginBottom: 2 }}>{item.name}</h4>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                      {item.description}
                    </p>
                    
                    {owned ? (
                      <span className="badge badge-green">✅ Comprado</span>
                    ) : (
                      <button
                        className={`btn ${canAfford ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                        onClick={() => handleBuy(item)}
                        style={{ opacity: canAfford ? 1 : 0.5 }}>
                        Comprar (⭐ {item.price})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shop;
