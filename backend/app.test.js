import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from './app.js';
import { env } from './config/env.js';
import { SESSION_COOKIE_NAME } from './utils/token.js';

// Smoke test + as rotas que NÃO dependem de MongoDB (que não está conectado
// neste ambiente). O ciclo completo register→login com banco real fica para
// quando existir um MONGODB_URI de verdade — ver backend/README.md.

describe('app', () => {
  it('é um app Express montável, sem subir servidor nem tocar o Mongo', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.listen).toBe('function');
  });

  it('GET /api/health responde sem precisar de banco', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('POST /api/auth/logout', () => {
  it('limpa o cookie e responde 200 sem precisar de banco', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('rotas que dependem de banco, sem MONGODB_URI configurado', () => {
  it('POST /api/auth/register responde 503, não trava nem derruba o processo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ana@gmail.com', password: 'senha1234' });
    expect(res.status).toBe(503);
  });

  it('POST /api/auth/login responde 503', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@gmail.com', password: 'senha1234' });
    expect(res.status).toBe(503);
  });
});

describe('GET /api/auth/me', () => {
  it('rejeita sem cookie de sessão', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('aceita um JWT válido assinado com o mesmo segredo, sem tocar o banco', async () => {
    const token = jwt.sign({ sub: 'user-id-fake', email: 'ana@gmail.com' }, env.jwtSecret, { expiresIn: '7d' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 'user-id-fake', email: 'ana@gmail.com' });
  });

  it('rejeita um JWT assinado com segredo diferente', async () => {
    const token = jwt.sign({ sub: 'x', email: 'x@x.com' }, 'segredo-errado', { expiresIn: '7d' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(401);
  });
});
