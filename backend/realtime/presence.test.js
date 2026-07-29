import { describe, it, expect } from 'vitest';
import { recordPing, countActive, sweep, isValidPresenceId, PRESENCE_TTL_MS } from './presence.js';

describe('isValidPresenceId', () => {
  it('aceita uuid e ids alfanuméricos com hífen/underscore', () => {
    expect(isValidPresenceId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidPresenceId('abc_123-XYZ')).toBe(true);
  });

  it('recusa entrada não confiável', () => {
    expect(isValidPresenceId('')).toBe(false);
    expect(isValidPresenceId(null)).toBe(false);
    expect(isValidPresenceId(12345)).toBe(false);
    expect(isValidPresenceId({})).toBe(false);
    expect(isValidPresenceId('a'.repeat(200))).toBe(false);
    expect(isValidPresenceId('id com espaço')).toBe(false);
    expect(isValidPresenceId('<script>')).toBe(false);
  });
});

describe('recordPing', () => {
  it('registra um id válido', () => {
    const map = new Map();
    expect(recordPing(map, 'abc', 1000)).toBe(true);
    expect(map.get('abc')).toBe(1000);
  });

  it('renova o timestamp de um id que já existia', () => {
    const map = new Map();
    recordPing(map, 'abc', 1000);
    recordPing(map, 'abc', 5000);
    expect(map.get('abc')).toBe(5000);
    expect(map.size).toBe(1);
  });

  it('não registra id inválido', () => {
    const map = new Map();
    expect(recordPing(map, '', 1000)).toBe(false);
    expect(map.size).toBe(0);
  });
});

describe('countActive', () => {
  // O ponto principal da escolha por heartbeat: com socket.id, duas abas da
  // mesma pessoa contavam 2. Com id em localStorage, contam 1.
  it('duas abas do mesmo navegador contam como UMA pessoa', () => {
    const map = new Map();
    const mesmoId = 'navegador-do-ruan';
    recordPing(map, mesmoId, 1000); // aba 1
    recordPing(map, mesmoId, 1200); // aba 2, mesmo localStorage
    expect(countActive(map, 1300)).toBe(1);
  });

  it('conta pessoas distintas', () => {
    const map = new Map();
    recordPing(map, 'ana', 1000);
    recordPing(map, 'beto', 1000);
    expect(countActive(map, 1500)).toBe(2);
  });

  it('ignora quem passou do TTL', () => {
    const map = new Map();
    recordPing(map, 'antiga', 1000);
    recordPing(map, 'recente', 1000 + PRESENCE_TTL_MS);
    expect(countActive(map, 1000 + PRESENCE_TTL_MS + 10)).toBe(1);
  });

  it('mapa vazio dá zero', () => {
    expect(countActive(new Map(), 1000)).toBe(0);
  });
});

describe('sweep', () => {
  it('remove expirados e mantém ativos', () => {
    const map = new Map();
    recordPing(map, 'velha', 1000);
    recordPing(map, 'nova', 1000 + PRESENCE_TTL_MS);

    expect(sweep(map, 1000 + PRESENCE_TTL_MS + 10)).toBe(1);
    expect(map.has('velha')).toBe(false);
    expect(map.has('nova')).toBe(true);
  });

  it('limita o crescimento do mapa ao longo do tempo', () => {
    const map = new Map();
    for (let i = 0; i < 1000; i++) recordPing(map, `visitante-${i}`, 1000);
    expect(map.size).toBe(1000);
    expect(sweep(map, 1000 + PRESENCE_TTL_MS + 1)).toBe(0);
  });
});
