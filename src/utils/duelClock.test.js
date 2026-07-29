import { describe, it, expect } from 'vitest';
import { computeOffset, msLeft, secondsLeft, barWidthPct } from './duelClock';

describe('computeOffset', () => {
  it('é zero quando os relógios batem', () => {
    expect(computeOffset(1_000_000, 1_000_000)).toBe(0);
  });

  it('é positivo quando o cliente está atrasado', () => {
    expect(computeOffset(1_030_000, 1_000_000)).toBe(30_000);
  });

  it('é negativo quando o cliente está adiantado', () => {
    expect(computeOffset(1_000_000, 1_030_000)).toBe(-30_000);
  });

  it('cai em 0 com entrada inválida em vez de gerar NaN', () => {
    expect(computeOffset(undefined, 1000)).toBe(0);
    expect(computeOffset(1000, null)).toBe(0);
  });
});

describe('msLeft', () => {
  it('conta o tempo restante normalmente', () => {
    expect(msLeft(10_000, 0, 3_000)).toBe(7_000);
  });

  it('nunca fica negativo depois do prazo', () => {
    expect(msLeft(10_000, 0, 15_000)).toBe(0);
  });

  // regressão: relógio do cliente ADIANTADO em 10s zerava o tempo na primeira
  // renderização e travava todos os botões de resposta em silêncio.
  it('corrige relógio do cliente adiantado, em vez de nascer zerado', () => {
    const serverNow = 1_000_000;
    const clientNow = 1_010_000;           // cliente 10s à frente
    const deadline = serverNow + 10_000;   // prazo do servidor
    const offset = computeOffset(serverNow, clientNow);

    expect(msLeft(deadline, 0, clientNow)).toBe(0);            // sem correção: travado
    expect(msLeft(deadline, offset, clientNow)).toBe(10_000);  // corrigido: 10s cheios
  });

  it('corrige relógio do cliente atrasado, em vez de inflar o tempo', () => {
    const serverNow = 1_000_000;
    const clientNow = 970_000;             // cliente 30s atrás
    const deadline = serverNow + 10_000;
    const offset = computeOffset(serverNow, clientNow);

    expect(msLeft(deadline, 0, clientNow)).toBe(40_000);       // sem correção: 40s
    expect(msLeft(deadline, offset, clientNow)).toBe(10_000);  // corrigido
  });
});

describe('secondsLeft', () => {
  it('arredonda para cima, como o modo Bot', () => {
    expect(secondsLeft(10_000, 0, 9_500)).toBe(1);
    expect(secondsLeft(10_000, 0, 9_999)).toBe(1);
    expect(secondsLeft(10_000, 0, 10_000)).toBe(0);
  });
});

describe('barWidthPct', () => {
  it('mapeia o tempo restante para 0-100', () => {
    expect(barWidthPct(10_000, 10_000)).toBe(100);
    expect(barWidthPct(5_000, 10_000)).toBe(50);
    expect(barWidthPct(0, 10_000)).toBe(0);
  });

  // regressão: com o relógio do cliente atrasado, (40/10)*100 dava width: 400%
  // e a barra de tempo estourava o container.
  it('limita a 100 mesmo com tempo restante maior que o total', () => {
    expect(barWidthPct(40_000, 10_000)).toBe(100);
  });

  it('nunca devolve negativo', () => {
    expect(barWidthPct(-5_000, 10_000)).toBe(0);
  });

  it('não explode com total zero ou entrada inválida', () => {
    expect(barWidthPct(1000, 0)).toBe(0);
    expect(barWidthPct(undefined, 10_000)).toBe(0);
  });
});
