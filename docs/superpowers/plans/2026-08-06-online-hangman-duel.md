# Forca Online (letra a letra) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the online duel's "digite a palavra inteira" Forca with a real letter-by-letter Hangman (gallows drawing + A–Z keyboard), matching the Bot mode's UX, while keeping the server as the sole holder of the secret word.

**Architecture:** New socket event `hangman:guess` lets the server validate one letter at a time against the word it already keeps server-side (`playerData.currentQuestion.correctAnswer`), and reply with only `{ inWord, positions }`. The client accumulates revealed positions locally and, once the whole word is uncovered, submits it through the existing `round:answer` flow — reusing scoring, timing and closing logic untouched. `buildQuestion('hangman', ...)` stops sending `options` (which today leaks the correct word) and instead sends a masked `wordTemplate` (e.g. `"Hello"` → `"#####"`) so the client can draw blanks without knowing the word.

**Tech Stack:** Node.js + Socket.IO (backend/realtime), Vitest (backend tests, node environment, no jsdom), React 19 + plain CSS (frontend, no component tests — manual browser verification only).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-06-online-hangman-duel-design.md` — every task below implements a section of it.
- Round timer stays at the shared 20s (`DEFAULT_TIMING.roundMs`) — no special-casing for hangman.
- Scoring stays speed-based via the existing `scoreFor`/`closeRound` path — no new scoring formula.
- No wrong-guess cap that ends the round early — the gallows drawing is cosmetic only.
- UI strings and code comments in pt-BR, matching the rest of the codebase (`CLAUDE.md`).
- Plain JavaScript + JSX, no TypeScript. No new dependencies.
- Backend tests run with `npm test` inside `backend/` (Vitest, node environment). Frontend has no component/render tests in this repo — verify manually with two browsers against a local backend.
- Do not modify: matchmaking (`tryMatch`), the other 7 online game types, bot-mode Hangman (`DuelHangman.jsx`).
- Never run `git commit`/`push`/deploy — the user handles VCS themselves.

---

### Task 1: `questionGenerator.js` — mask the word instead of leaking it in `options`

**Files:**
- Modify: `backend/realtime/questionGenerator.js`
- Test: `backend/realtime/questionGenerator.test.js`

**Interfaces:**
- Produces: `maskWord(word: string): string` — exported, replaces `[A-Za-z]` with `'#'`, keeps everything else.
- Produces: `buildQuestion('hangman', usedIndices)` now returns `{ type: 'hangman', wordIndex, prompt: { tip, wordTemplate }, correctAnswer }` — **no `options` key**.

- [ ] **Step 1: Write the failing tests**

Add to `backend/realtime/questionGenerator.test.js`, replacing the existing `for (const type of GAME_TYPE_IDS)` loop (it currently asserts every type — including hangman — has `options` containing `correctAnswer`; hangman must be excluded from that loop and covered by its own tests instead):

```js
import { describe, it, expect } from 'vitest';
import { buildQuestion, serializeQuestionForClient, maskWord, GAME_TYPE_IDS, pickRandomGameType } from './questionGenerator.js';

describe('buildQuestion — todos os tipos com múltipla escolha', () => {
  for (const type of GAME_TYPE_IDS) {
    if (type === 'hangman') continue; // hangman não usa `options` — ver describe própria abaixo
    it(`${type}: a resposta certa está entre as opções, sem opção duplicada`, () => {
      const q = buildQuestion(type);
      expect(q.options).toContain(q.correctAnswer);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBeGreaterThanOrEqual(2); // trueFalse tem 2, os demais têm 4
    });
  }

  it('trueFalse sempre tem exatamente as opções Verdadeiro/Falso', () => {
    const q = buildQuestion('trueFalse');
    expect(q.options.sort()).toEqual(['Falso', 'Verdadeiro']);
  });

  it('wordBuilder embaralha as letras (raramente igual ao original)', () => {
    const q = buildQuestion('wordBuilder');
    expect(q.prompt.scrambledText.replace(/ /g, '').length).toBe(q.correctAnswer.length);
  });

  it('respeita usedIndices para não repetir palavra na mesma partida', () => {
    const first = buildQuestion('translation');
    const used = new Set([first.wordIndex]);
    for (let i = 0; i < 20; i++) {
      const next = buildQuestion('translation', used);
      expect(next.wordIndex).not.toBe(first.wordIndex);
    }
  });
});

