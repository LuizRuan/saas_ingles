import { describe, it, expect } from 'vitest';
import { pickByLevel, pickOneByLevel } from './levelSelection';

// RNG determinístico para os testes que precisam de resultado repetível —
// mesma técnica do LCG em dailyChallenge.js.
const rngSeedado = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const bancoPlano = (n, levelFn = (i) => i + 1) =>
  Array.from({ length: n }, (_, i) => ({ id: i, level: levelFn(i), en: `word${i}` }));

describe('pickByLevel', () => {
  it('devolve todo o pool embaralhado quando ele é menor ou igual a count', () => {
    const pool = bancoPlano(5);
    const r = pickByLevel(pool, 50, 100, 10);
    expect(r).toHaveLength(5);
    expect(new Set(r)).toEqual(new Set(pool));
  });

  it('devolve exatamente `count` itens distintos, sem duplicatas', () => {
    const pool = bancoPlano(500);
    const r = pickByLevel(pool, 30, 100, 20);
    expect(r).toHaveLength(20);
    expect(new Set(r).size).toBe(20);
  });

  it('é pura: não modifica o pool recebido', () => {
    const pool = bancoPlano(200);
    const copia = [...pool];
    pickByLevel(pool, 50, 100, 15);
    expect(pool).toEqual(copia);
  });

  it('array vazio devolve array vazio', () => {
    expect(pickByLevel([], 50, 100, 10)).toEqual([]);
  });

  it('funciona com maxLevel pequeno (ex.: um curso com poucos níveis)', () => {
    const pool = bancoPlano(300);
    const r = pickByLevel(pool, 4, 8, 12);
    expect(r).toHaveLength(12);
  });

  describe('viés estatístico (rodado muitas vezes, com RNG seedado)', () => {
    it('nível intermediário: as escolhas ficam concentradas perto do centro', () => {
      const pool = bancoPlano(1000); // level 1..1000, ordem já = nível
      const rng = rngSeedado(12345);
      const AMOSTRAS = 300;
      let somaDist = 0;
      for (let i = 0; i < AMOSTRAS; i++) {
        const [escolhido] = pickByLevel(pool, 50, 100, 1, rng); // nível 50/100 -> centro ~ índice 494
        somaDist += Math.abs(escolhido.level - 495);
      }
      const distMedia = somaDist / AMOSTRAS;
      // Uma escolha puramente uniforme teria distância média ~250 (1/4 do
      // range de 1000). O viés deve deixar isso BEM menor.
      expect(distMedia).toBeLessThan(150);
    });

    it('iniciante (nível 1): a maioria das escolhas fica nas palavras mais fáceis', () => {
      const pool = bancoPlano(1000);
      const rng = rngSeedado(777);
      const escolhidos = pickByLevel(pool, 1, 100, 200, rng);
      const mediaNivel = escolhidos.reduce((s, w) => s + w.level, 0) / escolhidos.length;
      // Sem viés, a média seria ~500. Enviesado pro início, deve ficar bem abaixo.
      expect(mediaNivel).toBeLessThan(200);
    });

    it('nível máximo: a maioria das escolhas fica nas palavras mais difíceis', () => {
      const pool = bancoPlano(1000);
      const rng = rngSeedado(999);
      const escolhidos = pickByLevel(pool, 100, 100, 200, rng);
      const mediaNivel = escolhidos.reduce((s, w) => s + w.level, 0) / escolhidos.length;
      expect(mediaNivel).toBeGreaterThan(800);
    });

    it('mesmo no extremo, ainda existe variedade — não são sempre os mesmos itens', () => {
      // Regressão do tipo de bug que motivou "quero algo mais equilibrado":
      // um corte rígido faz o iniciante ver sempre o mesmo punhado de
      // palavras. Aqui, em muitas rodadas de 1 item, espera-se mais de uma
      // dúzia de palavras distintas apesar do viés pro início.
      const pool = bancoPlano(1000);
      const rng = rngSeedado(42);
      const vistos = new Set();
      for (let i = 0; i < 60; i++) {
        const [escolhido] = pickByLevel(pool, 1, 100, 1, rng);
        vistos.add(escolhido.id);
      }
      expect(vistos.size).toBeGreaterThan(12);
    });
  });

  describe('independe da escala numérica do campo level', () => {
    it('curso com level 1-8 e curso com level 1-100 dão resultado proporcionalmente equivalente', () => {
      // O caso real: banco de espanhol (level 1-8) vs inglês (level 1-100).
      // Um jogador na METADE da própria escada (50/100) deve cair perto do
      // meio dos dois bancos, mesmo os bancos tendo escalas de `level`
      // completamente diferentes — porque a função ordena por RANK, não
      // pelo valor bruto.
      const bancoGrande = bancoPlano(1000, (i) => i + 1);       // level 1..1000
      const bancoPequeno = bancoPlano(1000, (i) => 1 + (i % 8)); // level 1..8, repetido
      const rng1 = rngSeedado(555);
      const rng2 = rngSeedado(555);

      const escolhasGrande = pickByLevel(bancoGrande, 50, 100, 100, rng1);
      const escolhasPequeno = pickByLevel(bancoPequeno, 50, 100, 100, rng2);

      const posicaoMediaGrande = escolhasGrande.reduce((s, w) => s + w.id, 0) / escolhasGrande.length;
      const posicaoMediaPequeno = escolhasPequeno.reduce((s, w) => s + w.id, 0) / escolhasPequeno.length;

      // As duas médias de POSIÇÃO (índice no array original, não o `level`
      // bruto) devem cair perto do meio do respectivo banco (id ~500).
      expect(posicaoMediaGrande).toBeGreaterThan(300);
      expect(posicaoMediaGrande).toBeLessThan(700);
      expect(posicaoMediaPequeno).toBeGreaterThan(300);
      expect(posicaoMediaPequeno).toBeLessThan(700);
    });
  });

  describe('regressão: espanhol nível 8 não abre o banco inteiro de uma vez', () => {
    it('o corte rígido antigo (word.level <= userLevel) desbloquearia tudo; o novo não', () => {
      // Réplica do bug real: banco de 346 palavras com level 1-8 (como
      // courses/es/words.js), jogador no nível 8 (~13 palavras estudadas).
      const banco = bancoPlano(346, (i) => 1 + Math.floor((i / 346) * 8));
      const corteRigidoAntigo = banco.filter(w => w.level <= 8);
      expect(corteRigidoAntigo.length).toBe(346); // era exatamente esse o bug

      const rng = rngSeedado(2026);
      const escolhidos = pickByLevel(banco, 8, 100, 100, rng);
      const posicaoMedia = escolhidos.reduce((s, w) => s + w.id, 0) / escolhidos.length;
      // Nível 8/100 é bem no início da escada — a posição média escolhida
      // tem que refletir isso, bem longe do meio do banco (173).
      expect(posicaoMedia).toBeLessThan(80);
    });
  });
});

describe('pickOneByLevel', () => {
  it('devolve um único item do pool', () => {
    const pool = bancoPlano(100);
    const r = pickOneByLevel(pool, 50, 100);
    expect(pool).toContain(r);
  });

  it('undefined com pool vazio, sem lançar', () => {
    expect(pickOneByLevel([], 50, 100)).toBeUndefined();
  });
});
