# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**EnglishPlay** — a free browser game platform that teaches English to Brazilian Portuguese speakers. Game state is still 100% client-side: *all* progress/settings live in `localStorage` via `useProgress`/`storage.js`, exactly as before.

**Authentication now exists as a separate system.** [Register.jsx](src/pages/Register.jsx) and [Login.jsx](src/pages/Login.jsx) are real screens backed by [backend/](backend/) (Express + Mongoose), **deployed on Render with MongoDB Atlas connected** — see Deploy below. Don't conflate the two systems: auth is about *who is signed in*, progress/scoring is still untouched and still lives entirely in `localStorage`. Migrating progress to the server is explicit future work, not done — and when it happens, the server must re-validate everything, because nothing the client stores is trustworthy.

Those screens are now the front door — `/` sends a first-time visitor to `/welcome`. See "The entry screen, and what it is not" under Architecture, especially the part about why it is not a security boundary.

The UI is written in **Portuguese (pt-BR)**. English text only ever appears as learning content (the words/sentences being taught). Keep new UI strings in Portuguese.

**Two deliberate exceptions to pt-BR-everywhere:**
- The Conversation screen ([Conversation.jsx](src/pages/Conversation.jsx)) has its chrome in English — the user asked for an immersive practice screen. Grammar corrections there stay in Portuguese, because explaining a mistake in English to someone who cannot yet read English teaches nothing. Don't "fix" either half by making the screen consistent.
- File/route names stay in English even where copy is Portuguese, matching every other page (`Settings.jsx`→`/settings`, `Shop.jsx`→`/shop`). This is why the new pages are `Register.jsx`/`/register` and `Login.jsx`/`/login`, not `Cadastro.jsx`/`/cadastro` — "Cadastro" only appears as visible text.

Despite the repo name `saas_ingles`, there is still no payments and no multi-tenancy. There *is* now a server scaffold — see below.

## Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # production build to dist/
npm run preview    # serve the built dist/
npm run lint       # oxlint (config in .oxlintrc.json)
npm test           # Vitest, single run
npm run test:watch # Vitest in watch mode
```

Run a single file with `npm test -- storage` (matches the filename) or a single case with `npm test -- -t "migração"`.

Tests live beside the code they cover (`src/utils/*.test.js`, `src/data/data.test.js`) and run in Vitest's default **node** environment — there is no jsdom. Anything touching `localStorage` must stub it (see [storage.test.js](src/utils/storage.test.js)); there are no component/render tests. Cases named "regressão" pin a bug that actually shipped — read the comment before changing one.

## Deploy

Static build on Vercel (`dist/`), auto-deployed from the GitHub repo. [vercel.json](vercel.json) rewrites every path to `/index.html` — routing is entirely client-side, so without that fallback a direct hit or refresh on `/games/memory` returns 404. Vercel matches real files before applying rewrites, so assets are unaffected. Any new host needs the same SPA fallback.

The backend is live at **`https://saas-ingles.onrender.com`** (Render free plan), with MongoDB Atlas connected — verified: `/api/health` → `{"ok":true}`, `/api/presence` → `{"online":0,"queue":0}`, and `POST /api/auth/login` → `401` with the generic message, which only happens if the DB was actually queried (no DB would give `503` via `requireDb`).

Two entries in `vercel.json` carry that:

```json
{ "source": "/api/(.*)", "destination": "https://saas-ingles.onrender.com/api/$1" }
```

**Order matters** — `rewrites` are evaluated top-down and the `/(.*)` SPA catch-all matches `/api/*` too, so the API rewrite must stay **above** it. Putting it below is the bug this repo shipped for a while: `GET /api/health` returned `index.html` with status 200 and every auth call died at 405.

The CSP names the same host twice (`https://` for fetch, `wss://` for the duel socket). `connect-src` takes no wildcard, so **the host is already a repo constant** — which is why `useDuelSocket.js` keeps it in code with `VITE_REALTIME_URL` as an override, rather than depending on a dashboard variable that could silently drift from the CSP and get every connection blocked with no visible misconfiguration.

`FRONTEND_ORIGIN` on Render is set and verified: the Socket.IO handshake returns `access-control-allow-origin` for the Vercel domain and omits it for any other origin.

## Security

[vercel.json](vercel.json) also sets the security headers. Constraints worth knowing before you change things:

- **CSP is `default-src 'self'`.** No third-party origin may be added without a matching directive — that's deliberate. If you find yourself adding a CDN, self-host it instead.
- **Fonts are self-hosted** in `public/fonts` (variable woff2, generated into [src/fonts.css](src/fonts.css)). Do **not** point back at `fonts.googleapis.com`: it re-adds a third party to the critical path, leaks every visitor's IP to Google (LGPD), and the CSP would block it anyway.
- **`style-src` still needs `'unsafe-inline'`** because the codebase uses `style={{ ... }}` heavily, which emits `style` attributes. That is the one real weakness left in the CSP; moving those inline styles to classes would let it go.
- **`frame-ancestors 'none'` + `X-Frame-Options: DENY`** — the site cannot be embedded. Verified against production.
- **`localStorage` is treated as untrusted input.** `loadProgress`/`loadSettings` coerce types, clamp ranges, drop over-long keys and ignore `__proto__`. Keep it that way, and note what it does *not* do: it is not authorization. **When progress/scoring migrates to the server, the server must re-validate everything** — never let a client-supplied score or entitlement be trusted. (Auth itself has now landed — see below — but progress hasn't moved yet.)
- **Known advisory:** `react-router` 7.18.1 carries GHSA-qwww-vcr4-c8h2 (RSC-mode CSRF bypass). No fixed release exists yet (npm's suggested "fix" is a downgrade to 7.11.0; don't). **Re-assessed now that a backend exists:** still not exploitable — Register.jsx/Login.jsx use plain `useState` + `fetch` inside submit handlers, not the data router, not loaders/actions, not RSC. This conclusion holds only as long as that stays true; re-check if auth flows ever move to a data router.
- **`connect-src 'self'` is unaffected by the new auth calls** — `authClient.js` only ever fetches relative `/api/...` paths. The intended production topology is a Vercel `rewrites` entry proxying `/api/*` to the Render backend (server-to-server, invisible to the browser), not an absolute cross-origin URL — that's *why* the CSP doesn't need to change now or later. Don't "fix" this by pointing the frontend at an absolute Render URL; that would force `connect-src` open to a third party and reintroduce cross-site cookie complexity this design deliberately avoids.
- **Deliberate, narrow exception for WebSockets:** unlike `fetch`, the duel's Socket.IO client ([useDuelSocket.js](src/hooks/useDuelSocket.js)) connects **directly** to the Render backend's own origin (`VITE_REALTIME_URL`), not through a Vercel rewrite. A Vercel rewrite proxies plain HTTP request/response; there is no documented/verified guarantee it tunnels a WebSocket *upgrade* to an external origin, and this repo isn't going to build a security-relevant feature on an unverified assumption. `connect-src` names that one host **twice** — `https://` and `wss://` — because Socket.IO's default transport starts as an HTTP long-poll handshake before upgrading to a WebSocket; either scheme missing breaks the connection at a different stage. Still not a wildcard, not a real third party (it's this app's own backend, just a different subdomain), and `credentials: false` on the socket's CORS means the fragile cross-site-cookie case the `fetch` rule protects against never enters the picture here (duel identity is a throwaway nickname, not the session cookie). This is an addition specific to the WebSocket case, not a reversal of the `fetch`/`connect-src 'self'` rule above.

Dependabot ([.github/dependabot.yml](.github/dependabot.yml)) opens weekly dependency PRs and immediate security ones.

## Backend (scaffold)

[backend/](backend/) is an Express + Mongoose API for the Register/Login screens — see [backend/README.md](backend/README.md) for the full rationale. Key points for future sessions:

- **Independent package**, not a workspace: its own `package.json`/`node_modules`, excluded from root Vitest (`vite.config.js`'s `test.exclude`) and root oxlint (`.oxlintrc.json`'s `ignorePatterns`). Don't wire it into root tooling without revisiting that exclusion.
- **Not deployed, no live `MONGODB_URI`.** `config/db.js` connects only if the env var is set; otherwise the process still boots and DB-dependent routes (`register`, `login`) answer `503` via the `requireDb` middleware rather than hanging or crashing. `logout` and `me` need no DB at all — they work off the JWT alone.
- **Session = httpOnly cookie carrying a JWT**, never a token the client stores itself — matches the same "localStorage is untrusted" principle above. `SameSite=Lax` (not `None`) because the topology is same-origin by design; that also means no separate CSRF token is needed (cross-site POSTs don't carry the cookie).
- **6 routes:** `POST /api/auth/register` (creates + logs in, 201), `POST /api/auth/login` (200, generic 401 on any mismatch — never reveals whether an email exists), `POST /api/auth/logout` (200), `GET /api/auth/me` (reads the JWT payload directly), `GET /api/auth/profile` and `PATCH /api/auth/profile` (nickname read/update — see below).
- **Nickname lives on `User`, not in the JWT.** `{ id, sub, email }` is all the token carries, so `/me` can answer with zero DB hits — but that means a nickname change wouldn't be reflected anywhere until the 7-day-old token got reissued if it rode along in the token. `GET`/`PATCH /api/auth/profile` (both `requireAuth` + `requireDb`) hit `User.findById`/`findByIdAndUpdate` instead, deliberately breaking `/me`'s no-DB property for these two routes only. `nickname` has no unique index and no required-at-registration step: it's `null` until the person sets one from Settings' "👤 Perfil" card, matching the product framing ("choose it after logging in, change it later") rather than the registration form. [Settings.jsx](src/pages/Settings.jsx) fetches it from the server on mount (`getProfileRequest`) instead of trusting `entryChoice` alone — that's what surfaces a stale/missing session honestly (a 401 there means the local "logged in" flag and the actual cookie have diverged) instead of the account card silently showing contradictory "log in or sign up" copy to someone who already has a session.
- Root `vite.config.js` proxies `/api` to `http://localhost:5000` in dev, so `src/utils/authClient.js`'s relative fetches work locally without any origin configuration — the same relative-path story that will hold once the Vercel rewrite exists.

### Realtime multiplayer ("Quem Sabe Mais?" human duel)

[backend/realtime/](backend/realtime/) is a Socket.IO server attached to the same `http.Server` as Express (see `server.js`) — this is why `server.js`, not `app.js`, is the one file that had to change non-additively (it now builds a raw `http.Server` instead of calling `app.listen()` directly; `app.js` itself, and `app.test.js`'s supertest-based tests, are unaffected since supertest never calls `.listen()`).

- **No MongoDB needed.** Matches last ~2 minutes; queue and match state live in memory in the Node process (`backend/realtime/state.js`). This is unrelated to the auth system's Mongo dependency.
- **The server is authoritative for the question, the timing, and the correct answer — never the client.** It picks the word/game type, shuffles options, and only reveals `correctAnswer` after both players have answered (or the round times out). Timing is measured by when the answer *arrives at the server* (`backend/realtime/scoring.js`), never a client-reported elapsed time. This is a real (if proportionate — no money/ranking at stake) security property for the app's first cross-user real-time feature; see `backend/README.md`'s "Realtime" section for the full reasoning.
- **`backend/data/words.json`** is a generated, deliberately duplicated slice of `src/data/words.js` (same spirit as `backend/utils/validators.js` duplicating frontend rules) — regenerate with `node backend/scripts/sync-words.mjs` whenever the word bank changes. The frontend's own `words.js` is never used for human-mode duels (only for Bot mode, which stays 100% client-side and unchanged).
- **Guest identity (`progress.displayName` in `storage.js`) is deliberately separate from Register/Login.** Duel matchmaking must keep working without an account, the same way it always could as a Bot match.
- **One screen, one state machine, two modes.** [WhoKnowsMore.jsx](src/games/WhoKnowsMore/WhoKnowsMore.jsx) owns the shared `lobby → playing → gameover` flow, scoring, and round history for **both** `mode: 'bot'` (fully client-side, unchanged) and `mode: 'human'` (driven by `useDuelSocket`). During `playing` it delegates the actual per-question UI by `(mode, selectedGameType)`: bot+Hangman → [DuelHangman](src/games/WhoKnowsMore/games/DuelHangman.jsx), bot+Memory → [DuelMemory](src/games/WhoKnowsMore/games/DuelMemory.jsx), bot+anything else (translation/trueFalse/listening/wordBuilder/sentenceBuilder/fillBlanks) → [DuelBotGame](src/games/WhoKnowsMore/games/DuelBotGame.jsx), and **every** human/online game type → [DuelOnlineGame](src/games/WhoKnowsMore/games/DuelOnlineGame.jsx). `toDisplayQuestion()` reshapes what the server sends into the same question shape the bot-mode components already expect — one JSX per game type serves both modes — and it never carries `correctAnswer`, matching the server-authority rule above.
- **`realtime/round.js` is pure on purpose.** The round lifecycle (close/score/decide winner/validate answer) was extracted out of the socket handler's closure specifically to be unit-testable — its absence is what let a double-scoring bug ship. `closeRound` is **idempotent**; without that, an answer arriving during the inter-round pause ran the close twice, double-awarding both players and silently skipping a round. `round.test.js` pins this.
- **`round:start` carries `serverNow`** so the client can measure its own clock offset ([duelClock.js](src/utils/duelClock.js)). Never compute remaining time as `deadline - Date.now()` directly: a device clock 10s fast made the timer start at zero and silently disabled every answer button.
- **Winning by forfeit pays nothing.** [`duelReward.js`](src/utils/duelReward.js) is the single place the end-of-match star bonus is decided (`win`/`tie`/`loss`/`forfeit`), and `reason === 'opponent_left'` always resolves to 0. Without this, two tabs of the same browser could queue, close one tab, and farm ~30 stars every few seconds with zero questions answered — deliberately not fixed by blocking two tabs of one IP from matching each other, since that would also break testing the duel solo.
- **The socket rate limiter keys on `socket.id`, not IP.** On Render TLS terminates at a load balancer, so `handshake.address` is identical for every visitor — an IP-keyed limit would give the whole platform one shared budget.
- **Express IP-based rate limiting (`registerLimiter`/`loginLimiter`/`presenceLimiter`/`apiLimiter` in [rateLimiters.js](backend/middleware/rateLimiters.js)) does not use `req.ip`.** [`clientIp.js`](backend/utils/clientIp.js) resolves the real client IP from `X-Forwarded-For` instead, because there are **two different topologies with two different hop counts**, measured in production, not guessed: requests via the Vercel rewrite carry 4 hops (client → Vercel → Cloudflare → Render's internal proxy), requests that hit Render directly carry 3 (Render puts Cloudflare in front of everything). A single `trust proxy` number can't serve both. The fix counts from the **right** of the `X-Forwarded-For` chain — a value a client injects is prepended on the *left*, so the position from the right stays the real client IP even when someone forges the header. **Known, accepted gap:** someone hitting Render directly (bypassing Vercel) can still forge `x-vercel-forwarded-for` plus a fake 4-hop chain and pick their own rate-limit bucket — there's no shared secret to detect this because `vercel.json` is public. This is deliberately accepted as strictly better than the prior state, where every visitor shared one global bucket and ~3 concurrent users could lock presence pings or login for the entire site.

### Presence ("how many people are online")

`GET /api/presence` + `POST /api/presence/ping` ([backend/realtime/presence.js](backend/realtime/presence.js)), consumed by [usePresence.jsx](src/hooks/usePresence.jsx) — a provider in `App.jsx`, so it works on every page.

**HTTP heartbeat, deliberately not a socket per page.** A socket from every visitor would make each Home load pay Render's ~50s cold start and keep the free instance awake 24/7 (its 750 h/month ceiling). Decisively, the heartbeat is keyed on an id *we* choose (a UUID in `localStorage`), which is the only way **two tabs of one browser count as one person** — impossible with `socket.id`, where each tab is its own connection. The socket still exists, but only on the duel screen, and it's what reports the queue size.

**Honesty rule, enforced by [presenceLabel.js](src/utils/presenceLabel.js) and pinned by a test:** a count is only ever rendered when the connection is actually healthy. Initial value is `null`, never `0`. Before this, a dead backend rendered "0 online agora" next to a pulsing green dot — indistinguishable from "server is up, nobody here", which is exactly what confused the first real test of the feature.

## Stack

React 19 + Vite 8 + react-router-dom 7. Plain JavaScript with JSX (**no TypeScript**), plain CSS (**no Tailwind, no CSS-in-JS, no component library**). Oxlint replaces ESLint.

## Architecture

### The entry screen, and what it is not

`/` no longer lands on Home for a first-time visitor: [EntryGate.jsx](src/components/EntryGate.jsx) redirects to `/welcome` ([Welcome.jsx](src/pages/Welcome.jsx)), which offers **Entrar**, **Criar conta** and a quieter **Jogar sem conta**. The choice is remembered in `englishplay_entry` via [entryChoice.js](src/utils/entryChoice.js), so the screen appears once per browser; Settings has a "Sair" that clears it (and calls `logoutRequest`, which never rejects — blocking the exit because the backend is down would trap the user inside).

**This is not authorization, and must never be mistaken for it.** Anyone can write `'account'` into that key from the console. Every game is client-side and every byte of progress is in `localStorage`, so there is nothing behind the gate to protect — it organizes the first visit, nothing more. Real session authority is the httpOnly cookie the backend signs; when progress migrates to the server, *that* is what has to authorize each read.

The guest path stays for a product reason, not a technical one: every game is client-side and works offline, so requiring an account would lock people out of something that needs no server. (It was originally also a necessity — the backend was unreachable in production — but that is fixed now; see Deploy.) Turning it into a hard gate means deleting the guest button; the rest already works.

Two things must stay in sync and therefore share one definition, `ROTAS_LIVRES` in `entryChoice.js`: the routes the gate never intercepts, and the routes [Layout.jsx](src/components/Layout/Layout.jsx) renders **without any navbar**. Drop `/welcome` from it and the gate redirects to itself forever; drop `/login` and the login page becomes unreachable for exactly the people who need it. `deveMandarParaWelcome` is pure and its tests pin the redirect loop — the failure mode here throws nothing, it just hangs.

`Welcome` is deliberately **not** lazy: a first-time visitor is redirected to it during the very first paint, and a separate chunk would add a round trip to the first impression.

### Routes are code-split; failures have a floor

Every route in [App.jsx](src/App.jsx) except `Home` is `React.lazy`. This took the initial payload from one 615 kB chunk (182 kB gzip) to 374 kB (120 kB gzip) plus per-route chunks — `socket.io-client` (~40 kB, duel only) and the 18 conversation graphs (~72 kB) no longer load for someone who just opens the home page. **Keep the `import()` inline inside `lazy()`**; hoisting it to a variable first makes Rollup lose the static reference and re-bundle everything.

`words.js` (34 kB gzip) is *not* splittable and stays in the main chunk: `main.jsx` → `storage.js` → `wordKey.js` → `words.js`, because `migrateStats` runs before the first render. Making `Home` stop importing the bank was tried and measured — it changed nothing, since the chain survives. Don't retry it without breaking that chain first.

[ErrorBoundary.jsx](src/components/ErrorBoundary/ErrorBoundary.jsx) sits in two places: inside `Layout` (so a broken screen keeps the navbar and the user can navigate away) and around `<App />` in `main.jsx` (for anything above the Layout, e.g. `ProgressProvider`). Splitting the routes created a failure mode that didn't exist before — a stale chunk hash after a deploy — so the boundary auto-reloads **once**, guarded by a `sessionStorage` flag, and only when [chunkError.js](src/utils/chunkError.js) classifies the error as a load failure. That classifier is pure and pinned by tests against the real message each browser produces; a false positive would reload on top of a code bug and hide it.

### State flows through exactly one place

`src/hooks/useProgress.jsx` is a React Context provider wrapping the whole app in [App.jsx](src/App.jsx). It owns the single `progress` object and is the **only** module that mutates it. Games and pages call its action functions (`handleCorrectAnswer`, `handleWrongAnswer`, `completeGame`, `addPoints`, `buyShopItem`, `consumeHint`, …) and never touch `localStorage` for progress themselves.

The provider auto-persists on every `progress` change via a `useEffect`, and every mutation runs through `checkAchievements`, which evaluates the declarative `condition(progress)` predicates in [achievements.js](src/data/achievements.js) and fires a toast. Because of this, **a new achievement is added by appending one object to that array** — no other wiring needed.

`Layout` reads `newAchievement` and `scorePopup` off the same context to render the global toast and the floating `+N` points popup.

**Do not add `progress` to the dependency array of an action callback.** Every game's "you finished" `useEffect` lists `completeGame` in its own deps (e.g. [MemoryGame.jsx:92](src/games/MemoryGame/MemoryGame.jsx#L92)), so an action whose identity changes when progress changes re-triggers that effect, which calls the action again — an infinite loop. Actions that need to read current progress do it through `progressRef.current`, which keeps their identity stable across renders.

### Persistence

[storage.js](src/utils/storage.js) owns two keys: `englishplay_progress` and `englishplay_settings`. Both loaders spread the stored blob over a `defaultProgress` / `defaultSettings` object, so **adding a new progress field means adding it to `defaultProgress`** — existing users' saved data will pick up the default automatically. Reads are try/catch-wrapped and fall back to defaults, so a corrupt blob degrades instead of crashing.

`loadProgress` also runs `migrateStats`, which re-buckets a legacy `wordStats` into canonical `wordStats` + `phraseStats` and merges duplicate spellings. Migrations here **must be idempotent** — this one re-runs on every single load.

Settings are read ad-hoc (`loadSettings()` called inside `useSound`/`useSpeech`/`WordExplanation`), not through context. `loadSettings` also migrates the legacy misspelled `autoPronouce` key onto `autoPronounce` and drops a dead `theme` key — the pattern to copy if another settings field ever gets renamed.

### The progress domain logic lives in `src/utils/`

- **`scoring.js`** — point values. Design rule stated in the file: *scoring never subtracts points*. Wrong answers cost nothing; they only break the streak.
- **`wordKey.js`** — resolves any raw string a game hands in to the **canonical `word.en`** from the bank, or `null` if it isn't vocabulary. Games pass what they have (`"Good morning!"`, `"blue"`, `"I am happy."`), and without this they fragment into separate progress entries.
- **`reviewSystem.js`** — `recordWordResult(progress, rawKey, isCorrect)` routes through `wordKey`: real vocabulary lands in `progress.wordStats` under the canonical spelling, everything else (sentences, fill-in-the-blank answers) in `progress.phraseStats`. Only `wordStats` feeds `wordsStudied`/`wordsLearned`, so phrases can't inflate the level. It updates streaks and a 100-entry `errorHistory`, and a word counts as learned after `LEARNED_THRESHOLD` (3) correct answers across at least 2 different days. **The function is pure** — it must never mutate `progress` or anything nested in it, or StrictMode's double-invoked updater duplicates every entry.
- **`levelSystem.js`** — level is *derived*, never stored as truth: computed from `wordsStudied` against the `levels` array exported by [categories.js](src/data/categories.js). `wordsNeeded` counts distinct **vocabulary** words, so the top threshold must stay ≤ the size of the word bank — a test pins this.
- **`dailyChallenge.js`** — deterministic. Seeds a small LCG from the calendar date so every user gets the same challenge on a given day and it is reproducible across reloads. **Everything the user sees — the target word *and* its four options — is decided here, never in the component's render.** A `shuffleArray` call inside a render body re-randomizes on every re-render, which visibly swaps the answer options out from under the user the instant they click. Use `seededShuffle`/`buildOptions`, not `Math.random`, and note that `sort(() => rng() - 0.5)` is not a valid shuffle — the module uses Fisher-Yates.

### Content is data, not code

`src/data/` is the whole curriculum. Adding vocabulary or exercises requires no component changes:

- **`words.js`** — the canonical word bank. Every entry is `{ en, pt, category, pronunciation, example, examplePt, level, tip }`. `pronunciation` is a *Portuguese phonetic approximation* (e.g. `"Hello"` → `"rélou"`), not IPA. Also exports the shared `shuffleArray` helper that nearly every game imports.
- **`sentences.js`** — four separate datasets for four different games: `sentences` (SentenceBuilder), `fillBlanks`, `trueFalse`, `translationQuizzes`.
- **`conversations.js`** — 18 dialogues as **node graphs**, not linear scripts (see below).
- **`errorPatterns.js`** — declarative table of Portuguese-speaker mistakes, consumed by `answerCheck.js`. Adding a correction is appending one object; the regexes run against the *normalized* string (lowercase, no punctuation, contractions expanded), so a pattern written with `I'm` will never match.
- **`categories.js`** — categories plus the level ladder (`wordsNeeded` thresholds).
- **`gamesCatalog.js`** — the 9 games' identity (`id`, `name`, `icon`, `color`, `path`, `desc`, `descLong`), consumed by both Home and Games. It exists because those two screens each had their own copy and the copies had **drifted**: Memory was indigo on Home and purple on Games, Hangman red on one and blue on the other — the same game changed colour depending on where you came from. `color` is deliberately *not* a theme token (Hangman stays red in all 5 themes); the icon background is derived from it by the exported `halo()`, which is why no solid pastel is stored. `id` must match a `defaultProgress.gamesCompleted` key — `gamesCatalog.test.js` pins that, plus unique ids/paths and the 6-digit hex `halo()` depends on.

#### Conversation graphs

```js
{ id, topic, topicPt, icon, level, start: 'nodeId', nodes: { [id]: node } }
node  = { text, translation, replies: [] }        // replies: [] ends the dialogue
reply = { text, translation, next, accepts?: [] } // next = id of the following node
```

`next` is what makes branching real — an earlier version advanced by `messageIndex + 2` regardless of the choice, so every replay was identical. **`accepts` belongs to the reply, not the node**: a typed paraphrase then follows the same branch as the option it matches. On the node there would be no way to know which `next` to take.

`data.test.js` pins graph integrity — every `next` resolves, every node is reachable from `start`, every conversation reaches a terminal node, and every topic branches somewhere. A typo'd `next` breaks nothing at build time and just strands the player mid-dialogue, which is exactly why those tests exist.

#### Answer checking

[answerCheck.js](src/utils/answerCheck.js) validates typed replies. There is no backend and the CSP forbids a grammar API, so it does **not** parse arbitrary English — it compares against the replies that are valid *at that node*, which is both tractable and more accurate. Pipeline: normalize → exact match → typo (`quase`) → `errorPatterns` → word-level diff → "not recognized". It is pure and node-testable.

Two invariants: unrecognized input must **never** resolve to a reply (the old code did `handleResponse(match || currentOptions[0])`, silently scoring anything as the first option — a test pins this), and a wrong answer never blocks progress, matching `scoring.js`'s "never subtract" rule.

`category` values in `words.js` must match a `categories` id, and `level` gates which words a game will draw (games filter with e.g. `words.filter(w => w.level <= 4)`).

### Game components

One folder per game under `src/games/<Name>/` containing `<Name>.jsx` + `<Name>.css`, registered as a flat route in [App.jsx](src/App.jsx). Each game is fully self-contained and follows the same shape:

1. Local `useState` for all game state (no shared game state exists).
2. Early-return screens rather than a router: difficulty/setup select → play → result. See [MemoryGame.jsx](src/games/MemoryGame/MemoryGame.jsx) as the reference implementation.
3. Pulls actions from `useProgress()` and sounds from `useSound()`.
4. Renders the shared [WordExplanation](src/components/Game/WordExplanation.jsx) component in a modal after a correct answer — this is the actual teaching moment (translation, pronunciation, example sentence, tip, TTS buttons).
5. Calls `completeGame('<key>')` on finish.

**The `completeGame` key must match a key in `defaultProgress.gamesCompleted`** in `storage.js` — achievements like `memory_master` read `gamesCompleted.memory` directly. A typo silently produces a new counter that no achievement will ever see.

`DailyChallenge` and `ReviewErrors` are pages, not games: they re-implement lightweight inline exercises against the same `useProgress` actions rather than reusing the game components. Because they hand-roll their own answer checking, watch the types: `handleCorrectAnswer`/`handleWrongAnswer` take the **word string**, while option comparisons happen between **word objects**. Mixing the two silently scores every answer as wrong.

### Audio

Both audio hooks check `loadSettings().soundEnabled` before doing anything and swallow errors so unsupported browsers degrade silently.

- **`useSound.js`** synthesizes every sound effect with the Web Audio API — oscillators and gain ramps, no audio files in the repo. Add new effects as tone sequences, don't add asset files.
- **`useSpeech.js`** wraps `window.speechSynthesis` for pronunciation, handling the async `voiceschanged` voice loading. Exposes `speakNormal` and `speakSlow` (rate 0.35, for learners).

### Styling

[index.css](src/index.css) holds the design tokens (`--space-*`, `--fs-*`, `--accent-*`, `--shadow-*`, gradients) and the global component classes: `.page`, `.container`, `.card`, `.btn` + variants, `.badge-*`, `.progress-bar`, `.modal-overlay`, `.game-header`, `.animate-*`. Component-specific CSS sits beside its `.jsx` and is imported directly by it.

Use the tokens rather than hardcoded values — but note the codebase mixes global classes with heavy inline `style={{ ... }}` for one-off layout, which is the established (if not ideal) convention.

**A hardcoded colour is a dark-theme bug, not a style nit.** Only `[data-theme="dark"]` overrides the `--bg-*-subtle` family (ocean/forest/sunset are light themes that re-tint accents on white cards), so a literal pastel renders as a bright block on a dark card while everything around it flips. Every instance found has been converted; `--border-orange` and `--border-red` exist precisely because two tip panels had `#fed7aa`/`#fecaca` borders sitting on a background that *did* flip. `--focus-ring` is declared twice on purpose — a plain rgba fallback, then a `color-mix()` off `--accent-primary` so the ring follows each theme's accent instead of staying indigo inside a cyan theme.

Shared page furniture, added because it had already drifted:

- **`.page-header`** (+ `.page-header--center`, `.page-back`) — the header of the non-game screens. It was the same inline-styled block copy-pasted into 4 pages, and the copies had diverged on bottom margin. Screens with a bottom-nav entry (`/games`) get no back link; screens without one (Shop, Achievements) do.
- **`.spinner` / `.spinner-lg`, `.pulse-dot`, `.tf-true` / `.tf-false`** — primitives used by more than one screen. `.tf-true`/`.tf-false` used to live in `TrueFalse.css` and worked in WhoKnowsMore only because both files land in the same bundle.
- **`button:focus-visible` / `a:focus-visible`** — there was no keyboard focus style anywhere except inputs, and the games are played entirely with `<button>`. `:focus-visible`, not `:focus`, so it doesn't fire on mouse clicks. Don't add `border-radius` to that rule; the outline already follows each element's own radius, and forcing one makes pill buttons jump on focus.

`.glass-card` is the shared elevated surface (background, border, radius, shadow) used by ~15 files. It deliberately sets **no padding**: callers either pair it with a component class that pads (`.tf-card`, `.difficulty-card`, `.tq-option`) or pass inline padding.

**Navbar/bottom-nav icons are PNGs in `public/`, not emoji.** [Layout.jsx](src/components/Layout/Layout.jsx) renders `/inicio.png`, `/jogos.png`, `/historias.png`, `/conquistas.png`, `/loja.png` as `<img>` tags (inline-sized via `style`, not CSS classes) for the desktop navbar, mobile bottom nav, and the FAB. `⚡ Desafio` is the one nav entry still on an emoji — match whichever convention the surrounding items already use rather than mixing both in one nav row.

Fonts are loaded **only** by the `<link>` in [index.html](index.html) — Inter (`--font-body`), Space Grotesk (`--font-heading`), JetBrains Mono (`--font-mono`). Don't add a CSS `@import` for fonts; it misses the preconnect and duplicates requests.

Because `main.jsx` imports `App` before `./index.css`, **`index.css` lands last in the CSS bundle** and wins ties against component CSS at equal specificity. Avoid relying on that: give component rules higher specificity rather than counting on order.

### Appearance: themes and animations

[appearance.js](src/utils/appearance.js) is the only module that touches the document for styling. It sets `data-theme` and `data-animations` on `<html>` and keeps the `theme-color` meta tag in sync.

- **Themes** — token overrides under `[data-theme="ocean"|"forest"|"sunset"|"dark"]` in `index.css`. Since every component reads the tokens, **a new theme is a new CSS block plus one entry in `THEMES`** — no component changes. The id must match the Shop item id minus the `theme_` prefix. State lives in `progress.selectedTheme`; the Shop sets it on purchase and Settings switches between owned themes.
- **Animations** — the Settings toggle sets `data-animations="off"`, which collapses all animation/transition durations. The OS `prefers-reduced-motion` setting is honoured unconditionally.

Both are applied in `main.jsx` before the first render to avoid a flash of the wrong theme; after that the `ProgressProvider` keeps the theme in sync.

### Shop

Inventory is defined inline in [Shop.jsx](src/pages/Shop.jsx), not in `src/data/`. Item `type` drives the effect in `buyShopItem`, and **every type is wired** — adding an item with a `type` no branch handles means charging the player for nothing:

- `hints` → `hintsAvailable`, consumed by HangmanGame/WordBuilder.
- `avatar` → navbar. `theme` → see above.
- `multiplier` → sets `pointsMultiplier` for `multiplierGames` rounds; `completeGame` applies it, decrements, and resets to 1 when exhausted.
- `timer` → `extraTimeAvailable`, which counts **uses of +10s**, not seconds. The conversion is the `EXTRA_TIME_SECONDS` export in `useProgress.jsx`; `consumeExtraTime()` spends one use and returns the seconds to add.
- `effect` → stores nothing beyond the id in `shopItems`. `dispararCelebracao(tipo)` in the provider checks ownership by that exact id, so **`confetti`/`fireworks` ids must not be renamed** or the effect silently stops firing.

Celebrations are global, like the achievement toast: the provider owns `celebration` state, `handleCorrectAnswer` fires `confetti` and `completeGame` fires `fireworks`, and `Layout` renders [Celebration](src/components/Celebration/Celebration.jsx) with `key={celebration.id}` — the remount is what re-randomizes the particles, so don't swap it for a plain prop. The effect is CSS/DOM only (the CSP forbids a CDN library), sits at `z-index: 260` with `pointer-events: none`, and hides itself under `data-animations="off"` and `prefers-reduced-motion`.

Pricing is calibrated against `scoring.js`: a round yields roughly 200 stars, so items run 200–750. The 15-hint pack must stay cheaper *per hint* than the 5-pack.

**TrueFalse is the only game with a clock.** Its mode-select screen offers "Tranquilo" and "Contra o Relógio" (75s for 12 rounds); the timer pauses while feedback/`WordExplanation` is on screen so reading the teaching moment costs nothing, and the `+10s` button spends `extraTimeAvailable`. Running out of time does **not** call `completeGame` — that would hand out the 50-point phase bonus for idling 75 seconds.
