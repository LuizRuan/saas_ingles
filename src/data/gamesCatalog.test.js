import { describe, it, expect } from 'vitest';
import { gamesCatalog, halo } from './gamesCatalog';
import { defaultProgress } from '../utils/storage';

describe('gamesCatalog', () => {
  it('cobre exatamente as chaves de defaultProgress.gamesCompleted', () => {
    // As duas telas leem progress.gamesCompleted[id] para mostrar o selo de
    // "já jogado". Um id fora dessa lista lê undefined e o selo nunca aparece,
    // sem erro nenhum no console.
    const doCatalogo = gamesCatalog.map((g) => g.id).sort();
    const doProgresso = Object.keys(defaultProgress.gamesCompleted).sort();
    expect(doCatalogo).toEqual(doProgresso);
  });

  it('não repete id nem rota', () => {
    const ids = gamesCatalog.map((g) => g.id);
    const rotas = gamesCatalog.map((g) => g.path);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(rotas).size).toBe(rotas.length);
  });

  it('tem todos os campos que as duas telas consomem', () => {
    // Home usa desc (linha curta), Games usa descLong (parágrafo). Faltando um
    // deles, a tela renderiza um espaço vazio em vez de quebrar.
    for (const g of gamesCatalog) {
      expect(g, g.id).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        icon: expect.any(String),
        color: expect.any(String),
        path: expect.any(String),
        desc: expect.any(String),
        descLong: expect.any(String),
      });
      expect(g.path, g.id).toMatch(/^\/games\//);
    }
  });

  it('usa cor de identidade em hex de 6 dígitos', () => {
    // halo() concatena um par de alfa no fim da string, então uma cor em
    // rgb()/hsl()/3 dígitos produziria silenciosamente um valor inválido e o
    // fundo do ícone simplesmente não pintaria.
    for (const g of gamesCatalog) {
      expect(g.color, g.id).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('halo devolve um hex de 8 dígitos válido', () => {
    expect(halo('#ec4899')).toBe('#ec489922');
    expect(halo('#ec4899')).toMatch(/^#[0-9a-f]{8}$/);
  });
});