describe('buildQuestion — hangman', () => {
  it('nunca inclui options (a palavra certa não pode vazar por aí)', () => {
    const q = buildQuestion('hangman');
    expect(q).not.toHaveProperty('options');
  });

  it('wordTemplate tem o mesmo tamanho da resposta certa e mascara só letras', () => {
    const q = buildQuestion('hangman');
    const { wordTemplate } = q.prompt;
    expect(wordTemplate.length).toBe(q.correctAnswer.length);
    for (let i = 0; i < q.correctAnswer.length; i++) {
      const ch = q.correctAnswer[i];
      if (/[A-Za-z]/.test(ch)) expect(wordTemplate[i]).toBe('#');
      else expect(wordTemplate[i]).toBe(ch);
    }
  });
});

describe('maskWord', () => {
  it('mascara letras como #, preserva espaço e pontuação', () => {
    expect(maskWord('Hello')).toBe('#####');
    expect(maskWord('Good morning')).toBe('#### #######');
    expect(maskWord("I'm fine")).toBe("#'# ####");
    expect(maskWord('How are you?')).toBe('### ### ###?');
  });
});

describe('serializeQuestionForClient', () => {
  it('nunca inclui correctAnswer nem wordIndex', () => {
    const q = buildQuestion('memory');
    const serialized = serializeQuestionForClient(q);
    expect(serialized).not.toHaveProperty('correctAnswer');
    expect(serialized).not.toHaveProperty('wordIndex');
    expect(serialized).toEqual({ type: q.type, prompt: q.prompt, options: q.options });
  });

  it('para hangman, não inclui options nem qualquer letra da palavra', () => {
    const q = buildQuestion('hangman');
    const serialized = serializeQuestionForClient(q);
    expect(serialized).not.toHaveProperty('options');
    expect(serialized).not.toHaveProperty('correctAnswer');
    expect(serialized.prompt.wordTemplate).not.toMatch(/[A-Za-z]/);
  });
});

