import { describe, it, expect } from 'vitest';
import { tryMatch } from './state.js';

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
