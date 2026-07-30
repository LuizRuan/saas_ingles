import { describe, it, expect } from 'vitest';
import { ehFalhaDeCarregamento } from './chunkError';

/**
 * Não há jsdom neste projeto, então o ErrorBoundary em si não é renderizado
 * aqui. O que dá para testar — e é onde mora o risco — é a classificação do
 * erro: as mensagens abaixo são as reais de cada navegador quando um `import()`
 * de rota falha, e um regex que erra uma delas deixa a pessoa presa numa tela
 * de erro que um recarregamento resolveria.
 */
describe('ehFalhaDeCarregamento', () => {
  it('reconhece a falha de import() em cada navegador', () => {
    const reais = [
      // Chrome / Edge
      'Failed to fetch dynamically imported module: https://site.com/assets/Shop-a1b2.js',
      // Firefox
      'error loading dynamically imported module',
      // Safari
      'Importing a module script failed.',
      // Bundlers mais antigos ainda usam este nome
      'Loading chunk 42 failed.',
    ];
    for (const message of reais) {
      expect(ehFalhaDeCarregamento({ message }), message).toBe(true);
    }
  });

  it('reconhece pelo name, não só pela mensagem', () => {
    expect(ehFalhaDeCarregamento({ name: 'ChunkLoadError', message: '' })).toBe(true);
  });

  it('NÃO trata bug de código como falha de rede', () => {
    // Este é o falso positivo caro: recarregar em cima de um TypeError esconde
    // o bug e ainda joga a pessoa num laço de recarregamento.
    const bugs = [
      "Cannot read properties of undefined (reading 'gamesCompleted')",
      'addCoins is not a function',
      'Maximum update depth exceeded',
      'Rendered more hooks than during the previous render.',
    ];
    for (const message of bugs) {
      expect(ehFalhaDeCarregamento({ message }), message).toBe(false);
    }
  });

  it('aguenta erro sem message, sem name, null e undefined', () => {
    // componentDidCatch pode receber qualquer coisa que tenha sido lançada,
    // inclusive um throw de string ou de null.
    expect(ehFalhaDeCarregamento(null)).toBe(false);
    expect(ehFalhaDeCarregamento(undefined)).toBe(false);
    expect(ehFalhaDeCarregamento({})).toBe(false);
    expect(ehFalhaDeCarregamento('só um texto solto')).toBe(false);
  });
});
