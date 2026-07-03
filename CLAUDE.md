# CLAUDE.md — STROPHE

Project context Claude Code should have loaded before doing anything
here. Full architecture rationale lives in `TECHNICAL_SPEC.md` (§-numbered
sections referenced below) — this file is the operational summary, that
one is the "why".

## What this is

STROPHE ("The Turning Point") — a personal, single-user self-mastery PWA
for Sjupa. Not a game. Dark/gold, serious, premium visual register — see
`src/index.css` for the token system, do not introduce playful/childish UI
patterns (confetti, cartoon mascots, exclamation-heavy copy).

Design source of truth for product content (level copy, feature list,
onboarding flow, data-collection rules): `DESIGN_STROPHE.md` if present
in this repo, otherwise the design conversation this project was handed
off from. `TECHNICAL_SPEC.md` is the source of truth for architecture.

## Current state (Phase 1 — complete)

- Core engine: `src/engine/*` — Level, Mental Score, Growth Index, Memory
  Vault. Pure functions, fully unit tested (39 tests). **Do not modify
  the Level/Mental Score rules without re-reading TECHNICAL_SPEC.md §2
  first** — the three-number separation (`currentLevel` /
  `mentalScore` / `growthIndexHistory`) is deliberate and has already
  been debugged once (see the "no `missedDaysStreak` field" note in §3).
- Storage: `src/storage/db.ts`, IndexedDB via `idb`, tested.
- AI Coach: `src/coach/*` — prompt templates + a tested API client.
  Connectivity is provable today via Settings → "Simpan & Tes Koneksi".
  **Not yet wired into the actual session flow for level 6+** — that's
  the first Phase 2 task below.
- UI: Onboarding → Dashboard → SessionRunner → Settings, all functional,
  `npm run build` and `npm test` both green.
- PWA: installable, offline app-shell via `vite-plugin-pwa`. See
  TECHNICAL_SPEC.md §6 for the honest limitation on notification timing
  reliability on Android — don't "fix" this by overpromising in UI copy.

Run `npm test` before and after any change. All 48 tests passing is the
floor, not the goal — if a change legitimately requires changing expected
behavior, update the test to assert the new correct behavior explicitly
(with a comment saying why), never delete a test to make a failure go
away.

## Phase 2 — next up, in priority order

1. **Wire the Content Generation Engine into `SessionRunner.tsx` for
   level 6+.** Today it silently falls back to reusing Level 5's content
   (see `content/coreSessionLevels.ts#getLevelContent`'s comment). Replace
   that fallback with real calls to `coach/promptTemplates.ts`'s
   functions through `coach/client.ts#callCoach`. Needs: a loading state
   while the API call is in flight, an error state if no API key is
   configured yet (link to Settings), and a JSON-parsing layer for
   `instingScenarioPrompt`'s structured response (it's prompted to return
   JSON-only — parse defensively, the model can still occasionally wrap
   it in prose despite instructions).
2. **Skill Rotation tracks** — `dayaIngat` is the only one with real
   content (`engine/memoryVault.ts` + needs a UI screen, which doesn't
   exist yet either — Dashboard currently only surfaces the Core
   Session). Add `englishShadow`, `publicSpeaking`, `kesehatan`,
   `keuangan` per the original design doc's weekly unlock schedule
   (`TECHNICAL_SPEC.md` doesn't restate this — it's in the design doc's
   §A2 week-by-week table).
3. **Reflection Level, Brutal Honesty Report, Kompas 5 Tahun check** as
   real scheduled UI moments (every 10 / 7 / 20 levels respectively) —
   the prompt templates exist, the triggering logic and screens don't
   yet.

## Phase 3+

Diamond Tier UI, Global Mentor persona switcher, Real-Life
Mission/Zona Nyaman Breaker scheduling, Voice Confidence Check (Web
Speech API — text-transcript-only per TECHNICAL_SPEC.md §4.4, never claim
tone/pitch analysis in UI copy). Full list in `TECHNICAL_SPEC.md` §9.

Akademi Analisis Saham (the stock-analysis module) is a separate, later
vertical slice — don't start it before Phase 2/3 of the main app are
reasonably solid, and when it's started, give it its own content data
file following `content/coreSessionLevels.ts`'s pattern rather than
overloading the existing one.

## Hard constraints — do not relax these while extending the app

- **Anti-hallucination rules are system-prompt text, not app-logic
  guesses** — see `coach/promptTemplates.ts`'s `BASE_RULES` and the
  `financeGuidancePrompt` / `healthGuidancePrompt` functions specifically.
  Any new prompt template touching health, finance, or real-world
  factual data must include the same "don't fabricate, ask the user for
  real data instead" instruction. This mirrors the original design
  brief's explicit ⚠️-flagged rule and is not optional polish.
- **Never claim Voice Confidence Check measures vocal tone/pitch** — see
  TECHNICAL_SPEC.md §4.4. It reads a text transcript. Full stop.
- **Never store the Anthropic API key anywhere but IndexedDB via
  `apiKeyStore`**, and never let it leak into a bundled build (no
  `import.meta.env.VITE_ANTHROPIC_API_KEY` — that WOULD get inlined into
  the public JS bundle, which is exactly the mistake this design
  deliberately avoided; keep it that way). See TECHNICAL_SPEC.md §4.2 for
  when this whole approach needs to be replaced with a server proxy
  (short answer: the moment more than one person uses this app).
- **`resetAllData()` in `storage/db.ts` stays unwired from the UI** unless
  a proper confirm-twice flow is built for it. It exists for tests only.
- **Ibadah is finalized for Islam, not a multi-faith toggle** — this was
  an explicit, deliberate product decision (personal use, not a public
  product), don't "generalize" it back to a religion picker without being
  asked.
- Keep responses/copy in **Bahasa Indonesia**, simple enough to explain a
  new concept to someone hearing it for the first time — this is a
  product requirement from the original design brief (`Auto-Simplifier`
  philosophy), not just a style preference.

## Commands

```bash
npm install       # first-time setup
npm run dev        # local dev server
npm test            # watch mode
npm run test:run    # single run (use this in CI / before committing)
npm run build       # type-check (tsc -b) + production build + PWA manifest/SW
npx oxlint           # lint
```
