import { describe, it, expect, vi } from 'vitest';
import { tryMatch, createMatch, destroyMatch, matches } from './state.js';

describe('tryMatch', () => {
  it('não pareia com menos de 2 na fila', () => {
    expect(tryMatch([]).pair).toBeNull();
    expect(tryMatch([{ socketId: 'a' }]).pair).toBeNull();
  });

  it('pareia os 2 mais antigos (FIFO)', () => {
    const queue = [{ socketId: 'a' }, { socketId: 'b' }, { socketId: 'c' }];
    const { pair, rest } = tryMatch(queue);
    expect(pair.map(p => p.socketId)).toEqual(['a', 'b']);
    expect(rest.map(p => p.socketId)).toEqual(['c']);
  });

  it('não muta a fila original (função pura)', () => {
    const queue = [{ socketId: 'a' }, { socketId: 'b' }];
    tryMatch(queue);
    expect(queue).toHaveLength(2);
  });
});

const players = [{ socketId: 'a', nickname: 'Ana' }, { socketId: 'b', nickname: 'Beto' }];

describe('createMatch', () => {
  it('declara todos os campos do ciclo de rodada', () => {
    const m = createMatch(players, 'translation');
    // usedIndices era usado por index.js mas nunca declarado aqui, dependendo
    // de `new Set(undefined)` funcionar por acidente.
    expect(m.usedIndices).toEqual([]);
    expect(m.roundClosed).toBe(false);
    expect(m.roundIndex).toBe(-1);   // startRound incrementa para 0
    expect(m.pauseTimer).toBeNull();
    expect(m.roundTimer).toBeNull();
    expect(Object.fromEntries(m.scores)).toEqual({ a: 0, b: 0 });
    destroyMatch(m.id);
  });
});

describe('destroyMatch', () => {
  // Teste de COMPORTAMENTO em vez de espiar clearTimeout: o que importa é que
  // nenhum dos dois callbacks dispare depois de destruir. Antes só o timer da
  // rodada era limpo, e o da pausa ficava pendurado.
  it('limpa OS DOIS timers — nenhum callback dispara depois', () => {
    vi.useFakeTimers();
    let roundFired = false;
    let pauseFired = false;

    const m = createMatch(players, 'translation');
    m.roundTimer = setTimeout(() => { roundFired = true; }, 50);
    m.pauseTimer = setTimeout(() => { pauseFired = true; }, 50);

    destroyMatch(m.id);
    vi.advanceTimersByTime(200);

    expect(roundFired).toBe(false);
    expect(pauseFired).toBe(false);
    expect(matches.has(m.id)).toBe(false);
    vi.useRealTimers();
  });

  it('não quebra com id inexistente', () => {
    expect(() => destroyMatch('nao-existe')).not.toThrow();
  });
});
