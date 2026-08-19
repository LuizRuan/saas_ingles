// Testa só buildRounds(), a lógica pura de montagem de rodadas — sem
// renderizar o componente (este repo não tem testes de render, ver
// CLAUDE.md). O que importa pinar aqui: exatamente 4 opções únicas por
// rodada, a opção certa sempre entre elas, os distratores sempre da mesma
// categoria visual da imagem (a regra central do jogo), nenhuma palavra
// repetida na mesma partida, e a dificuldade realmente subindo rodada a
// rodada (nível mínimo sobe, imagem encolhe, tempo encolhe).
import { describe, it, expect } from 'vitest';
import { buildRounds } from './ImageQuiz';
import { imageWords } from '../../data/imageWords';

const DIFF = { rounds: 10, levelSpan: [0, 1], sizeRange: [110, 60], timeRange: [14, 6] };

describe('buildRounds', () => {
  it('devolve exatamente N rodadas', () => {
    expect(buildRounds(DIFF, imageWords)).toHaveLength(10);
  });

  it('cada rodada tem 4 opções únicas, e a certa está entre elas', () => {
    for (const round of buildRounds(DIFF, imageWords)) {
      expect(new Set(round.options).size).toBe(4);
      expect(round.options).toContain(round.target.en);
    }
  });

  it('os distratores são sempre da mesma categoria visual do alvo', () => {
    const byEn = new Map(imageWords.map((w) => [w.en, w]));
    for (const round of buildRounds(DIFF, imageWords)) {
      for (const opt of round.options) {
        if (opt === round.target.en) continue;
        expect(byEn.get(opt).category, opt).toBe(round.target.category);
      }
    }
  });

  it('regressão: nunca repete a mesma palavra-alvo na mesma partida', () => {
    const rounds = buildRounds(DIFF, imageWords);
    const alvos = rounds.map((r) => r.target.en);
    expect(new Set(alvos).size).toBe(alvos.length);
  });

  it('a dificuldade sobe ao longo da partida: imagem encolhe e tempo encolhe', () => {
    const rounds = buildRounds(DIFF, imageWords);
    const primeira = rounds[0];
    const ultima = rounds[rounds.length - 1];
    expect(ultima.imageSize).toBeLessThan(primeira.imageSize);
    expect(ultima.timeSec).toBeLessThan(primeira.timeSec);
  });

  it('com 1 rodada só, não quebra (t=0, sem divisão por zero)', () => {
    const rounds = buildRounds({ ...DIFF, rounds: 1 }, imageWords);
    expect(rounds).toHaveLength(1);
    expect(rounds[0].options).toHaveLength(4);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// O eixo de dificuldade por NÍVEL, que por muito tempo foi código morto: o
// filtro lia `w.level` (inexistente nas entradas de imageWords) em vez de
// `w.word.level`, então dava sempre verdadeiro e "Difícil" sorteava o mesmo
// vocabulário que "Fácil".
// ───────────────────────────────────────────────────────────────────────────
import { AVAILABLE_COURSES, getImageWords } from '../../data/index';

const nivelMedio = (rodadas) =>
  rodadas.reduce((soma, r) => soma + (r.target.word?.level || 1), 0) / rodadas.length;

describe.each(AVAILABLE_COURSES.map(c => c.id))('dificuldade por nível — %s', (courseId) => {
  const banco = getImageWords(courseId);
  const FACIL   = { rounds: 8,  levelSpan: [0, 0.45], sizeRange: [260, 220], timeRange: [14, 10] };
  const DIFICIL = { rounds: 12, levelSpan: [0.45, 1], sizeRange: [220, 170], timeRange: [8, 5] };

  it('respeita o piso de nível, ou o banco realmente esgotou aquela faixa', () => {
    const niveis = banco.map(w => w.word?.level || 1);
    const min = Math.min(...niveis), max = Math.max(...niveis);
    const rodadas = buildRounds(FACIL, banco);
    const usadas = new Set();

    rodadas.forEach((r, i) => {
      const t = i / (rodadas.length - 1);
      const piso = Math.round(min + (max - min) * (0 + 0.45 * t));
      const nivel = r.target.word?.level || 1;

      if (nivel < piso) {
        // Só é aceitável se nenhuma palavra livre atingia aquele piso — nesse
        // caso o fallback pega a mais avançada que sobrou, nunca uma fácil.
        const livresNoPiso = banco.filter(
          w => !usadas.has(w.en) && (w.word?.level || 1) >= piso
        );
        expect(livresNoPiso, `rodada ${i}: caiu abaixo do piso com opções disponíveis`).toHaveLength(0);
      }
      usadas.add(r.target.en);
    });
  });

  it('"Difícil" sorteia vocabulário mais avançado que "Fácil"', () => {
    // A prova de que este eixo saiu do código morto: antes as duas
    // dificuldades sorteavam exatamente a mesma distribuição.
    expect(nivelMedio(buildRounds(DIFICIL, banco)))
      .toBeGreaterThan(nivelMedio(buildRounds(FACIL, banco)));
  });

  it('as primeiras rodadas são mais fáceis que as últimas', () => {
    const rodadas = buildRounds(DIFICIL, banco);
    const primeiras = nivelMedio(rodadas.slice(0, 4));
    const ultimas = nivelMedio(rodadas.slice(-4));
    expect(ultimas).toBeGreaterThanOrEqual(primeiras);
  });

  it('mesmo com o filtro ativo, as 4 opções continuam distintas', () => {
    // O risco do conserto: restringir o sorteio por nível pode esvaziar a
    // categoria e fazer o fallback repetir alternativa.
    for (const dif of [FACIL, DIFICIL]) {
      for (const r of buildRounds(dif, banco)) {
        expect(new Set(r.options).size).toBe(4);
        expect(r.options).toContain(r.target.en);
      }
    }
  });
});
