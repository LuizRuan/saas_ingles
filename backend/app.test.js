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

describe('/api/presence', () => {
  it('GET responde online e queue sem precisar de banco', async () => {
    const res = await request(app).get('/api/presence');
    expect(res.status).toBe(200);
    expect(typeof res.body.online).toBe('number');
    expect(typeof res.body.queue).toBe('number');
  });

  it('POST /ping registra e devolve a contagem', async () => {
    const res = await request(app)
      .post('/api/presence/ping')
      .send({ id: 'teste-integracao-1' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.online).toBeGreaterThanOrEqual(1);
  });

  it('POST /ping recusa id inválido', async () => {
    const res = await request(app)
      .post('/api/presence/ping')
      .send({ id: 'id com espaço e <script>' });
    expect(res.status).toBe(400);
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
    expect(res.body.user).toEqual({ id: 'user-id-fake', email: 'ana@gmail.com', isAdmin: false });
  });

  it('rejeita um JWT assinado com segredo diferente', async () => {
    const token = jwt.sign({ sub: 'x', email: 'x@x.com' }, 'segredo-errado', { expiresIn: '7d' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(401);
  });
});

describe('/api/auth/profile', () => {
  const cookieValido = () => {
    const token = jwt.sign({ sub: 'user-id-fake', email: 'ana@gmail.com' }, env.jwtSecret, { expiresIn: '7d' });
    return `${SESSION_COOKIE_NAME}=${token}`;
  };

  it('GET rejeita sem cookie de sessão (não chega a precisar de banco)', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('PATCH rejeita sem cookie de sessão', async () => {
    const res = await request(app).patch('/api/auth/profile').send({ nickname: 'Ana' });
    expect(res.status).toBe(401);
  });

  it('GET responde 503 com cookie válido mas sem banco conectado', async () => {
    const res = await request(app).get('/api/auth/profile').set('Cookie', cookieValido());
    expect(res.status).toBe(503);
  });

  it('PATCH responde 503 com cookie válido mas sem banco conectado', async () => {
    const res = await request(app)
      .patch('/api/auth/profile')
      .set('Cookie', cookieValido())
      .send({ nickname: 'Ana' });
    expect(res.status).toBe(503);
  });
});

describe('POST /api/auth/duel-ticket', () => {
  it('rejeita sem cookie de sessão', async () => {
    const res = await request(app).post('/api/auth/duel-ticket');
    expect(res.status).toBe(401);
  });

  it('responde 503 com cookie válido mas sem banco conectado', async () => {
    const token = jwt.sign({ sub: 'user-id-fake', email: 'ana@gmail.com' }, env.jwtSecret, { expiresIn: '7d' });
    const res = await request(app)
      .post('/api/auth/duel-ticket')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(503);
  });
});

describe('GET /api/admin/dashboard', () => {
  const sessionCookie = (email) => {
    const token = jwt.sign({ sub: 'user-id-fake', email }, env.jwtSecret, { expiresIn: '7d' });
    return `${SESSION_COOKIE_NAME}=${token}`;
  };

  it('rejeita quem não está autenticado', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  it('rejeita uma conta autenticada que não está em ADMIN_EMAILS', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', sessionCookie('usuario-comum@example.com'));
    expect(res.status).toBe(403);
  });

  it('aceita a permissão do admin e então exige o banco', async () => {
    const adminEmail = 'admin-test@example.com';
    env.adminEmails.push(adminEmail);
    try {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Cookie', sessionCookie(adminEmail));
      expect(res.status).toBe(503);
    } finally {
      env.adminEmails.splice(env.adminEmails.indexOf(adminEmail), 1);
    }
  });
});

describe('/api/duel/leaderboard', () => {
  it('GET responde 503 sem banco conectado (rota pública, mas depende do banco)', async () => {
    const res = await request(app).get('/api/duel/leaderboard');
    expect(res.status).toBe(503);
  });

  it('GET /me rejeita sem cookie de sessão', async () => {
    const res = await request(app).get('/api/duel/leaderboard/me');
    expect(res.status).toBe(401);
  });

  it('GET /me responde 503 com cookie válido mas sem banco conectado', async () => {
    const token = jwt.sign({ sub: 'user-id-fake', email: 'ana@gmail.com' }, env.jwtSecret, { expiresIn: '7d' });
    const res = await request(app)
      .get('/api/duel/leaderboard/me')
      .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
    expect(res.status).toBe(503);
  });

  it('GET /level responde 503 sem banco conectado (rota pública, mas depende do banco)', async () => {
    const res = await request(app).get('/api/duel/leaderboard/level');
    expect(res.status).toBe(503);
  });
});
