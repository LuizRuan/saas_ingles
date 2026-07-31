import { describe, it, expect } from 'vitest';
import { isValidEmailFormat, isValidPassword, isValidNickname, MAX_NICKNAME_LENGTH } from './validators.js';

describe('isValidEmailFormat', () => {
  it('aceita e-mails com formato válido', () => {
    expect(isValidEmailFormat('ana@gmail.com')).toBe(true);
  });

  it('rejeita formatos inválidos', () => {
    expect(isValidEmailFormat('')).toBe(false);
    expect(isValidEmailFormat('ana@')).toBe(false);
    expect(isValidEmailFormat('ana@gmail')).toBe(false);
    expect(isValidEmailFormat(null)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('rejeita senha com 7 caracteres', () => {
    expect(isValidPassword('1234567')).toBe(false);
  });

  it('aceita senha com 8 caracteres (fronteira)', () => {
    expect(isValidPassword('12345678')).toBe(true);
  });
});

describe('isValidNickname', () => {
  it('aceita vazio/nulo (apagar o apelido é permitido)', () => {
    expect(isValidNickname(null)).toBe(true);
    expect(isValidNickname(undefined)).toBe(true);
    expect(isValidNickname('')).toBe(true);
  });

  it('aceita um apelido normal', () => {
    expect(isValidNickname('Ana')).toBe(true);
  });

  it('rejeita string só de espaços', () => {
    expect(isValidNickname('   ')).toBe(false);
  });

  it(`aceita exatamente ${MAX_NICKNAME_LENGTH} caracteres (fronteira)`, () => {
    expect(isValidNickname('a'.repeat(MAX_NICKNAME_LENGTH))).toBe(true);
  });

  it(`rejeita ${MAX_NICKNAME_LENGTH + 1} caracteres`, () => {
    expect(isValidNickname('a'.repeat(MAX_NICKNAME_LENGTH + 1))).toBe(false);
  });
});
