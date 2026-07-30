import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getEntryChoice, hasEntered, setEntryChoice, clearEntryChoice,
  deveMandarParaWelcome, ROTAS_LIVRES,
} from './entryChoice';

// Ambiente node, sem jsdom (convenção do projeto) — localStorage é dublado à
// mão, do mesmo jeito que em storage.test.js.
const criarStorage = () => {
  const dados = new Map();
  return {
    getItem: (k) => (dados.has(k) ? dados.get(k) : null),
    setItem: (k, v) => dados.set(k, String(v)),
    removeItem: (k) => dados.delete(k),
  };
};

beforeEach(() => {
  globalThis.localStorage = criarStorage();
});

afterEach(() => {
  delete globalThis.localStorage;
  vi.restoreAllMocks();
});

describe('entryChoice', () => {
  it('começa sem escolha nenhuma', () => {
    expect(getEntryChoice()).toBe(null);
    expect(hasEntered()).toBe(false);
  });

  it('guarda e lê as duas escolhas válidas', () => {
    setEntryChoice('guest');
    expect(getEntryChoice()).toBe('guest');
    expect(hasEntered()).toBe(true);

    setEntryChoice('account');
    expect(getEntryChoice()).toBe('account');
  });

  it('ignora valor inválido em vez de gravar lixo', () => {
    setEntryChoice('admin');
    setEntryChoice('');
    setEntryChoice(null);
    expect(getEntryChoice()).toBe(null);
  });

  it('trata valor adulterado no localStorage como "não escolheu"', () => {
    // localStorage é entrada não confiável (ver a seção de segurança no
    // CLAUDE.md): qualquer pessoa pode escrever o que quiser aqui pelo console.
    localStorage.setItem('englishplay_entry', 'sim');
    expect(getEntryChoice()).toBe(null);
    expect(hasEntered()).toBe(false);
  });

  it('clearEntryChoice devolve a pessoa para a tela de boas-vindas', () => {
    setEntryChoice('account');
    clearEntryChoice();
    expect(hasEntered()).toBe(false);
  });

  it('não quebra quando o localStorage está bloqueado', () => {
    // (mantido junto do resto: ver o bloco abaixo para o portão de entrada)
    // Navegador em modo privado / cookies desligados: o acesso lança.
    globalThis.localStorage = {
      getItem: () => { throw new Error('bloqueado'); },
      setItem: () => { throw new Error('bloqueado'); },
      removeItem: () => { throw new Error('bloqueado'); },
    };
    expect(() => setEntryChoice('guest')).not.toThrow();
    expect(() => clearEntryChoice()).not.toThrow();
    // Cai no lado seguro: mostra a tela de boas-vindas em vez de escondê-la
    // para sempre.
    expect(getEntryChoice()).toBe(null);
  });
});

describe('portão de entrada', () => {
  it('NUNCA redireciona /welcome para ela mesma (laço infinito)', () => {
    // Este é o bug que trava o site sem dar erro nenhum no console.
    expect(deveMandarParaWelcome('/welcome', false)).toBe(false);
  });

  it('deixa /login e /register passarem para quem ainda não entrou', () => {
    // Sem isto as duas telas ficariam inalcançáveis justamente para quem
    // precisa delas — o portão as devolveria para /welcome.
    expect(deveMandarParaWelcome('/login', false)).toBe(false);
    expect(deveMandarParaWelcome('/register', false)).toBe(false);
  });

  it('toda rota livre é imune, mesmo sem ter entrado', () => {
    for (const rota of ROTAS_LIVRES) {
      expect(deveMandarParaWelcome(rota, false), rota).toBe(false);
    }
  });

  it('manda para /welcome quem ainda não escolheu, em qualquer outra rota', () => {
    for (const rota of ['/', '/games', '/games/memory', '/shop', '/settings', '/qualquer-coisa']) {
      expect(deveMandarParaWelcome(rota, false), rota).toBe(true);
    }
  });

  it('não atrapalha ninguém depois de a escolha estar feita', () => {
    for (const rota of ['/', '/games', '/welcome', '/login']) {
      expect(deveMandarParaWelcome(rota, true), rota).toBe(false);
    }
  });
});
