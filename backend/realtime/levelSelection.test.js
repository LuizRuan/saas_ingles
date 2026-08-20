import { describe, it, expect } from 'vitest';
import { pickByLevel, pickOneByLevel, resolveLevel, DEFAULT_LEVEL, MAX_LEVEL } from './levelSelection.js';

const bancoPares = (n) => Array.from({ length: n }, (_, i) => ({ w: { en: `word${i}`, level: i + 1 }, i }));

describe('pickByLevel (backend)', () => {
  it('devolve o pool inteiro embaralhado quando ele é menor ou igual a count', () => {
    const pool = bancoPares(5);
    const r = pickByLevel(pool, 50, 100, 10);
    expect(r).toHaveLength(5);
    expect(new Set(r)).toEqual(new Set(pool));
  });

  it('devolve exatamente `count` pares distintos, sem duplicatas', () => {
    const pool = bancoPares(400);
    const r = pickByLevel(pool, 30, 100, 15);
    expect(r).toHaveLength(15);
    expect(new Set(r).size).toBe(15);
  });

  it('array vazio devolve array vazio', () => {
    expect(pickByLevel([], 50, 100, 10)).toEqual([]);
  });

  it('é pura: não modifica o pool recebido', () => {
    const pool = bancoPares(200);
    const copia = [...pool];
    pickByLevel(pool, 50, 100, 15);
    expect(pool).toEqual(copia);
  });

  it('viés: nível baixo favorece pares de w.level baixo', () => {
    const pool = bancoPares(400);
    const escolhidos = pickByLevel(pool, 1, 100, 100);
    const mediaNivel = escolhidos.reduce((s, p) => s + p.w.level, 0) / escolhidos.length;
    expect(mediaNivel).toBeLessThan(100); // sem viés seria ~200
  });

  it('viés: nível alto favorece pares de w.level alto', () => {
    const pool = bancoPares(400);
    const escolhidos = pickByLevel(pool, 100, 100, 100);
    const mediaNivel = escolhidos.reduce((s, p) => s + p.w.level, 0) / escolhidos.length;
    expect(mediaNivel).toBeGreaterThan(300);
  });
});

describe('pickOneByLevel (backend)', () => {
  it('devolve um único par do pool', () => {
    const pool = bancoPares(50);
    const r = pickOneByLevel(pool, 50, 100);
    expect(pool).toContain(r);
  });
});

describe('resolveLevel', () => {
  it('aceita níveis válidos dentro de 1..100', () => {
    expect(resolveLevel(1)).toBe(1);
    expect(resolveLevel(100)).toBe(100);
    expect(resolveLevel(42)).toBe(42);
    expect(resolveLevel('42')).toBe(42); // string numérica também é aceita
  });

  it('arredonda valores fracionários', () => {
    expect(resolveLevel(42.7)).toBe(43);
  });

  it('cai no padrão para qualquer coisa não confiável', () => {
    // Nunca confiar cegamente no cliente: fora de faixa, não-numérico,
    // ausente — tudo degrada pro nível padrão, sem lançar exceção.
    expect(resolveLevel(0)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(-5)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(101)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(MAX_LEVEL + 1)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel('banana')).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(undefined)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(null)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel({})).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(NaN)).toBe(DEFAULT_LEVEL);
    expect(resolveLevel(Infinity)).toBe(DEFAULT_LEVEL);
  });
});
