// Aplica tema e preferência de animações no <html>.
// Os tokens de cada tema vivem em src/index.css ([data-theme="..."]).

export const DEFAULT_THEME = 'default';

// Temas vendidos na Loja (shopItems em Shop.jsx) + o padrão, sempre disponível.
export const THEMES = [
  { id: 'default', name: 'Lavanda', icon: '💜', themeColor: '#f4f2ff' },
  { id: 'ocean', name: 'Oceano', icon: '🌊', themeColor: '#eef6fb' },
  { id: 'forest', name: 'Floresta', icon: '🌲', themeColor: '#eff7f1' },
  { id: 'sunset', name: 'Pôr do Sol', icon: '🌅', themeColor: '#fff5ef' },
  { id: 'dark', name: 'Modo Escuro', icon: '🌙', themeColor: '#0f0f1a' },
  { id: 'rose', name: 'Rosa', icon: '🌸', themeColor: '#fff0f6' },
  { id: 'galaxy', name: 'Galáxia', icon: '🌌', themeColor: '#0c0a1f' },
  { id: 'winter', name: 'Inverno', icon: '❄️', themeColor: '#f0f7ff' },
];

export const getTheme = (id) => THEMES.find(t => t.id === id) || THEMES[0];

export const applyTheme = (themeId) => {
  if (typeof document === 'undefined') return;

  const theme = getTheme(themeId);
  const root = document.documentElement;

  if (theme.id === DEFAULT_THEME) {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme.id;
  }

  // Mantém a barra do navegador (mobile) em sintonia com o tema.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme.themeColor);
};

export const applyAnimations = (enabled) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.animations = enabled ? 'on' : 'off';
};
