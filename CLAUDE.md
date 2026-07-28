# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**EnglishPlay** — a free browser game platform that teaches English to Brazilian Portuguese speakers. No login, no signup, no backend: it is a purely client-side SPA and *all* user state lives in `localStorage`.

The entire UI is written in **Portuguese (pt-BR)**. English text only ever appears as learning content (the words/sentences being taught). Keep new UI strings in Portuguese.

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
- **`conversations.js`** — branching dialogue scripts of alternating `system`/`user` message objects.
- **`categories.js`** — categories plus the level ladder (`wordsNeeded` thresholds).

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

Inventory is defined inline in [Shop.jsx](src/pages/Shop.jsx), not in `src/data/`. Item `type` drives the effect in `buyShopItem`: `hints` (consumed by HangmanGame/WordBuilder), `avatar` (navbar), `theme` (see above), and `multiplier` — which sets `pointsMultiplier` for `multiplierGames` rounds. `completeGame` applies the multiplier, decrements the counter, and resets it to 1 when exhausted.

`extra_time` (type `timer`) and the `confetti`/`fireworks` items (type `effect`) are still sold but have no implementation — the item descriptions say as much for `extra_time` ("futuro"), the two celebration effects do not.
