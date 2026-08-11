import { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(inStandalone);

    // Check if user dismissed prompt recently
    const dismissedUntil = localStorage.getItem('englishplay_pwa_dismissed');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      setDismissed(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Dismiss for 7 days
    localStorage.setItem('englishplay_pwa_dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (isStandalone || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-prompt-banner glass-card animate-fade-in-up">
      <div className="pwa-prompt-content">
        <span className="pwa-prompt-icon">📲</span>
        <div className="pwa-prompt-text">
          <strong>Instalar o EnglishPlay</strong>
          <p>Abra em tela cheia e acesse rápido no seu celular ou computador!</p>
        </div>
      </div>
      <div className="pwa-prompt-actions">
        <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
          Instalar App
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleDismiss}>
          Depois
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