describe('pickRandomGameType', () => {
  it('sempre devolve um tipo válido', () => {
    for (let i = 0; i < 30; i++) {
      expect(GAME_TYPE_IDS).toContain(pickRandomGameType());
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run realtime/questionGenerator.test.js`
Expected: FAIL — `maskWord` is not exported, the hangman `options` test fails because `options` is still present today.

- [ ] **Step 3: Implement `maskWord` and change the hangman branch**

In `backend/realtime/questionGenerator.js`, add right after the `fourOptions` function (and before `buildQuestion`):

```js
// Mascara letras A-Z como '#', preservando espaço e pontuação (a FORMA da
// palavra, nunca o conteúdo) — usado pelo Forca online pra desenhar os
// espaços em branco sem revelar nenhuma letra.
export const maskWord = (word) => word.replace(/[A-Za-z]/g, '#');
```

Inside `buildQuestion`, replace the whole `case 'hangman':` branch — find this exact block:

```js
    case 'hangman': {
      return {
        type: 'hangman', wordIndex: index,
        prompt: { tip: word.tip },
        options: fourOptions(word.en, otherWords, w => w.en),
        correctAnswer: word.en,
      };
    }
```

and replace it with:

```js
    case 'hangman': {
      return {
        type: 'hangman', wordIndex: index,
        prompt: { tip: word.tip, wordTemplate: maskWord(word.en) },
        correctAnswer: word.en,
      };
    }
```

(This removes the `options: fourOptions(word.en, otherWords, w => w.en)` line that today leaks the correct word to the client.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run realtime/questionGenerator.test.js`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add backend/realtime/questionGenerator.js backend/realtime/questionGenerator.test.js
git commit -m "fix(realtime): stop leaking the hangman answer via options, send a masked template instead"
```

---

### Task 2: `round.js` — pure letter-guess validation and resolution

**Files:**
- Modify: `backend/realtime/round.js`
- Test: `backend/realtime/round.test.js`

**Interfaces:**
- Consumes: nothing new (same `match` shape used by `validateAnswer`/`closeRound`, plus `match.playerData.get(socketId).guessedLetters`, a `Set<string>` — added in Task 3).
- Produces: `validateLetterGuess(match, socketId, payload): { ok: boolean, error?: string }` — exported.
- Produces: `resolveLetterGuess(correctAnswer: string, letter: string): { inWord: boolean, positions: number[] }` — exported, pure.

- [ ] **Step 1: Write the failing tests**

Add to `backend/realtime/round.test.js` (keep the existing `import`/`makeMatch`/other describes as they are; just add the import and these two new describe blocks):

```js
import { describe, it, expect } from 'vitest';
import { closeRound, nextPhase, decideWinner, validateAnswer, validateLetterGuess, resolveLetterGuess } from './round.js';
```

```js
describe('resolveLetterGuess', () => {
  it('acha todas as posições de uma letra repetida na palavra', () => {
    expect(resolveLetterGuess('Hello', 'L')).toEqual({ inWord: true, positions: [2, 3] });
  });

  it('devolve positions vazio quando a letra não está na palavra', () => {
    expect(resolveLetterGuess('Hello', 'Z')).toEqual({ inWord: false, positions: [] });
  });

  it('ignora caixa da resposta certa (compara em maiúsculas)', () => {
    expect(resolveLetterGuess('good morning', 'G')).toEqual({ inWord: true, positions: [0] });
  });

  it('não conta espaço nem pontuação como letra', () => {
    expect(resolveLetterGuess("I'm fine", "'")).toEqual({ inWord: false, positions: [] });
  });
});

describe('validateLetterGuess', () => {
  const makeMatchWithPlayerData = (guessed = []) => makeMatch({
    playerData: new Map([
      ['a', { guessedLetters: new Set(guessed) }],
      ['b', { guessedLetters: new Set() }],
    ]),
  });

  it('aceita uma letra válida ainda não tentada', () => {
    const match = makeMatchWithPlayerData();
    expect(validateLetterGuess(match, 'a', { roundIndex: 0, letter: 'A' }).ok).toBe(true);
  });

  it('recusa se a partida não existe', () => {
    expect(validateLetterGuess(null, 'a', { roundIndex: 0, letter: 'A' }).ok).toBe(false);
  });

  it('recusa quando a rodada já está fechada', () => {
    const match = makeMatchWithPlayerData();
    match.roundClosed = true;
    const r = validateLetterGuess(match, 'a', { roundIndex: 0, letter: 'A' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/encerrada/);
  });

  it('recusa rodada diferente', () => {
    const match = makeMatchWithPlayerData();
    expect(validateLetterGuess(match, 'a', { roundIndex: 3, letter: 'A' }).ok).toBe(false);
  });

  it('recusa se o jogador já enviou a palavra final da rodada', () => {
    const match = makeMatchWithPlayerData();
    match.answers.set('a', { choice: 'hello', arrivedAt: 1 });
    expect(validateLetterGuess(match, 'a', { roundIndex: 0, letter: 'A' }).ok).toBe(false);
  });

  it('recusa letra repetida', () => {
    const match = makeMatchWithPlayerData(['A']);
    const r = validateLetterGuess(match, 'a', { roundIndex: 0, letter: 'A' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/já tentou/);
  });

  it('recusa formato inválido de letra', () => {
    const match = makeMatchWithPlayerData();
    expect(validateLetterGuess(match, 'a', { roundIndex: 0, letter: 'a' }).ok).toBe(false);   // minúscula
    expect(validateLetterGuess(match, 'a', { roundIndex: 0, letter: 'AB' }).ok).toBe(false);  // mais de 1 caractere
    expect(validateLetterGuess(match, 'a', { roundIndex: 0, letter: '5' }).ok).toBe(false);   // não é letra
    expect(validateLetterGuess(match, 'a', { roundIndex: 0 }).ok).toBe(false);                 // ausente
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx vitest run realtime/round.test.js`
Expected: FAIL — `validateLetterGuess` and `resolveLetterGuess` are not exported yet.

- [ ] **Step 3: Implement both functions in `round.js`**

Add near the top of `backend/realtime/round.js`, after the `import { scoreFor } from './scoring.js';` line:

```js
/**
 * Calcula o resultado de um chute de letra contra a resposta certa (nunca
 * exposta ao cliente). Pura — quem decide o que fazer com o resultado
 * (marcar guessedLetters, montar o ack) é o handler do socket.
 */
export const resolveLetterGuess = (correctAnswer, letter) => {
  const upper = (correctAnswer || '').toUpperCase();
  const positions = [];
  for (let i = 0; i < upper.length; i++) {
    if (upper[i] === letter) positions.push(i);
  }
  return { inWord: positions.length > 0, positions };
};
```

Add at the end of `round.js`, after `validateAnswer`:

```js

/**
 * Aceita este chute de letra agora? Motivo em texto quando não. Só usado
 * pelo Forca (hangman) — cada jogador tem sua própria palavra em
 * playerData, então guessedLetters vive lá, não em match.answers.
 */
export const validateLetterGuess = (match, socketId, payload) => {
  if (!match) return { ok: false, error: 'Partida não encontrada.' };
  if (match.roundClosed) return { ok: false, error: 'Rodada já encerrada.' };
  if (payload?.roundIndex !== match.roundIndex) return { ok: false, error: 'Rodada já encerrada.' };
  if (match.answers.has(socketId)) return { ok: false, error: 'Você já respondeu esta rodada.' };
  const letter = payload?.letter;
  if (typeof letter !== 'string' || !/^[A-Z]$/.test(letter)) {
    return { ok: false, error: 'Letra inválida.' };
  }
  const pd = match.playerData?.get(socketId);
  if (pd?.guessedLetters?.has(letter)) {
    return { ok: false, error: 'Você já tentou essa letra.' };
  }
  return { ok: true };
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx vitest run realtime/round.test.js`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add backend/realtime/round.js backend/realtime/round.test.js
git commit -m "feat(realtime): add pure letter-guess validation and resolution for hangman"
```

---

### Task 3: `state.js` + `index.js` — wire the `hangman:guess` socket event

**Files:**
- Modify: `backend/realtime/state.js`
- Modify: `backend/realtime/index.js`

**Interfaces:**
- Consumes: `validateLetterGuess`, `resolveLetterGuess` from Task 2; `maskWord`/new `buildQuestion` shape from Task 1.
- Produces: `playerData` entries now carry a `guessedLetters` field (`null` until `startRound` sets a fresh `Set()`).
- Produces: socket event `hangman:guess` — `emit({ matchId, roundIndex, letter }, ack)` → `ack({ ok: true, inWord, positions })` or `ack({ ok: false, error })`.

- [ ] **Step 1: Add `guessedLetters` to the initial `playerData` shape**

In `backend/realtime/state.js`, inside `createMatch`, change:

```js
    // Por jogador: índices usados e pergunta ativa desta rodada
    playerData: new Map(players.map(p => [p.socketId, {
      usedIndices: [],
      currentQuestion: null,
    }])),
```

to:

```js
    // Por jogador: índices usados e pergunta ativa desta rodada
    playerData: new Map(players.map(p => [p.socketId, {
      usedIndices: [],
      currentQuestion: null,
      guessedLetters: null, // só usado no Forca — startRound cria um Set novo a cada rodada
    }])),
```

- [ ] **Step 2: Reset `guessedLetters` every round in `index.js`**

In `backend/realtime/index.js`, inside `startRound`, change:

```js
    pdA.currentQuestion = qA;
    pdB.currentQuestion = qB;
```

to:

```js
    pdA.currentQuestion = qA;
    pdB.currentQuestion = qB;
    pdA.guessedLetters = new Set();
    pdB.guessedLetters = new Set();
```

- [ ] **Step 3: Import the new round.js functions**

In `backend/realtime/index.js`, change the import line:

```js
import { closeRound, nextPhase, decideWinner, validateAnswer } from './round.js';
```

to:

```js
import { closeRound, nextPhase, decideWinner, validateAnswer, validateLetterGuess, resolveLetterGuess } from './round.js';
```

- [ ] **Step 4: Add the `hangman:guess` handler**

In `backend/realtime/index.js`, inside `io.on('connection', (socket) => { ... })`, add this handler right after the existing `socket.on('round:answer', ...)` block (before `socket.on('duel:leave', ...)`):

```js
    // Forca online: um chute de letra por vez. O servidor nunca manda a
    // palavra inteira — só se a letra está nela e em que posições.
    socket.on('hangman:guess', (payload, ack) => {
      if (isRateLimited(`hangman:${socket.id}`, { windowMs: 1_000, max: 15 })) {
        return ack?.({ ok: false, error: 'Muitas tentativas em pouco tempo.' });
      }

      const match = matches.get(payload?.matchId);
      const check = validateLetterGuess(match, socket.id, payload);
      if (!check.ok) return ack?.(check);

      const pd = match.playerData.get(socket.id);
      pd.guessedLetters.add(payload.letter);
      const { inWord, positions } = resolveLetterGuess(pd.currentQuestion?.correctAnswer, payload.letter);
      ack?.({ ok: true, inWord, positions });
    });
```

- [ ] **Step 5: Sanity-check the backend still boots and existing tests pass**

Run: `cd backend && npx vitest run`
Expected: PASS — all existing suites (including Tasks 1 and 2's new tests) still green; no test yet exercises `hangman:guess` over a real socket (that's Task 4).

- [ ] **Step 6: Commit**

```bash
git add backend/realtime/state.js backend/realtime/index.js
git commit -m "feat(realtime): wire hangman:guess socket event for letter-by-letter online duels"
```

---

### Task 4: Integration tests — `hangman:guess` over real sockets

**Files:**
- Modify: `backend/realtime/duel.integration.test.js`

**Interfaces:**
- Consumes: the live `hangman:guess` handler from Task 3, via real Socket.IO connections (same pattern as the rest of this file: `connect()`, `once()`, `emitAck()`, `pair()`-style helpers).

- [ ] **Step 1: Write the new tests**

Add this new `describe` block at the end of `backend/realtime/duel.integration.test.js` (after the existing `describe('duelo — presença', ...)` block):

```js
describe('duelo — forca (hangman letra a letra)', () => {
  const pairHangman = async () => {
    const p1 = await connect();
    const p2 = await connect();
    const found1 = once(p1, 'match:found');
    const found2 = once(p2, 'match:found');
    const round1 = once(p1, 'round:start');
    const round2 = once(p2, 'round:start');

    await emitAck(p1, 'queue:join', { nickname: 'Ana', gameTypePreference: 'hangman' });
    await emitAck(p2, 'queue:join', { nickname: 'Beto', gameTypePreference: 'hangman' });

    const [m1, m2] = await Promise.all([found1, found2]);
    const [r1, r2] = await Promise.all([round1, round2]);
    return { p1, p2, m1, m2, r1, r2 };
  };

  it('resolve hangman quando os dois pedem, sem vazar options nem correctAnswer', async () => {
    const { p1, p2, m1, r1 } = await pairHangman();
    expect(m1.gameType).toBe('hangman');
    expect(r1.question.type).toBe('hangman');
    expect(r1.question).not.toHaveProperty('options');
    expect(r1.question).not.toHaveProperty('correctAnswer');
    expect(typeof r1.question.prompt.wordTemplate).toBe('string');
    expect(r1.question.prompt.wordTemplate).not.toMatch(/[A-Za-z]/);
    p1.disconnect(); p2.disconnect();
  });

  it('chutar uma letra devolve posições consistentes com o template', async () => {
    const { p1, p2, m1, r1 } = await pairHangman();
    const template = r1.question.prompt.wordTemplate;
    const res = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(res.ok).toBe(true);
    if (res.inWord) {
      expect(res.positions.length).toBeGreaterThan(0);
      for (const pos of res.positions) expect(template[pos]).toBe('#');
    } else {
      expect(res.positions).toEqual([]);
    }
    p1.disconnect(); p2.disconnect();
  });

  it('recusa letra repetida', async () => {
    const { p1, p2, m1 } = await pairHangman();
    const first = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(first.ok).toBe(true);
    const second = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(second.ok).toBe(false);
    p1.disconnect(); p2.disconnect();
  });

  it('recusa formato de letra inválido', async () => {
    const { p1, p2, m1 } = await pairHangman();
    const lower = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'a' });
    expect(lower.ok).toBe(false);
    const multi = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'AB' });
    expect(multi.ok).toBe(false);
    p1.disconnect(); p2.disconnect();
  });

  it('recusa chute de letra depois que o jogador já enviou a palavra final', async () => {
    const { p1, p2, m1 } = await pairHangman();
    await emitAck(p1, 'round:answer', { matchId: m1.matchId, roundIndex: 0, choice: 'qualquer coisa' });
    const afterAnswer = await emitAck(p1, 'hangman:guess', { matchId: m1.matchId, roundIndex: 0, letter: 'A' });
    expect(afterAnswer.ok).toBe(false);
    p1.disconnect(); p2.disconnect();
  });
});
```

- [ ] **Step 2: Run the new tests**

Run: `cd backend && npx vitest run realtime/duel.integration.test.js`
Expected: PASS. (These are integration tests against the real socket server on an ephemeral port — if any fails, check that Task 3's handler is registered before this test file's `beforeAll` starts the server, and that `gameTypePreference: 'hangman'` matches `GAME_TYPE_IDS` exactly.)

- [ ] **Step 3: Run the full backend suite**

Run: `cd backend && npx vitest run`
Expected: PASS, all suites green (should be 100+ tests at this point, all passing).

- [ ] **Step 4: Commit**

```bash
git add backend/realtime/duel.integration.test.js
git commit -m "test(realtime): cover hangman:guess end-to-end over real sockets"
```

---

### Task 5: `useDuelSocket.js` — client `guessLetter` function

**Files:**
- Modify: `src/hooks/useDuelSocket.js`

**Interfaces:**
- Consumes: `hangman:guess` socket event from Task 3.
- Produces: `guessLetter(letter: string, callback: (ack) => void): void`, added to the hook's returned object alongside `submitAnswer`.

- [ ] **Step 1: Add the function**

In `src/hooks/useDuelSocket.js`, add this right after the existing `submitAnswer` function (which ends just before `/** Desistir de propósito... */ const forfeit = ...`):

```js
  /** Forca online: chuta uma letra, recebe { inWord, positions } (ou erro) pelo callback. */
  const guessLetter = useCallback((letter, callback) => {
    socketRef.current?.emit('hangman:guess', {
      matchId: matchIdRef.current,
      roundIndex,
      letter,
    }, (ack) => callback?.(ack));
  }, [roundIndex]);
```

- [ ] **Step 2: Export it from the hook's return object**

Change:

```js
    joinQueue, leaveQueue, submitAnswer, forfeit, resetMatch,
```

to:

```js
    joinQueue, leaveQueue, submitAnswer, guessLetter, forfeit, resetMatch,
```

- [ ] **Step 3: Sanity check**

No automated test exists for this hook (no jsdom/component tests in this repo). Verify by reading the diff: `guessLetter` follows the exact same `useCallback` + `socketRef.current?.emit(...)` pattern as `submitAnswer`, with `roundIndex` as its only dependency (same as `submitAnswer`).

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useDuelSocket.js
git commit -m "feat(duel-socket): add guessLetter for the online hangman rebuild"
```

---

### Task 6: `OnlineHangman.jsx` — new component (gallows + keyboard)

**Files:**
- Create: `src/games/WhoKnowsMore/games/OnlineHangman.jsx`
- Modify: `src/games/HangmanGame/HangmanGame.css`

**Interfaces:**
- Consumes: `duel.guessLetter` from Task 5; `HangmanGame.css` classes (`.hangman-drawing`, `.hangman-svg`, `.hangman-word`, `.hangman-letter`, `.hangman-keyboard`, `.key-btn`) already used by `DuelHangman.jsx` (bot mode) — same visuals, reused as-is.
- Produces: `<OnlineHangman tip={string} wordTemplate={string} duel={duelHookObject} onAnswer={(word: string) => void} />` — a default export, consumed by Task 7.

- [ ] **Step 1: Add a CSS rule for non-letter template characters**

In `src/games/HangmanGame/HangmanGame.css`, right after the existing rule:

```css
.hangman-letter.revealed { color: var(--accent-green); border-color: var(--accent-green); }
```

add:

```css
/* Espaço/pontuação dentro da palavra (ex.: "Good morning") — mostrado
   direto, sem o traço de "letra por descobrir" das demais posições. */
.hangman-letter--literal { border-bottom-color: transparent; color: var(--text-secondary); }
```

- [ ] **Step 2: Create the component**

Create `src/games/WhoKnowsMore/games/OnlineHangman.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react';
import useSound from '../../../hooks/useSound';
import '../../../games/HangmanGame/HangmanGame.css';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Desenho progressivo da forca — mesmo SVG do modo Bot (DuelHangman.jsx),
// parametrizado por wrongCount em vez de ler de state local.
const renderHangman = (wrongCount) => (
  <svg viewBox="0 0 200 250" className="hangman-svg">
    <line x1="20" y1="230" x2="180" y2="230" stroke="var(--text-muted)" strokeWidth="3" />
    <line x1="60" y1="230" x2="60" y2="20"  stroke="var(--text-muted)" strokeWidth="3" />
    <line x1="60" y1="20"  x2="130" y2="20"  stroke="var(--text-muted)" strokeWidth="3" />
    <line x1="130" y1="20"  x2="130" y2="50" stroke="var(--text-muted)" strokeWidth="3" />
    {wrongCount >= 1 && <circle cx="130" cy="65"  r="15"  stroke="var(--accent-red)" strokeWidth="3" fill="none" className="animate-fade-in" />}
    {wrongCount >= 2 && <line x1="130" y1="80"  x2="130" y2="150" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 3 && <line x1="130" y1="100" x2="100" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 4 && <line x1="130" y1="100" x2="160" y2="130" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 5 && <line x1="130" y1="150" x2="105" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
    {wrongCount >= 6 && <line x1="130" y1="150" x2="155" y2="200" stroke="var(--accent-red)" strokeWidth="3" className="animate-fade-in" />}
  </svg>
);

/**
 * Forca online: mesma aparência do modo Bot (forca desenhada, teclado A-Z),
 * mas cada chute de letra vai pro servidor (hangman:guess) — a palavra
 * nunca existe neste componente, só o que já foi revelado pelos acks.
 * Sem limite de erros que force perda antecipada: dá pra tentar letras até
 * acertar a palavra toda ou o tempo da rodada (compartilhado, 20s) acabar.
 */
const OnlineHangman = ({ tip, wordTemplate, duel, onAnswer }) => {
  const { playCorrect, playWrong, playClick } = useSound();
  const [correctLetters, setCorrectLetters] = useState(new Set());
  const [wrongLetters, setWrongLetters] = useState(new Set());
  const [positions, setPositions] = useState({}); // { [índice]: letra }
  const answeredRef = useRef(false);

  const handleGuess = (letter) => {
    if (answeredRef.current || correctLetters.has(letter) || wrongLetters.has(letter)) return;
    playClick();
    duel.guessLetter(letter, (ack) => {
      if (!ack?.ok) return; // rodada fechou / já tentada — o servidor já recusou, nada a fazer aqui
      if (ack.inWord) {
        playCorrect();
        setCorrectLetters(prev => new Set(prev).add(letter));
        setPositions(prev => {
          const next = { ...prev };
          for (const pos of ack.positions) next[pos] = letter;
          return next;
        });
      } else {
        playWrong();
        setWrongLetters(prev => new Set(prev).add(letter));
      }
    });
  };

  // Assim que todas as posições mascaradas do template forem reveladas,
  // monta a palavra e entrega pro pai — mesmo fluxo de handleAnswer usado
  // pelos outros tipos de jogo (fecha a rodada via round:answer).
  useEffect(() => {
    if (answeredRef.current) return;
    const chars = wordTemplate.split('');
    const done = chars.every((ch, i) => ch !== '#' || positions[i] !== undefined);
    if (!done) return;
    answeredRef.current = true;
    const word = chars.map((ch, i) => (ch === '#' ? positions[i] : ch)).join('');
    onAnswer(word);
  }, [positions, wordTemplate, onAnswer]);

  const wrongCount = wrongLetters.size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
      <div className="question-card glass-card" style={{ width: '100%' }}>
        <span className="question-label">🎯 Dica:</span>
        <p style={{ fontSize: 'var(--fs-lg)', fontStyle: 'italic', textAlign: 'center' }}>"{tip}"</p>
      </div>

      <div className="hangman-drawing">{renderHangman(wrongCount)}</div>

      <div className="hangman-word animate-fade-in-up">
        {wordTemplate.split('').map((ch, i) => (
          ch === '#'
            ? (
              <span key={i} className={`hangman-letter ${positions[i] ? 'revealed' : ''}`}>
                {positions[i] || '_'}
              </span>
            )
            : (
              <span key={i} className="hangman-letter hangman-letter--literal">
                {ch === ' ' ? ' ' : ch}
              </span>
            )
        ))}
      </div>

      <div className="hangman-keyboard animate-fade-in-up">
        {ALPHABET.map(letter => {
          const isCorrect = correctLetters.has(letter);
          const isWrong = wrongLetters.has(letter);
          return (
            <button
              key={letter}
              className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
              onClick={() => handleGuess(letter)}
              disabled={isCorrect || isWrong || answeredRef.current}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineHangman;
```

- [ ] **Step 3: Lint**

Run: `npx oxlint src/games/WhoKnowsMore/games/OnlineHangman.jsx`
Expected: no errors. (This file is inside the frontend tree, covered by the root `.oxlintrc.json`, unlike `backend/`.)

- [ ] **Step 4: Commit**

```bash
git add src/games/WhoKnowsMore/games/OnlineHangman.jsx src/games/HangmanGame/HangmanGame.css
git commit -m "feat(duel): add OnlineHangman component with gallows drawing and A-Z keyboard"
```

---

### Task 7: `DuelOnlineGame.jsx` — wire the new component in

**Files:**
- Modify: `src/games/WhoKnowsMore/games/DuelOnlineGame.jsx`

**Interfaces:**
- Consumes: `OnlineHangman` from Task 6.

- [ ] **Step 1: Remove the old inline `OnlineHangman` and import the new one**

Delete this whole block near the top of the file (the old free-text-input version, right after the `makeTiles` helper and before `// ─── Componente principal`):

```jsx
// ─── Componente de Forca Online ──────────────────────────────────────────────
const OnlineHangman = ({ tip, onAnswer }) => {
  const [guesses, setGuesses] = useState(new Set());
  const [phase, setPhase] = useState(0); // 0-6 erros
  const answeredRef = useRef(false);

  // Palavra secreta é substituída por "ANSWER" — o servidor não a envia.
  // O jogador digita letras; o servidor valida a palavra completa.
  const [wordInput, setWordInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleSubmit = () => {
    if (submitted || !wordInput.trim()) return;
    setSubmitted(true);
    onAnswer(wordInput.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
      <div className="question-card glass-card" style={{ width: '100%' }}>
        <span className="question-label">🎯 Dica:</span>
        <p style={{ fontSize: 'var(--fs-lg)', fontStyle: 'italic', textAlign: 'center' }}>"{tip}"</p>
      </div>

      <div className="duel-field" style={{ width: '100%' }}>
        <label>Qual é a palavra em inglês?</label>
        <input
          value={wordInput}
          onChange={e => setWordInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Digite sua resposta..."
          disabled={submitted}
          maxLength={50}
          autoFocus
          style={{ fontSize: 'var(--fs-lg)', textAlign: 'center' }}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={submitted || !wordInput.trim()}
        style={{ width: '100%' }}
      >
        {submitted ? '✅ Resposta enviada!' : '📤 Enviar Resposta'}
      </button>
    </div>
  );
};
```

Add the import at the top of the file, alongside the other imports:

```jsx
import OnlineHangman from './OnlineHangman';
```

- [ ] **Step 2: Update the render block to pass `wordTemplate` and `duel`**

Replace:

```jsx
      {/* Forca */}
      {question.type === 'hangman' && !playerDone && (
        <>
          <OnlineHangman
            tip={question.prompt?.tip || ''}
            onAnswer={handleAnswer}
          />
        </>
      )}
```

with:

```jsx
      {/* Forca */}
      {question.type === 'hangman' && !playerDone && (
        <OnlineHangman
          tip={question.prompt?.tip || ''}
          wordTemplate={question.prompt?.wordTemplate || ''}
          duel={duel}
          onAnswer={handleAnswer}
        />
      )}
```

(The `playerDone` block right after it, showing `Resposta enviada: "{playerAnswer}"`, stays exactly as-is — `handleAnswer` already sets `playerAnswer` to whatever word `OnlineHangman` assembled, same as before.)

- [ ] **Step 3: Lint**

Run: `npx oxlint src/games/WhoKnowsMore/games/DuelOnlineGame.jsx`
Expected: no errors, no unused-import warnings (the old inline component's only extra import needs were `useState`/`useRef`, both still used elsewhere in this file for other game types — verify nothing became unused).

- [ ] **Step 4: Run the backend suite once more as a full regression check**

Run: `cd backend && npx vitest run`
Expected: PASS (this task only touches frontend files, but it's the last checkpoint before manual verification — confirms nothing in Tasks 1–4 regressed).

- [ ] **Step 5: Commit**

```bash
git add src/games/WhoKnowsMore/games/DuelOnlineGame.jsx
git commit -m "feat(duel): render the real letter-by-letter OnlineHangman in the online duel"
```

---

### Task 8: Manual end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Start the backend locally**

Run: `cd backend && npm run dev`
Expected: server listening on `http://localhost:5000`, no `MONGODB_URI` needed (hangman/duel routes don't touch Mongo).

- [ ] **Step 2: Start the frontend**

Run: `npm run dev` (repo root)
Expected: Vite dev server up, proxying `/api` to the backend per `vite.config.js`.

- [ ] **Step 3: Play a full hangman duel across two browser windows**

Open `http://localhost:5173/games/who-knows-more` in two separate browser windows (or one normal + one incognito, so they get different guest identities). In both, choose "Contra pessoa real" → select **Forca** specifically in the game-type grid → search. Confirm:
- Both land in the same match, gallows + A-Z keyboard visible (not the old text box).
- Clicking a letter shows immediate feedback (correct letters appear in the word, keyboard button turns green; wrong letters turn the keyboard button red/dim and the gallows adds a piece).
- A word with a space or apostrophe (keep trying rounds until one appears, e.g. "Good morning" or "I'm fine") shows the space/punctuation directly, never as a blank to guess.
- Solving the word before the 20s timer ends closes the round immediately and shows the round result.
- Letting the timer run out without finishing still closes the round (as incorrect) instead of hanging.
- Repeat for at least 2–3 rounds to see a few different words.

- [ ] **Step 4: Confirm no leak in the network tab**

With DevTools open on the Network/WS tab during a hangman round, inspect the `round:start` payload. Confirm it contains only `{ type, prompt: { tip, wordTemplate } }` — no `options`, no `correctAnswer`, no plaintext word anywhere in the frame.

- [ ] **Step 5: Report back**

Summarize what was tested and any issue found. If something doesn't match the design (e.g. visual glitch, wrong scoring), describe it precisely (which step, what was expected vs. observed) rather than silently patching — bring it back for a quick fix pass.
