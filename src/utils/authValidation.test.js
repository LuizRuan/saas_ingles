import { describe, it, expect } from 'vitest';
import {
  isValidEmailFormat,
  isValidPassword,
  passwordsMatch,
  getDomainSuggestions,
  applyEmailDomain,
  EMAIL_DOMAIN_SUGGESTIONS,
  isValidNickname,
  MAX_NICKNAME_LENGTH,
} from './authValidation';

describe('isValidEmailFormat', () => {
  it('aceita e-mails com formato válido', () => {
    expect(isValidEmailFormat('ana@gmail.com')).toBe(true);
    expect(isValidEmailFormat('ana.silva@uol.com.br')).toBe(true);
  });

  it('rejeita formatos inválidos', () => {
    expect(isValidEmailFormat('')).toBe(false);
    expect(isValidEmailFormat('ana@')).toBe(false);
    expect(isValidEmailFormat('ana@gmail')).toBe(false);
    expect(isValidEmailFormat('ana gmail.com')).toBe(false);
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

  it('não exige maiúscula, número ou símbolo', () => {
    expect(isValidPassword('somenteletrasminusculas')).toBe(true);
  });
});

describe('passwordsMatch', () => {
  it('confirma quando as duas senhas são iguais e não vazias', () => {
    expect(passwordsMatch('senha1234', 'senha1234')).toBe(true);
  });

  it('rejeita senhas diferentes', () => {
    expect(passwordsMatch('senha1234', 'outraSenha')).toBe(false);
  });

  it('rejeita quando ambas estão vazias', () => {
    expect(passwordsMatch('', '')).toBe(false);
  });
});

describe('getDomainSuggestions', () => {
  it('não sugere nada antes do @', () => {
    expect(getDomainSuggestions('ana')).toEqual([]);
  });

  it('sugere a lista inteira (até o limite) ao digitar só "@"', () => {
    const r = getDomainSuggestions('ana@');
    expect(r).toEqual(EMAIL_DOMAIN_SUGGESTIONS.slice(0, 5));
  });

  it('filtra pelo fragmento digitado depois do @', () => {
    expect(getDomainSuggestions('ana@gm')).toEqual(['gmail.com']);
    expect(getDomainSuggestions('ana@ic')).toEqual(['icloud.com']);
  });

  it('não sugere nada com um segundo @ (já inválido)', () => {
    expect(getDomainSuggestions('ana@gmail.com@')).toEqual([]);
  });

  it('é case-insensitive no fragmento', () => {
    expect(getDomainSuggestions('ana@GM')).toEqual(['gmail.com']);
  });

  it('respeita o parâmetro max', () => {
    expect(getDomainSuggestions('ana@', EMAIL_DOMAIN_SUGGESTIONS, 2)).toHaveLength(2);
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

describe('applyEmailDomain', () => {
  it('substitui o que vem depois do @ mantendo a parte local', () => {
    expect(applyEmailDomain('ana@gm', 'gmail.com')).toBe('ana@gmail.com');
    expect(applyEmailDomain('ana@', 'gmail.com')).toBe('ana@gmail.com');
  });
});
