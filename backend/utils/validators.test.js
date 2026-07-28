import { describe, it, expect } from 'vitest';
import { isValidEmailFormat, isValidPassword } from './validators.js';

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
