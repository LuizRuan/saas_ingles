# Ranking real do duelo (troféus) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake "Top 5 do Mês" leaderboard in the duel screen with a real, monthly, troféu-based ranking fed only by genuine `human`-mode wins between two different logged-in accounts.

**Architecture:** A short-lived signed "duel ticket" (JWT, 2 min) lets the Socket.IO layer know which real account is playing, without needing the httpOnly session cookie (the socket connects cross-origin, `credentials:false`). At natural match end, a pure decision function decides whether a trophy is earned; if so, a fire-and-forget Mongo upsert records it in a new `DuelTrophy` collection keyed by `(userId, month)`. Two new read endpoints serve the leaderboard to the frontend, which replaces the mock data and adds a "ranking completo" modal.

**Tech Stack:** Express + Mongoose (backend), Socket.IO, React 19, Vitest + supertest.

**Spec:** `docs/superpowers/specs/2026-08-06-ranked-duel-trophies-design.md` — read it for the full rationale; this plan implements it task-by-task.

## Global Constraints

- Trophy = 1 point, only for a `reason: 'completed'` match win where **both** players carry a `userId` from a verified ticket and the two `userId`s differ. Ties, losses, and `opponent_left` never award anything.
- Ranking resets monthly (`month` key = `'YYYY-MM'`, UTC).
- Nickname/avatar in the leaderboard are denormalized at write time — the public read never joins against `User`.
- Guests keep playing exactly as today; only logged-in-with-nickname players are eligible for trophies. Being logged in also **locks** the nickname field in the search modal (already implemented earlier this session in `WhoKnowsMore.jsx` — do not redo).
- All new Mongo-touching routes/paths must degrade to `503`/no-op when Mongo isn't connected, matching every existing DB-dependent route (`requireDb`) and the realtime module's "works without Mongo" property.
- No new test infra: follow the existing pattern exactly — `backend/app.test.js` style for route gating (401/503), pure-function unit tests for decision logic, `backend/realtime/duel.integration.test.js` style for socket behavior. No Mongoose mocking library is used anywhere in this repo; don't introduce one.

---

### Task 1: `DuelTrophy` model

**Files:**
- Create: `backend/models/DuelTrophy.js`

**Interfaces:**
- Produces: `DuelTrophy` Mongoose model, schema `{ userId: ObjectId, month: string, nickname: string, avatar: string, trophies: number, createdAt, updatedAt }`, unique index on `{ userId, month }`.

- [ ] **Step 1: Create the model**

```js
// backend/models/DuelTrophy.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Um documento por (usuário, mês) — o ranking zera todo mês por desenho (ver
// docs/superpowers/specs/2026-08-06-ranked-duel-trophies-design.md).
// nickname/avatar são denormalizados do ticket de duelo no momento da
// vitória: a leitura pública do ranking nunca faz join com User.
const duelTrophySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // 'YYYY-MM', calendário UTC
  nickname: { type: String, required: true },
  avatar: { type: String, default: 'U' },
  trophies: { type: Number, default: 0 },
}, { timestamps: true });

duelTrophySchema.index({ userId: 1, month: 1 }, { unique: true });
duelTrophySchema.index({ month: 1, trophies: -1 });

export const DuelTrophy = mongoose.model('DuelTrophy', duelTrophySchema);
```

No dedicated test file — matches `backend/models/User.js`, which also has none (no real Mongo in this environment; behavior is exercised through the routes that use it).

- [ ] **Step 2: Commit**

```bash
git add backend/models/DuelTrophy.js
git commit -m "feat(backend): add DuelTrophy model for monthly ranked duel trophies"
```

---

### Task 2: `currentMonthKey` helper

**Files:**
- Create: `backend/utils/duelMonth.js`
- Test: `backend/utils/duelMonth.test.js`

**Interfaces:**
- Produces: `currentMonthKey(now?: Date): string` — `'YYYY-MM'` in UTC. Used by Task 7 (award) and Task 8 (read).

- [ ] **Step 1: Write the failing test**

```js
// backend/utils/duelMonth.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run duelMonth`
Expected: FAIL — `duelMonth.js` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```js
// backend/utils/duelMonth.js
// Chave do mês corrente no formato 'YYYY-MM', em UTC — usada tanto para
// premiar um troféu quanto para ler o ranking, então os dois lados sempre
// concordam sobre "qual mês é este" independente do fuso do processo.
export const currentMonthKey = (now = new Date()) => now.toISOString().slice(0, 7);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run duelMonth`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/utils/duelMonth.js backend/utils/duelMonth.test.js
git commit -m "feat(backend): add currentMonthKey helper for ranked duel month keys"
```

---

### Task 3: `decideTrophyAward` — pure trophy decision

**Files:**
- Create: `backend/realtime/trophy.js`
- Test: `backend/realtime/trophy.test.js`

**Interfaces:**
- Consumes: a `match`-shaped object with `players: [{ socketId, nickname }]` and `playerData: Map<socketId, { userId, avatar, ... }>` (same shapes `backend/realtime/state.js` and `round.js` already use).
- Produces: `decideTrophyAward(match, winnerSocketId): { userId, nickname, avatar } | null`. Consumed by Task 7's `endRound` wiring.

- [ ] **Step 1: Write the failing tests**

```js
// backend/realtime/trophy.test.js
import { describe, it, expect } from 'vitest';
import { decideTrophyAward } from './trophy.js';

const makeMatch = (aData = {}, bData = {}) => ({
  players: [{ socketId: 'a', nickname: 'Ana' }, { socketId: 'b', nickname: 'Beto' }],
  playerData: new Map([
    ['a', { userId: null, avatar: 'U', ...aData }],
    ['b', { userId: null, avatar: 'U', ...bData }],
  ]),
});

