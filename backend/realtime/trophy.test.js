import { describe, it, expect } from 'vitest';
import { decideTrophyAward } from './trophy.js';

const makeMatch = (aData = {}, bData = {}) => ({
  players: [{ socketId: 'a', nickname: 'Ana' }, { socketId: 'b', nickname: 'Beto' }],
  playerData: new Map([
    ['a', { userId: null, avatar: 'U', ...aData }],
    ['b', { userId: null, avatar: 'U', ...bData }],
  ]),
});

describe('decideTrophyAward', () => {
  it('premia o vencedor quando os dois estão logados em contas diferentes', () => {
    const match = makeMatch({ userId: 'user-a', avatar: '🦊' }, { userId: 'user-b' });
    expect(decideTrophyAward(match, 'a')).toEqual({ userId: 'user-a', nickname: 'Ana', avatar: '🦊' });
  });

  it('empate (sem winnerSocketId) não premia', () => {
    const match = makeMatch({ userId: 'user-a' }, { userId: 'user-b' });
    expect(decideTrophyAward(match, null)).toBeNull();
  });

  it('convidado de um dos lados não premia', () => {
    const match = makeMatch({ userId: 'user-a' }, { userId: null });
    expect(decideTrophyAward(match, 'a')).toBeNull();
  });

  it('mesma conta nas duas pontas não premia', () => {
    const match = makeMatch({ userId: 'user-x' }, { userId: 'user-x' });
    expect(decideTrophyAward(match, 'a')).toBeNull();
  });

  it('vencedor convidado (mesmo com perdedor logado) não premia', () => {
    const match = makeMatch({ userId: null }, { userId: 'user-b' });
    expect(decideTrophyAward(match, 'a')).toBeNull();
  });
});
