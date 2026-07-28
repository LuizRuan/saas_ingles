import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { loadProgress, loadSettings } from './utils/storage';
import { applyAnimations, applyTheme } from './utils/appearance';
import './index.css';

// Aplica a aparência antes do primeiro render para evitar piscar o tema errado.
// Depois disso, o ProgressProvider mantém o tema sincronizado.
applyTheme(loadProgress().selectedTheme);
applyAnimations(loadSettings().animationsEnabled);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
