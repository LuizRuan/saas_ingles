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

const DIFF = { rounds: 10, levelRange: [1, 50], sizeRange: [110, 60], timeRange: [14, 6] };

describe('buildRounds', () => {
  it('devolve exatamente N rodadas', () => {
    expect(buildRounds(DIFF)).toHaveLength(10);
  });

  it('cada rodada tem 4 opções únicas, e a certa está entre elas', () => {
    for (const round of buildRounds(DIFF)) {
      expect(new Set(round.options).size).toBe(4);
      expect(round.options).toContain(round.target.en);
    }
  });

  it('os distratores são sempre da mesma categoria visual do alvo', () => {
    const byEn = new Map(imageWords.map((w) => [w.en, w]));
    for (const round of buildRounds(DIFF)) {
      for (const opt of round.options) {
        if (opt === round.target.en) continue;
        expect(byEn.get(opt).category, opt).toBe(round.target.category);
      }
    }
  });

  it('regressão: nunca repete a mesma palavra-alvo na mesma partida', () => {
    const rounds = buildRounds(DIFF);
    const alvos = rounds.map((r) => r.target.en);
    expect(new Set(alvos).size).toBe(alvos.length);
  });

  it('a dificuldade sobe ao longo da partida: imagem encolhe e tempo encolhe', () => {
    const rounds = buildRounds(DIFF);
    const primeira = rounds[0];
    const ultima = rounds[rounds.length - 1];
    expect(ultima.imageSize).toBeLessThan(primeira.imageSize);
    expect(ultima.timeSec).toBeLessThan(primeira.timeSec);
  });

  it('com 1 rodada só, não quebra (t=0, sem divisão por zero)', () => {
    const rounds = buildRounds({ ...DIFF, rounds: 1 });
    expect(rounds).toHaveLength(1);
    expect(rounds[0].options).toHaveLength(4);
  });
});
