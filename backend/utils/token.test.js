import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { signDuelTicket, verifyDuelTicket, signSessionToken } from './token.js';

describe('signDuelTicket / verifyDuelTicket', () => {
  it('ida e volta preserva id, nickname e avatar', () => {
    const ticket = signDuelTicket({ id: 'user-1', nickname: 'Ana', avatar: '🦊' });
    const payload = verifyDuelTicket(ticket);
    expect(payload.sub).toBe('user-1');
    expect(payload.nickname).toBe('Ana');
    expect(payload.avatar).toBe('🦊');
  });

  it('rejeita um JWT de sessão comum (sem typ: duel)', () => {
    const sessionToken = signSessionToken({ _id: 'user-1', email: 'ana@gmail.com' });
    expect(() => verifyDuelTicket(sessionToken)).toThrow();
  });

  it('rejeita assinatura com segredo diferente', () => {
    const forged = jwt.sign({ sub: 'x', nickname: 'X', avatar: 'U', typ: 'duel' }, 'segredo-errado', { expiresIn: '2m' });
    expect(() => verifyDuelTicket(forged)).toThrow();
  });
});