describe('decideTrophyAward', () => {
  it('premia o vencedor quando os dois estão logados em contas diferentes', () => {
    const match = makeMatch({ userId: 'user-a', avatar: '🦊' }, { userId: 'user-b' });
    expect(decideTrophyAward(match, 'a')).toEqual({ userId: 'user-a', nickname: 'Ana', avatar: '🦊' });
  });

  it('empate (sem winnerSocketId) não premia', () => {
    const match = makeMatch({ userId: 'user-a' }, { userId: 'user-b' });
    expect(decideTrophyAward(match, null)).toBeNull();
  });

  it('convidado de um dos lados não premia', () => {
    const match = makeMatch({ userId: 'user-a' }, { userId: null });
    expect(decideTrophyAward(match, 'a')).toBeNull();
  });

  it('mesma conta nas duas pontas não premia', () => {
    const match = makeMatch({ userId: 'user-x' }, { userId: 'user-x' });
    expect(decideTrophyAward(match, 'a')).toBeNull();
  });

  it('vencedor convidado (mesmo com perdedor logado) não premia', () => {
    const match = makeMatch({ userId: null }, { userId: 'user-b' });
    expect(decideTrophyAward(match, 'a')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run realtime/trophy`
Expected: FAIL — `trophy.js` doesn't exist yet.

- [ ] **Step 3: Write the implementation**

```js
// backend/realtime/trophy.js
// Decide SE e PARA QUEM um troféu deve ser dado ao fim de uma partida —
// extraído puro pelo mesmo motivo de round.js: testável sem socket nem Mongo.
// Regras (ver spec): só vitória limpa (nunca empate, nunca WO — quem chama
// isto só faz no ramo de fim natural da partida, nunca em endByLeave), e só
// se os DOIS jogadores estavam logados em contas DIFERENTES.
export const decideTrophyAward = (match, winnerSocketId) => {
  if (!winnerSocketId) return null; // empate — decideWinner já devolve null

  const winner = match.players.find(p => p.socketId === winnerSocketId);
  const loser = match.players.find(p => p.socketId !== winnerSocketId);
  if (!winner || !loser) return null;

  const wd = match.playerData?.get(winner.socketId);
  const ld = match.playerData?.get(loser.socketId);
  if (!wd?.userId || !ld?.userId) return null;      // convidado de um dos lados
  if (wd.userId === ld.userId) return null;          // mesma conta nas duas pontas

  return { userId: wd.userId, nickname: winner.nickname, avatar: wd.avatar };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run realtime/trophy`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/realtime/trophy.js backend/realtime/trophy.test.js
git commit -m "feat(backend): add pure decideTrophyAward decision function"
```

---

### Task 4: Duel ticket signing/verification

**Files:**
- Modify: `backend/utils/token.js`
- Test: `backend/utils/token.test.js` (new file)

**Interfaces:**
- Produces: `signDuelTicket({ id, nickname, avatar }): string` and `verifyDuelTicket(ticket): { sub, nickname, avatar, typ }` (throws on invalid/expired/wrong-type). Consumed by Task 5 (issue endpoint) and Task 6 (socket verification).

- [ ] **Step 1: Write the failing tests**

```js
// backend/utils/token.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run utils/token`
Expected: FAIL — `signDuelTicket`/`verifyDuelTicket` are not exported yet.

- [ ] **Step 3: Add the functions to `backend/utils/token.js`**

Append at the end of the existing file (keep everything already there — `SESSION_COOKIE_NAME`, `signSessionToken`, `verifySessionToken`, `sessionCookieOptions`, `clearSessionCookieOptions` — unchanged):

```js
// Ticket de curta duração para o duelo em tempo real (Socket.IO) provar
// identidade sem cookie httpOnly — o socket conecta direto no Render, fora
// da topologia same-origin do cookie de sessão (ver CLAUDE.md). Mesmo
// segredo do JWT de sessão: mesmo processo Node, nenhum segredo novo.
export const signDuelTicket = ({ id, nickname, avatar }) =>
  jwt.sign({ sub: id, nickname, avatar, typ: 'duel' }, env.jwtSecret, { expiresIn: '2m' });

// `typ: 'duel'` existe só para isto: um JWT de sessão comum (7 dias, sem
// `typ`) não pode ser reaproveitado como ticket de duelo por engano.
export const verifyDuelTicket = (ticket) => {
  const payload = jwt.verify(ticket, env.jwtSecret);
  if (payload.typ !== 'duel') throw new Error('Tipo de ticket inválido.');
  return payload;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run utils/token`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/utils/token.js backend/utils/token.test.js
git commit -m "feat(backend): add signed short-lived duel tickets for socket identity"
```

---

### Task 5: `POST /api/auth/duel-ticket`

**Files:**
- Modify: `backend/controllers/auth.controller.js`
- Modify: `backend/routes/auth.routes.js`
- Modify: `backend/app.test.js`

**Interfaces:**
- Consumes: `signDuelTicket` from Task 4, `User` model.
- Produces: `POST /api/auth/duel-ticket` → `200 { ticket }` when logged in with a nickname, `400` when logged in without one, `401` without a session, `503` without Mongo. Consumed by Task 11 (frontend).

- [ ] **Step 1: Add `issueDuelTicket` to `backend/controllers/auth.controller.js`**

Add the import at the top (alongside the existing `token.js` import):

```js
import { signSessionToken, sessionCookieOptions, clearSessionCookieOptions, SESSION_COOKIE_NAME, signDuelTicket } from '../utils/token.js';
```

Append the new controller at the end of the file:

```js
export const issueDuelTicket = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Conta não encontrada.' });
  if (!user.nickname) {
    return res.status(400).json({ error: 'Escolha um apelido antes de jogar ranked.' });
  }

  const ticket = signDuelTicket({
    id: user._id.toString(),
    nickname: user.nickname,
    avatar: user.progress?.selectedAvatar || 'U',
  });
  res.status(200).json({ ticket });
};
```

- [ ] **Step 2: Wire the route in `backend/routes/auth.routes.js`**

Change the import line:

```js
import { register, login, logout, me, getProfile, updateProfile, updateProgress, issueDuelTicket } from '../controllers/auth.controller.js';
```

Add, right after the existing `/progress` line:

```js
// Curta duração (2 min), consumida pelo Socket.IO do duelo pra provar quem
// está logado sem cookie httpOnly (ver token.js e CLAUDE.md).
authRouter.post('/duel-ticket', requireAuth, requireDb, asyncHandler(issueDuelTicket));
```

- [ ] **Step 3: Write the failing route tests**

Append to `backend/app.test.js` (reuses the `env`, `jwt`, `SESSION_COOKIE_NAME` imports already at the top of that file):

```js
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
```

- [ ] **Step 4: Run test to verify it fails, then passes**

Run: `cd backend && npx vitest run app.test`
Expected: first FAIL (route doesn't exist / 404), then after steps 1-2 are in place, PASS (2 new tests, plus every existing test in the file still green).

- [ ] **Step 5: Commit**

```bash
git add backend/controllers/auth.controller.js backend/routes/auth.routes.js backend/app.test.js
git commit -m "feat(backend): add POST /api/auth/duel-ticket endpoint"
```

---

### Task 6: Socket identity plumbing (ticket → `playerData`)

**Files:**
- Modify: `backend/realtime/state.js`
- Modify: `backend/realtime/index.js`
- Modify: `backend/realtime/duel.integration.test.js`

**Interfaces:**
- Consumes: `verifyDuelTicket` from Task 4.
- Produces: every `match.playerData.get(socketId)` entry now also carries `userId: string|null` and `avatar: string|null`; a ticket-verified nickname overrides the client-supplied one in `match.players[].nickname`. Consumed by Task 3's `decideTrophyAward` (already written) via Task 7's wiring.

- [ ] **Step 1: Store `userId`/`avatar` per player in `backend/realtime/state.js`**

In `createMatch`, change the `playerData` initialization (the rest of the function is unchanged):

```js
    // Por jogador: índices usados e pergunta ativa desta rodada
    playerData: new Map(players.map(p => [p.socketId, {
      usedIndices: [],
      currentQuestion: null,
      guessedLetters: null, // só usado no Forca — startRound cria um Set novo a cada rodada
      userId: p.userId ?? null,  // null = convidado, ou ticket ausente/inválido
      avatar: p.avatar ?? null,
    }])),
```

- [ ] **Step 2: Verify the ticket in `queue:join`, in `backend/realtime/index.js`**

Add the import at the top:

```js
import { verifyDuelTicket } from '../utils/token.js';
```

Replace the body of the `socket.on('queue:join', ...)` handler (currently building `nickname`/`gameTypePreference` and pushing onto `waitingQueue`) with:

```js
    socket.on('queue:join', (payload, ack) => {
      // Chave por socket.id, não por IP: no Render o TLS termina no
      // balanceador, então handshake.address é o MESMO para todos os usuários —
      // a plataforma inteira dividiria uma cota de 5 entradas por 10s.
      if (isRateLimited(`join:${socket.id}`, { windowMs: 10_000, max: 5 })) {
        return ack?.({ ok: false, error: 'Muitas tentativas. Aguarde um instante.' });
      }
      if (waitingQueue.some(p => p.socketId === socket.id) || findMatchBySocket(socket.id)) {
        return ack?.({ ok: false, error: 'Você já está na fila ou em uma partida.' });
      }

      // Ticket ausente, expirado ou inválido degrada pra convidado — nunca
      // derruba a conexão. userId/avatar só existem quando o ticket é real.
      let identity = { userId: null, avatar: null, ticketNickname: null };
      if (payload?.authTicket) {
        try {
          const claim = verifyDuelTicket(payload.authTicket);
          identity = { userId: claim.sub, avatar: claim.avatar, ticketNickname: claim.nickname };
        } catch { /* segue como convidado */ }
      }

      // Identidade verificada vence o nickname solto do payload — nunca
      // confiar no texto livre pra decidir QUEM é o jogador.
      const nickname = sanitizeNickname(identity.ticketNickname ?? payload?.nickname);

      // Valida preferência de tipo: aceita 'random' ou qualquer GAME_TYPE_IDS válido
      const rawPref = payload?.gameTypePreference;
      const gameTypePreference = GAME_TYPE_IDS.includes(rawPref) ? rawPref : 'random';

      waitingQueue.push({
        socketId: socket.id, nickname, joinedAt: Date.now(), gameTypePreference,
        userId: identity.userId, avatar: identity.avatar,
      });
      ack?.({ ok: true });
      broadcastPresence();
      startMatchIfPossible();
    });
```

- [ ] **Step 3: Carry `userId`/`avatar` into `createMatch` from `startMatchIfPossible`**

In `startMatchIfPossible`, the `players` array built for `createMatch` currently reads:

```js
    const players = [
      { socketId: a.socketId, nickname: a.nickname },
      { socketId: b.socketId, nickname: b.nickname },
    ];
```

Change it to:

```js
    const players = [
      { socketId: a.socketId, nickname: a.nickname, userId: a.userId, avatar: a.avatar },
      { socketId: b.socketId, nickname: b.nickname, userId: b.userId, avatar: b.avatar },
    ];
```

(`publicPlayers`, built right below from `players`, is unchanged — it only ever sent `{ id, nickname }` over the wire, and must keep not leaking `userId`/`avatar` to the opponent.)

- [ ] **Step 4: Write the failing integration tests**

Add these imports near the top of `backend/realtime/duel.integration.test.js` (alongside the existing ones):

```js
import { signDuelTicket } from '../utils/token.js';
```

Append a new `describe` block at the end of the file:

```js
describe('duelo — identidade a partir do ticket', () => {
  const ticketA = signDuelTicket({ id: 'user-conta-a', nickname: 'ContaA', avatar: '🦊' });
  const ticketB = signDuelTicket({ id: 'user-conta-b', nickname: 'ContaB', avatar: '🐱' });

  const pairComTickets = async (ticket1, ticket2) => {
    const p1 = await connect();
    const p2 = await connect();
    const found1 = once(p1, 'match:found');
    const found2 = once(p2, 'match:found');

    await emitAck(p1, 'queue:join', { nickname: 'Guest1', authTicket: ticket1 });
    await emitAck(p2, 'queue:join', { nickname: 'Guest2', authTicket: ticket2 });

    const [m1, m2] = await Promise.all([found1, found2]);
    return { p1, p2, m1, m2 };
  };

  it('guarda userId/avatar do ticket em playerData, e o nickname do ticket vence o digitado', async () => {
    const { p1, p2, m1 } = await pairComTickets(ticketA, ticketB);
    const match = matches.get(m1.matchId);

    const p1Id = m1.players.find(pl => pl.nickname === 'ContaA').id;
    const pd = match.playerData.get(p1Id);
    expect(pd.userId).toBe('user-conta-a');
    expect(pd.avatar).toBe('🦊');

    p1.disconnect(); p2.disconnect();
  });

  it('ticket ausente ou inválido degrada para convidado sem derrubar a conexão', async () => {
    const { p1, p2, m1 } = await pairComTickets('token-forjado-invalido', ticketB);
    const match = matches.get(m1.matchId);

    const p1Id = m1.players.find(pl => pl.nickname === 'Guest1').id;
    const pd = match.playerData.get(p1Id);
    expect(pd.userId).toBeNull();

    p1.disconnect(); p2.disconnect();
  });
});
```

- [ ] **Step 5: Run tests to verify they fail, then pass**

Run: `cd backend && npx vitest run realtime/duel.integration`
Expected: first FAIL (`playerData.userId` is `undefined`, ticket ignored), then PASS after steps 1-3 — including every pre-existing test in that file (they never send `authTicket`, so they exercise the guest/degrade path already covered by the second new test).

- [ ] **Step 6: Commit**

```bash
git add backend/realtime/state.js backend/realtime/index.js backend/realtime/duel.integration.test.js
git commit -m "feat(backend): verify duel tickets in queue:join and thread identity into matches"
```

---

### Task 7: Award the trophy at match end

**Files:**
- Create: `backend/realtime/trophyAward.js`
- Modify: `backend/realtime/index.js`
- Modify: `backend/realtime/duel.integration.test.js`

**Interfaces:**
- Consumes: `DuelTrophy` (Task 1), `currentMonthKey` (Task 2), `decideTrophyAward` (Task 3).
- Produces: `awardTrophy({ userId, nickname, avatar }): Promise<void>` — one `$inc` upsert into `DuelTrophy`. Wired into `endRound`'s natural-end branch only.

- [ ] **Step 1: Create `backend/realtime/trophyAward.js`**

```js
// backend/realtime/trophyAward.js
import { DuelTrophy } from '../models/DuelTrophy.js';
import { currentMonthKey } from '../utils/duelMonth.js';

// Upsert mensal — chamado fire-and-forget por index.js, DEPOIS do match:end
// já ter sido emitido. Se o Mongo estiver fora do ar, a promise nunca
// resolve nem rejeita de forma útil a tempo; quem chama sempre encadeia
// .catch(() => {}) e nunca faz `await` nisto no caminho principal.
export const awardTrophy = async ({ userId, nickname, avatar }) => {
  await DuelTrophy.findOneAndUpdate(
    { userId, month: currentMonthKey() },
    { $inc: { trophies: 1 }, $set: { nickname, avatar } },
    { upsert: true },
  );
};
```

- [ ] **Step 2: Wire it into `backend/realtime/index.js`**

Add the imports at the top:

```js
import { decideTrophyAward } from './trophy.js';
import { awardTrophy } from './trophyAward.js';
```

In `endRound`, the natural-end branch currently reads:

```js
    } else {
      io.to(roomName(match.id)).emit('match:end', {
        matchId: match.id,
        scores: closed.scores,
        winnerId: decideWinner(match),
        reason: 'completed',
      });
      destroyMatch(match.id);
    }
```

Replace it with (the only change is capturing `winnerId` once and awarding after the emit):

```js
    } else {
      const winnerId = decideWinner(match);
      io.to(roomName(match.id)).emit('match:end', {
        matchId: match.id,
        scores: closed.scores,
        winnerId,
        reason: 'completed',
      });

      // Fire-and-forget, DEPOIS do match:end já entregue — um Mongo lento ou
      // fora do ar nunca atrasa nem derruba a partida para os jogadores.
      const award = decideTrophyAward(match, winnerId);
      if (award) awardTrophy(award).catch(() => {});

      destroyMatch(match.id);
    }
```

(`endByLeave`, a few lines above, is untouched — it structurally never calls `decideTrophyAward`/`awardTrophy`, which is what makes "quitting mid-match pays no trophy" true by construction, not by a runtime check.)

- [ ] **Step 3: Write the failing integration tests**

Add near the top of `backend/realtime/duel.integration.test.js`, right after the existing `vitest` import (so `vi` is available) — mocking `trophyAward.js` is safe for every test in this file, since guest-only matches (every existing test) never produce a truthy `decideTrophyAward` result in the first place:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
```

Right after the imports block (before `const TIMING = ...`), add the mock and its import:

```js
vi.mock('./trophyAward.js', () => ({ awardTrophy: vi.fn().mockResolvedValue(undefined) }));
import { awardTrophy } from './trophyAward.js';
```

In the existing `beforeEach`, add a mock reset (keep the three lines already there):

```js
beforeEach(() => {
  waitingQueue.length = 0;
  for (const id of [...matches.keys()]) matches.delete(id);
  resetRateLimiter();
  vi.clearAllMocks();
});
```

Append a new `describe` block at the end of the file (uses the `ticketA`/`ticketB` pattern from Task 6 — redeclare locally so this block has no dependency on the other `describe`'s scope):

```js
describe('duelo — troféu de ranked', () => {
  const ticketA = signDuelTicket({ id: 'user-conta-a', nickname: 'ContaA', avatar: '🦊' });
  const ticketB = signDuelTicket({ id: 'user-conta-b', nickname: 'ContaB', avatar: '🐱' });

  const pairMemoryComTickets = async (ticket1, ticket2) => {
    const p1 = await connect();
    const p2 = await connect();
    const found1 = once(p1, 'match:found');
    const found2 = once(p2, 'match:found');

    await emitAck(p1, 'queue:join', { nickname: 'Guest1', gameTypePreference: 'memory', authTicket: ticket1 });
    await emitAck(p2, 'queue:join', { nickname: 'Guest2', gameTypePreference: 'memory', authTicket: ticket2 });

    const [m1, m2] = await Promise.all([found1, found2]);
    return { p1, p2, m1, m2 };
  };

  it('vitória real entre duas contas diferentes chama awardTrophy uma vez para o vencedor', async () => {
    const { p1, p2, m1 } = await pairMemoryComTickets(ticketA, ticketB);

    // Memory pontua por ORDEM DE CHEGADA de choice:'completed', não por
    // acerto (ver closeRound em round.js) — assim dá pra forçar p1 vencer
    // todas as 5 rodadas de forma determinística e legítima: p1 sempre
    // responde 'completed' assim que a rodada começa, p2 nunca responde.
    p1.on('round:start', (r) => {
      p1.emit('round:answer', { matchId: r.matchId, roundIndex: r.roundIndex, choice: 'completed' }, () => {});
    });
    p1.emit('round:answer', { matchId: m1.matchId, roundIndex: 0, choice: 'completed' }, () => {});

    await once(p1, 'match:end', 6000);
    await new Promise(r => setTimeout(r, 50)); // dá tempo do fire-and-forget rodar

    expect(awardTrophy).toHaveBeenCalledTimes(1);
    expect(awardTrophy).toHaveBeenCalledWith({ userId: 'user-conta-a', nickname: 'ContaA', avatar: '🦊' });

    p1.disconnect(); p2.disconnect();
  });

  it('vitória por abandono (opponent_left) NUNCA chama awardTrophy', async () => {
    const { p1, p2, m1 } = await pairMemoryComTickets(ticketA, ticketB);
    const endPromise = once(p1, 'match:end');
    p2.disconnect();

    const end = await endPromise;
    expect(end.reason).toBe('opponent_left');

    await new Promise(r => setTimeout(r, 50));
    expect(awardTrophy).not.toHaveBeenCalled();

    p1.disconnect();
  });

  it('convidado vencendo contra uma conta real não chama awardTrophy', async () => {
    const { p1, p2, m1 } = await pairMemoryComTickets('token-invalido', ticketB);

    p1.on('round:start', (r) => {
      p1.emit('round:answer', { matchId: r.matchId, roundIndex: r.roundIndex, choice: 'completed' }, () => {});
    });
    p1.emit('round:answer', { matchId: m1.matchId, roundIndex: 0, choice: 'completed' }, () => {});

    await once(p1, 'match:end', 6000);
    await new Promise(r => setTimeout(r, 50));

    expect(awardTrophy).not.toHaveBeenCalled();

    p1.disconnect(); p2.disconnect();
  });
});
```

- [ ] **Step 4: Run tests to verify they fail, then pass**

Run: `cd backend && npx vitest run realtime/duel.integration`
Expected: first FAIL (`awardTrophy` never called — not wired yet), then PASS (all tests in the file, old and new) after steps 1-2.

- [ ] **Step 5: Commit**

```bash
git add backend/realtime/trophyAward.js backend/realtime/index.js backend/realtime/duel.integration.test.js
git commit -m "feat(backend): award a ranked trophy on genuine completed wins between two accounts"
```

---

### Task 8: Leaderboard read endpoints

**Files:**
- Create: `backend/controllers/duel.controller.js`
- Create: `backend/routes/duel.routes.js`
- Modify: `backend/app.js`
- Modify: `backend/app.test.js`

**Interfaces:**
- Consumes: `DuelTrophy` (Task 1), `currentMonthKey` (Task 2).
- Produces: `GET /api/duel/leaderboard?limit=N` (public) → `{ month, entries: [{ nickname, avatar, trophies }] }`; `GET /api/duel/leaderboard/me` (`requireAuth`) → `{ month, trophies, rank }`. Consumed by Task 9 (frontend).

- [ ] **Step 1: Create `backend/controllers/duel.controller.js`**

```js
// backend/controllers/duel.controller.js
import { DuelTrophy } from '../models/DuelTrophy.js';
import { currentMonthKey } from '../utils/duelMonth.js';

const clampLimit = (raw) => {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 5;
  return Math.min(n, 50);
};

export const getLeaderboard = async (req, res) => {
  const month = currentMonthKey();
  const limit = clampLimit(req.query.limit);
  const entries = await DuelTrophy.find({ month })
    .sort({ trophies: -1, updatedAt: 1 })
    .limit(limit)
    .select('nickname avatar trophies -_id');
  res.status(200).json({ month, entries });
};

export const getMyRank = async (req, res) => {
  const month = currentMonthKey();
  const mine = await DuelTrophy.findOne({ userId: req.user.id, month });
  if (!mine) return res.status(200).json({ month, trophies: 0, rank: null });

  const ahead = await DuelTrophy.countDocuments({ month, trophies: { $gt: mine.trophies } });
  res.status(200).json({ month, trophies: mine.trophies, rank: ahead + 1 });
};
```

- [ ] **Step 2: Create `backend/routes/duel.routes.js`**

```js
// backend/routes/duel.routes.js
import { Router } from 'express';
import { getLeaderboard, getMyRank } from '../controllers/duel.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDb } from '../middleware/requireDb.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const duelRouter = Router();

// Público (sem requireAuth) — mas ainda precisa do banco, é onde o ranking
// mora. Sem limiter próprio: leitura barata, e o apiLimiter geral em /api já
// cobre abuso (mesmo raciocínio de /api/auth/profile).
duelRouter.get('/leaderboard', requireDb, asyncHandler(getLeaderboard));
duelRouter.get('/leaderboard/me', requireAuth, requireDb, asyncHandler(getMyRank));
```

- [ ] **Step 3: Mount the router in `backend/app.js`**

Add the import alongside the other routers:

```js
import { duelRouter } from './routes/duel.routes.js';
```

Add the mount line right after `app.use('/api/presence', presenceRouter);`:

```js
app.use('/api/duel', duelRouter);
```

- [ ] **Step 4: Write the failing route tests**

Append to `backend/app.test.js`:

```js
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
});
```

- [ ] **Step 5: Run tests to verify they fail, then pass**

Run: `cd backend && npx vitest run app.test`
Expected: first FAIL (404 — router not mounted), then PASS (3 new tests, all existing tests in the file still green).

- [ ] **Step 6: Commit**

```bash
git add backend/controllers/duel.controller.js backend/routes/duel.routes.js backend/app.js backend/app.test.js
git commit -m "feat(backend): add GET /api/duel/leaderboard and /leaderboard/me"
```

---

### Task 9: Frontend API client additions

**Files:**
- Modify: `src/utils/authClient.js`

**Interfaces:**
- Produces: `getDuelTicketRequest(): Promise<{ ticket: string }>`, `getDuelLeaderboardRequest(limit?: number): Promise<{ month: string, entries: Array<{ nickname, avatar, trophies }> }>`, `getMyDuelRankRequest(): Promise<{ month: string, trophies: number, rank: number|null }>`. Consumed by Tasks 10 and 11.

- [ ] **Step 1: Add the three functions**

Append to the end of `src/utils/authClient.js`:

```js
// Ticket de 2 min pro Socket.IO do duelo provar identidade — buscado de novo
// a cada "Procurar Oponente" (ver WhoKnowsMore.jsx), nunca guardado.
export const getDuelTicketRequest = () => callAuth('/api/auth/duel-ticket', { method: 'POST' });

export const getDuelLeaderboardRequest = (limit = 5) =>
  callAuth(`/api/duel/leaderboard?limit=${limit}`, { method: 'GET' });

export const getMyDuelRankRequest = () => callAuth('/api/duel/leaderboard/me', { method: 'GET' });
```

No dedicated test file — matches every other function already in this file (thin fetch wrappers, untested directly; behavior is covered on the backend side).

- [ ] **Step 2: Commit**

```bash
git add src/utils/authClient.js
git commit -m "feat(frontend): add duel ticket and leaderboard API client functions"
```

---

### Task 10: `useDuelSocket.joinQueue` accepts an auth ticket

**Files:**
- Modify: `src/hooks/useDuelSocket.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: `joinQueue(nickname, gameTypePreference = 'random', authTicket?: string)`. Consumed by Task 11.

- [ ] **Step 1: Extend `joinQueue`**

Current code (in `src/hooks/useDuelSocket.js`):

```js
  const joinQueue = useCallback((nickname, gameTypePreference = 'random') => {
    setQueueError(null);
    // Recusa cedo em vez de mentir: antes o estado já ia para 'searching' antes
    // de emitir, e com o socket desconectado o socket.io enfileira o emit — o
    // ack nunca chegava e o spinner rodava para sempre.
    if (socketRef.current?.connected !== true) {
      setQueueError('Sem conexão com o servidor. Tente novamente em instantes.');
      return;
    }

    socketRef.current.emit('queue:join', { nickname, gameTypePreference }, (ack) => {
```

Change the signature and the emitted payload only (the rest of the function body — the `ack` callback, `setMatchState`, `queueTimerRef` logic — is unchanged):

```js
  const joinQueue = useCallback((nickname, gameTypePreference = 'random', authTicket) => {
    setQueueError(null);
    // Recusa cedo em vez de mentir: antes o estado já ia para 'searching' antes
    // de emitir, e com o socket desconectado o socket.io enfileira o emit — o
    // ack nunca chegava e o spinner rodava para sempre.
    if (socketRef.current?.connected !== true) {
      setQueueError('Sem conexão com o servidor. Tente novamente em instantes.');
      return;
    }

    socketRef.current.emit('queue:join', { nickname, gameTypePreference, authTicket }, (ack) => {
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDuelSocket.js
git commit -m "feat(frontend): let joinQueue carry an optional signed duel ticket"
```

---

### Task 11: Wire the ticket fetch into "Procurar Oponente"

**Files:**
- Modify: `src/games/WhoKnowsMore/WhoKnowsMore.jsx`

**Interfaces:**
- Consumes: `getDuelTicketRequest` (Task 9), `joinQueue(name, pref, authTicket)` (Task 10), the existing `estaLogado`/`profile` (already added earlier this session — do not redeclare).

- [ ] **Step 1: Import the new client function**

Add to the existing import block at the top of the file:

```js
import { getDuelTicketRequest } from '../../utils/authClient';
```

- [ ] **Step 2: Make `handleStartSearch` fetch a ticket when logged in**

Current code:

```js
  const handleStartSearch = () => {
    // Logado: o apelido é sempre o da conta, nunca o que ficou no campo —
    // o campo é só leitura pra quem está logado (ver input abaixo).
    const name = estaLogado
      ? profile.nickname.slice(0, 20)
      : (nicknameDraft.trim() || generateGuestName()).slice(0, 20);
    setNicknameDraft(name);
    if (!estaLogado) setDisplayName(name);
    duel.joinQueue(name, humanGameTypePreference);
  };
```

Replace with:

```js
  const handleStartSearch = async () => {
    // Logado: o apelido é sempre o da conta, nunca o que ficou no campo —
    // o campo é só leitura pra quem está logado (ver input abaixo).
    const name = estaLogado
      ? profile.nickname.slice(0, 20)
      : (nicknameDraft.trim() || generateGuestName()).slice(0, 20);
    setNicknameDraft(name);
    if (!estaLogado) setDisplayName(name);

    let authTicket;
    if (estaLogado) {
      try {
        const { ticket } = await getDuelTicketRequest();
        authTicket = ticket;
      } catch {
        // Sessão pode ter expirado entre abrir o modal e clicar aqui — joga
        // como convidado em vez de travar o botão "Procurar Oponente".
      }
    }
    duel.joinQueue(name, humanGameTypePreference, authTicket);
  };
```

- [ ] **Step 3: Build to catch syntax errors**

Run: `npx vite build --mode development`
Expected: succeeds, no new warnings beyond the pre-existing chunk-size notice.

- [ ] **Step 4: Commit**

```bash
git add src/games/WhoKnowsMore/WhoKnowsMore.jsx
git commit -m "feat(frontend): fetch a duel ticket before queueing when logged in"
```

---

### Task 12: Real leaderboard UI

**Files:**
- Modify: `src/games/WhoKnowsMore/WhoKnowsMore.jsx`
- Modify: `src/games/WhoKnowsMore/WhoKnowsMore.css`

**Interfaces:**
- Consumes: `getDuelLeaderboardRequest`, `getMyDuelRankRequest` (Task 9).

- [ ] **Step 1: Import the new client functions**

Add to the import from Task 11 (same line, extend it):

```js
import { getDuelTicketRequest, getDuelLeaderboardRequest, getMyDuelRankRequest } from '../../utils/authClient';
```

- [ ] **Step 2: Delete `MOCK_RANKED_LEADERBOARD`**

Remove this whole block near the top of the file:

```js
const MOCK_RANKED_LEADERBOARD = [
  { id: 1, position: '#1', name: 'Camila Star', avatar: '🐱', level: 28, score: '2.450', wins: 186, trophyIcon: '🏆' },
  { id: 2, position: '#2', name: 'Lucas G.', avatar: '🐊', level: 26, score: '2.130', wins: 162, trophyIcon: '🥈' },
  { id: 3, position: '#3', name: 'Beatriz L.', avatar: '🧒', level: 24, score: '1.890', wins: 138, trophyIcon: '🥉' },
  { id: 4, position: '#4', name: 'Felipe M.', avatar: '🧑', level: 22, score: '1.650', wins: 121, trophyIcon: '🏅' },
  { id: 5, position: '#5', name: 'Ana Clara', avatar: '👩', level: 21, score: '1.420', wins: 108, trophyIcon: '🏅' },
];
```

- [ ] **Step 3: Add leaderboard state and fetch effects**

Near the other `useState` declarations at the top of the component (right after `showRankedTooltip`), add:

```js
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState('loading'); // loading | loaded | error
  const [showFullRankingModal, setShowFullRankingModal] = useState(false);
  const [fullLeaderboard, setFullLeaderboard] = useState([]);
  const [fullLeaderboardStatus, setFullLeaderboardStatus] = useState('idle'); // idle | loading | loaded | error
  const [myRank, setMyRank] = useState(null); // { month, trophies, rank } | null
```

Near the other top-level `useEffect`s (any existing one works as an anchor — add this as a new, separate effect):

```js
  // Top 5 do card — busca uma vez ao entrar na tela.
  useEffect(() => {
    let cancelled = false;
    getDuelLeaderboardRequest(5)
      .then(({ entries }) => { if (!cancelled) { setLeaderboard(entries); setLeaderboardStatus('loaded'); } })
      .catch(() => { if (!cancelled) setLeaderboardStatus('error'); });
    return () => { cancelled = true; };
  }, []);
```

Add this handler alongside `openHumanSearch`/`openBotSetup`:

```js
  const openFullRanking = () => {
    setShowFullRankingModal(true);
    setFullLeaderboardStatus('loading');
    getDuelLeaderboardRequest(50)
      .then(({ entries }) => { setFullLeaderboard(entries); setFullLeaderboardStatus('loaded'); })
      .catch(() => setFullLeaderboardStatus('error'));
    if (estaLogado) {
      getMyDuelRankRequest().then(setMyRank).catch(() => setMyRank(null));
    }
  };
```

- [ ] **Step 4: Replace the ranked list rendering**

Current block:

```jsx
              <div className="ranked-card glass-card">
                <div className="ranked-list">
                  {MOCK_RANKED_LEADERBOARD.map(player => (
                    <div key={player.id} className={`ranked-item rank-pos-${player.id}`}>
                      <div className="ranked-position-col">
                        <span className={`ranked-position-num pos-${player.id}`}>{player.position}</span>
                      </div>

                      <div className="ranked-player-col">
                        <div className="ranked-avatar" aria-hidden="true">{player.avatar}</div>
                        <div className="ranked-player-details">
                          <span className="ranked-player-name">{player.name}</span>
                          <span className="ranked-level-badge">Nível {player.level}</span>
                        </div>
                      </div>

                      <div className="ranked-score-col">
                        <div className="ranked-score-main">
                          <span className="ranked-trophy">{player.trophyIcon}</span>
                          <strong>{player.score}</strong> <small>pontos</small>
                        </div>
                        <span className="ranked-wins-count">{player.wins} vitórias</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ranked-footer">
                  <button className="btn btn-ghost btn-sm ranked-full-btn">
                    📊 Ver Ranking Completo
                  </button>
                </div>
              </div>
```

Replace with:

```jsx
              <div className="ranked-card glass-card">
                {leaderboardStatus === 'loading' && (
                  <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                    Carregando ranking…
                  </p>
                )}
                {leaderboardStatus === 'error' && (
                  <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                    Não foi possível carregar o ranking agora.
                  </p>
                )}
                {leaderboardStatus === 'loaded' && leaderboard.length === 0 && (
                  <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                    Ninguém no ranking ainda este mês — vença um duelo pra ser o primeiro!
                  </p>
                )}
                {leaderboardStatus === 'loaded' && leaderboard.length > 0 && (
                  <div className="ranked-list">
                    {leaderboard.map((entry, i) => (
                      <div key={`${entry.nickname}-${i}`} className={`ranked-item rank-pos-${i + 1}`}>
                        <div className="ranked-position-col">
                          <span className={`ranked-position-num pos-${i + 1}`}>#{i + 1}</span>
                        </div>

                        <div className="ranked-player-col">
                          <div className="ranked-avatar" aria-hidden="true">{entry.avatar || 'U'}</div>
                          <div className="ranked-player-details">
                            <span className="ranked-player-name">{entry.nickname}</span>
                          </div>
                        </div>

                        <div className="ranked-score-col">
                          <div className="ranked-score-main">
                            <span className="ranked-trophy">🏆</span>
                            <strong>{entry.trophies}</strong> <small>troféus</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ranked-footer">
                  <button className="btn btn-ghost btn-sm ranked-full-btn" onClick={openFullRanking}>
                    📊 Ver Ranking Completo
                  </button>
                </div>
              </div>
```

- [ ] **Step 5: Add the full-ranking modal**

Place this new modal block right before the closing `{showBotSetupModal && ( ... )}` modal's closing, i.e. as a sibling `showFullRankingModal && (...)` block anywhere inside the same top-level `{/* ============ MODAIS ============ */}` area as `showSearchModal`/`showBotSetupModal`:

```jsx
        {showFullRankingModal && (
          <div className="modal-overlay" onClick={() => setShowFullRankingModal(false)}>
            <div className="modal-content glass-card animate-bounce-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFullRankingModal(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
              <div className="modal-icon" aria-hidden="true">🏆</div>
              <h2 style={{ textAlign: 'center' }}>Ranking Completo</h2>
              <p className="text-secondary" style={{ fontSize: 'var(--fs-sm)', textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                Troféus deste mês
              </p>

              {fullLeaderboardStatus === 'loading' && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>Carregando…</p>
              )}
              {fullLeaderboardStatus === 'error' && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                  Não foi possível carregar o ranking agora.
                </p>
              )}
              {fullLeaderboardStatus === 'loaded' && fullLeaderboard.length === 0 && (
                <p className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                  Ninguém no ranking ainda este mês.
                </p>
              )}
              {fullLeaderboardStatus === 'loaded' && fullLeaderboard.length > 0 && (
                <div className="ranked-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  {fullLeaderboard.map((entry, i) => (
                    <div key={`${entry.nickname}-${i}`} className={`ranked-item rank-pos-${i + 1}`}>
                      <div className="ranked-position-col">
                        <span className={`ranked-position-num pos-${i + 1}`}>#{i + 1}</span>
                      </div>

                      <div className="ranked-player-col">
                        <div className="ranked-avatar" aria-hidden="true">{entry.avatar || 'U'}</div>
                        <div className="ranked-player-details">
                          <span className="ranked-player-name">{entry.nickname}</span>
                        </div>
                      </div>

                      <div className="ranked-score-col">
                        <div className="ranked-score-main">
                          <span className="ranked-trophy">🏆</span>
                          <strong>{entry.trophies}</strong> <small>troféus</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {estaLogado && myRank?.rank && (
                <p className="text-secondary" style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: 'var(--fs-sm)' }}>
                  Sua posição: <strong>#{myRank.rank}</strong> • 🏆 {myRank.trophies}
                </p>
              )}
            </div>
          </div>
        )}
```

- [ ] **Step 6: Remove the now-dead CSS for the columns that no longer render**

In `src/games/WhoKnowsMore/WhoKnowsMore.css`, delete the `.ranked-level-badge` and `.ranked-wins-count` rules (search for both selectors — each is a small standalone block, typically 3-6 lines). Leave every other `.ranked-*` rule untouched — `.ranked-item`, `.ranked-position-num.pos-1/2/3`, `.ranked-avatar`, `.ranked-score-main`, etc. are all still used by both the card and the new modal.

- [ ] **Step 7: Build and run the full test suite**

Run: `npx vite build --mode development && npx vitest run`
Expected: build succeeds (only the pre-existing chunk-size notice), all backend and frontend tests pass.

- [ ] **Step 8: Manual verification**

Start the backend (`cd backend && npm run dev`) and frontend (`npm run dev`) locally. Since there's no local Mongo, `GET /api/duel/leaderboard` will 503 and the card should show "Não foi possível carregar o ranking agora." — confirm that message appears instead of a crash or the old mock data. This is the honest degrade-without-Mongo path; the actual populated-ranking path can only be verified against the real Render+Atlas deployment.

- [ ] **Step 9: Commit**

```bash
git add src/games/WhoKnowsMore/WhoKnowsMore.jsx src/games/WhoKnowsMore/WhoKnowsMore.css
git commit -m "feat(frontend): replace mock ranked leaderboard with real trophy data"
```

---

### Task 13: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Correct the "No MongoDB needed" claim**

Find this line in the "Realtime multiplayer" section:

```markdown
- **No MongoDB needed.** Matches last ~2 minutes; queue and match state live in memory in the Node process (`backend/realtime/state.js`). This is unrelated to the auth system's Mongo dependency.
```

Replace it with:

```markdown
- **No MongoDB needed for the match itself.** Matches last ~2 minutes; queue and match state live in memory in the Node process (`backend/realtime/state.js`). This is unrelated to the auth system's Mongo dependency. **One exception:** ranked trophies (`backend/realtime/trophyAward.js`, `backend/models/DuelTrophy.js`) are a best-effort Mongo side-effect at match end — fire-and-forget, `.catch(() => {})`'d, never awaited on the path that emits `match:end`. Without Mongo connected, matches still play out normally; trophies just silently aren't recorded. See `docs/superpowers/specs/2026-08-06-ranked-duel-trophies-design.md`.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: note the ranked-trophy Mongo side-effect in the realtime section"
```
