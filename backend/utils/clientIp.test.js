import { describe, it, expect } from 'vitest';
import { resolveClientIp } from './clientIp.js';

// Os cabeçalhos abaixo foram COPIADOS de uma medição real em produção
// (rota de diagnóstico temporária), não inventados. O IP do cliente nos
// exemplos é 170.244.201.99.
const pedido = (headers, ip = '10.0.0.1') => ({ headers, ip });

const CLIENTE = '170.244.201.99';

describe('resolveClientIp', () => {
  it('acha o cliente no caminho da Vercel (4 saltos)', () => {
    const req = pedido({
      'x-forwarded-for': `${CLIENTE},56.125.166.205, 172.71.146.212, 10.194.68.132`,
      'x-vercel-forwarded-for': CLIENTE,
    });
    expect(resolveClientIp(req)).toBe(CLIENTE);
  });

  it('acha o cliente batendo direto no Render (3 saltos)', () => {
    const req = pedido({
      'x-forwarded-for': `${CLIENTE}, 172.71.234.240, 10.197.6.7`,
    });
    expect(resolveClientIp(req)).toBe(CLIENTE);
  });

  it('IGNORA X-Forwarded-For forjado, porque o forjado entra à esquerda', () => {
    // Este é o teste que importa: sem contar da direita, o atacante escolheria
    // a própria chave e o limitador viraria enfeite.
    const req = pedido({
      'x-forwarded-for': `1.2.3.4,${CLIENTE}, 172.69.138.10, 10.196.119.130`,
    });
    expect(resolveClientIp(req)).toBe(CLIENTE);
  });

  it('resiste a forja LONGA (várias entradas injetadas de uma vez)', () => {
    const req = pedido({
      'x-forwarded-for': `9.9.9.9, 8.8.8.8, 7.7.7.7,${CLIENTE}, 172.69.1.1, 10.0.0.9`,
    });
    expect(resolveClientIp(req)).toBe(CLIENTE);
  });

  it('dois clientes diferentes recebem chaves diferentes', () => {
    // A falha que originou tudo isto: TODO mundo caía na mesma chave, então um
    // visitante sozinho esgotava a cota do site inteiro.
    const a = pedido({ 'x-forwarded-for': '203.0.113.7, 172.71.1.1, 10.0.0.1' });
    const b = pedido({ 'x-forwarded-for': '198.51.100.9, 172.71.1.1, 10.0.0.1' });
    expect(resolveClientIp(a)).not.toBe(resolveClientIp(b));
  });

  it('não devolve o IP interno do Render como chave', () => {
    const req = pedido({
      'x-forwarded-for': `${CLIENTE}, 172.71.234.240, 10.197.6.7`,
    });
    expect(resolveClientIp(req)).not.toMatch(/^10\./);
  });

  it('cai em req.ip quando não há cadeia (dev local, supertest)', () => {
    expect(resolveClientIp(pedido({}, '127.0.0.1'))).toBe('127.0.0.1');
    expect(resolveClientIp(pedido({ 'x-forwarded-for': '' }, '127.0.0.1'))).toBe('127.0.0.1');
  });

  it('cai em req.ip quando a cadeia é mais curta que o esperado', () => {
    const req = pedido({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }, '127.0.0.1');
    expect(resolveClientIp(req)).toBe('127.0.0.1');
  });

  it('não quebra com pedido malformado', () => {
    expect(() => resolveClientIp(undefined)).not.toThrow();
    expect(() => resolveClientIp({})).not.toThrow();
    expect(resolveClientIp({})).toBe('desconhecido');
  });

  it('ignora x-vercel-forwarded-for se a cadeia não tiver o formato da Vercel', () => {
    // Cabeçalho presente mas cadeia curta: não dá para contar 4 da direita,
    // então usa a regra do caminho direto em vez de confiar no cabeçalho.
    const req = pedido({
      'x-forwarded-for': `${CLIENTE}, 172.71.1.1, 10.0.0.1`,
      'x-vercel-forwarded-for': '6.6.6.6',
    });
    expect(resolveClientIp(req)).toBe(CLIENTE);
  });
});
