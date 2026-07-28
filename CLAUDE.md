# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**EnglishPlay** — a free browser game platform that teaches English to Brazilian Portuguese speakers. No login, no signup, no backend: it is a purely client-side SPA and *all* user state lives in `localStorage`.

The UI is written in **Portuguese (pt-BR)**. English text only ever appears as learning content (the words/sentences being taught). Keep new UI strings in Portuguese.

**One deliberate exception:** the Conversation screen ([Conversation.jsx](src/pages/Conversation.jsx)) has its chrome in English — the user asked for an immersive practice screen. Grammar corrections there stay in Portuguese, because explaining a mistake in English to someone who cannot yet read English teaches nothing. Don't "fix" either half by making the screen consistent.

Despite the repo name `saas_ingles`, there is no server, no auth, no payments, and no multi-tenancy.

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

## Security

[vercel.json](vercel.json) also sets the security headers. Constraints worth knowing before you change things:

- **CSP is `default-src 'self'`.** No third-party origin may be added without a matching directive — that's deliberate. If you find yourself adding a CDN, self-host it instead.
- **Fonts are self-hosted** in `public/fonts` (variable woff2, generated into [src/fonts.css](src/fonts.css)). Do **not** point back at `fonts.googleapis.com`: it re-adds a third party to the critical path, leaks every visitor's IP to Google (LGPD), and the CSP would block it anyway.
- **`style-src` still needs `'unsafe-inline'`** because the codebase uses `style={{ ... }}` heavily, which emits `style` attributes. That is the one real weakness left in the CSP; moving those inline styles to classes would let it go.
- **`frame-ancestors 'none'` + `X-Frame-Options: DENY`** — the site cannot be embedded. Verified against production.
- **`localStorage` is treated as untrusted input.** `loadProgress`/`loadSettings` coerce types, clamp ranges, drop over-long keys and ignore `__proto__`. Keep it that way, and note what it does *not* do: it is not authorization. **When accounts land, the server must re-validate everything** — never let a client-supplied score or entitlement be trusted.
- **Known advisory:** `react-router` 7.18.1 carries GHSA-qwww-vcr4-c8h2 (RSC-mode CSRF bypass). Not exploitable here — no RSC, no data router, no actions/loaders — and no fixed release exists yet (npm's suggested "fix" is a downgrade to 7.11.0; don't). Re-assess before adding a server.

Dependabot ([.github/dependabot.yml](.github/dependabot.yml)) opens weekly dependency PRs and immediate security ones.

## Stack

React 19 + Vite 8 + react-router-dom 7. Plain JavaScript with JSX (**no TypeScript**), plain CSS (**no Tailwind, no CSS-in-JS, no component library**). Oxlint replaces ESLint.

## Architecture

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

`.glass-card` is the shared elevated surface (background, border, radius, shadow) used by ~15 files. It deliberately sets **no padding**: callers either pair it with a component class that pads (`.tf-card`, `.difficulty-card`, `.tq-option`) or pass inline padding.

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
