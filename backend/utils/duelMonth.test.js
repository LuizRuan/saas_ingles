import { describe, it, expect } from 'vitest';
import { currentMonthKey } from './duelMonth.js';

describe('currentMonthKey', () => {
  it('formata como YYYY-MM em UTC', () => {
    expect(currentMonthKey(new Date('2026-08-06T23:50:00Z'))).toBe('2026-08');
  });

  it('vira o mês exatamente na virada UTC', () => {
    expect(currentMonthKey(new Date('2026-09-01T00:00:00Z'))).toBe('2026-09');
  });

  it('sem argumento, usa a hora atual', () => {
    expect(currentMonthKey()).toBe(new Date().toISOString().slice(0, 7));
  });
});
