import { describe, it, expect } from 'vitest';
import { sanitizeNickname } from './nicknames.js';

describe('sanitizeNickname', () => {
  it('aceita um apelido normal', () => {
    expect(sanitizeNickname('Ana123')).toBe('Ana123');
  });

  it('corta no tamanho máximo', () => {
    expect(sanitizeNickname('a'.repeat(100)).length).toBe(20);
  });

  it('cai no padrão para entrada não-string', () => {
    expect(sanitizeNickname(undefined)).toBe('Convidado');
    expect(sanitizeNickname(null)).toBe('Convidado');
    expect(sanitizeNickname(12345)).toBe('Convidado');
    expect(sanitizeNickname({})).toBe('Convidado');
  });

  it('cai no padrão para string vazia ou só espaços', () => {
    expect(sanitizeNickname('')).toBe('Convidado');
    expect(sanitizeNickname('   ')).toBe('Convidado');
  });

  it('tira espaços das pontas', () => {
    expect(sanitizeNickname('  Ana  ')).toBe('Ana');
  });
});
