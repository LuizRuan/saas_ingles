import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import { loadProgress, loadSettings } from './utils/storage';
import { applyAnimations, applyTheme } from './utils/appearance';
import './index.css';

// Aplica a aparência antes do primeiro render para evitar piscar o tema errado.
// Depois disso, o ProgressProvider mantém o tema sincronizado.
applyTheme(loadProgress().selectedTheme);
applyAnimations(loadSettings().animationsEnabled);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Último recurso. O ErrorBoundary de dentro do Layout (App.jsx) cobre as
        telas e preserva a navbar; este aqui existe para o que acontece ACIMA
        dela — um erro no ProgressProvider, por exemplo, que aquele não alcança. */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Register Service Worker for PWA support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed
    });
  });
}
