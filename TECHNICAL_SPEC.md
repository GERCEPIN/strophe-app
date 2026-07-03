# STROPHE — Technical Specification

This is the architecture reference the code comments point back to
(`§2`, `§4`, etc.). Read this once before making structural changes;
day-to-day work should mostly need `CLAUDE.md` instead.

---

## §1. Tech stack decision, and why

**PWA (Vite + React + TypeScript), installed to the Android home screen —
not a native Android Studio / Gradle project, not Expo/React Native.**

Reasoning, given the actual constraint ("build lewat Claude Code di
Android"):

- Wherever Claude Code is running for this project — the web/mobile Code
  session, Remote Control to a home computer, or Termux directly on the
  phone — **none of those environments can be assumed to have the Android
  SDK, an emulator, or Gradle available.** A cloud sandbox definitely
  doesn't. Termux realistically can't run Android Studio. A PWA needs
  none of that: Node + a browser is the entire toolchain.
- The feature set (daily check-ins, timers, text/voice input, local
  notifications, offline content) does not need deep native integration.
  The one place it brushes up against a real web-platform limitation is
  precise-time notifications — addressed head-on in §6, not hidden.
- Iteration speed matters more here than app-store polish: this is a
  personal tool, not something being published to Google Play.
- Upgrade path if reliable native notifications become a hard requirement
  later: wrap this same codebase with **Capacitor** (`npx cap add
  android`), which gets you the OS-level `AlarmManager` for local
  notifications while reusing ~100% of the existing UI code. That's a
  deliberate escape hatch, not a rewrite — don't reach for it until §6's
  mitigations prove insufficient in practice.

**Storage:** IndexedDB (via the `idb` package), 100% on-device. No backend
server exists or is needed for a single-user personal app — see §5.

**AI:** the user's own Anthropic API key, entered once in Settings, used
to call the Claude API directly from the browser — see §4.2 for the
security tradeoff this implies and when to stop doing it.

---

## §2. The Level Engine — three numbers that must never merge into one

This is the single most important piece of business logic in the app,
and the one most likely to be re-broken by a well-intentioned refactor if
its rules aren't kept explicit. It was already fully specified and tested
before any UI was written — see `src/engine/level.ts`,
`src/engine/mentalScore.ts`, `src/engine/dailyTransition.ts`, and their
`.test.ts` files (39 tests across the three, all passing).

### The rule, precisely

1. Completing today's Core Session advances `currentLevel` by **exactly
   +1**, regardless of performance quality within the session. Quality
   affects Mental Score and Growth Index — never the level number.
2. **Max +1 level per calendar day**, no matter how many times the
   session is (re-)opened or completed that day.
3. A fully missed day **freezes** the level. It does **not** reset to 1
   and does **not** jump forward to "catch up" once the user returns.
4. Missed days affect **Mental Score only**, never `currentLevel`
   directly.

### Why three separate fields, not one score

- `currentLevel` — a pure attendance counter. Answers "how many days has
  this person shown up."
- `mentalScore` (0-100) — a resilience/consistency signal. Decays on
  missed days, recovers slowly on consecutive active days. Answers "how
  fragile is their current streak."
- `growthIndexHistory` (weekly snapshots, see §2.2) — the only one of the
  three that measures whether the person is actually **changing**, not
  just showing up.

Collapsing these into one number was the single biggest ambiguity in the
original brief. Keeping them separate is what makes the dashboard's
honest "Level naik terus, Growth Index stagnan" callout possible at all
— see `engine/growthIndex.ts#detectStagnationGap`.

### Worked example (this exact sequence is a passing test —
`engine/dailyTransition.test.ts`)

| Day | Action | Level | Mental Score |
|---|---|---|---|
| Senin | active, session quality irrelevant | 1 | 100 |
| Selasa | active | 2 | 100 (capped) |
| Rabu | missed | — | (unrealized until next open) |
| Kamis | missed | — | (unrealized until next open) |
| Jumat | active, returns after 2 missed days | 3 (+1 only) | 78 (100 −10 −12) |
| Sabtu | active, consecutive day | 4 | 86 (+8) |

Note the asymmetry: decay is front-loaded (worse each consecutive missed
day, capped at −25/day so a long absence is never mathematically
unrecoverable — see `mentalScore.ts#decayForMissedDay`), recovery is flat
and slow (+8/day), and recovery only starts the day **after** a return,
never on the return day itself. This was a deliberate design choice made
while implementing §2, not an oversight — see the inline comment in
`dailyTransition.ts` for the exact branching logic.

### §2.2 Growth Index

A weighted composite (`engine/growthIndex.ts`) of six independently
tracked signals: Insting speed+accuracy, Ketelitian accuracy, Memory
Vault recall trend, Decision Journal quality (reaktif → deliberatif
shift, AI-tagged), Brutal Honesty Report "shrinkage" (are the same
weaknesses still repeating), and Kompas 5 Tahun alignment percentage.
Weights are named constants (`GROWTH_INDEX_WEIGHTS`) and the module
throws at import time if they don't sum to 1.0 — a cheap guard against a
future edit silently unbalancing the score.

### §2.3 Memory Vault (spaced repetition)

A 5-box Leitner scheduler (`engine/memoryVault.ts`). Correct recall
promotes an item to a longer interval (1 → 3 → 7 → 14 → 30 days);
incorrect recall sends it straight back to box 1. This is the concrete
mechanism behind "materi lama muncul ulang acak" from the original
brief — no randomness needed, the box intervals do the work.

---

## §3. Data schema

Single source of truth: `src/types/index.ts`. Every persisted entity is
defined there as a plain TypeScript interface — read that file directly
rather than duplicating it here where it will drift out of sync. Key
design choices worth calling out:

- All dates are `YYYY-MM-DD` local-calendar strings, never epoch
  timestamps, because the Level Engine's rules are calendar-day rules,
  not 24-hour-window rules (opening the app at 11pm and again at 1am is
  two different calendar days, correctly, even though only 2 hours
  passed).
- `FinanceSettings.incomeRangeMonthly` is a bucketed range, never an
  exact figure — a privacy default carried over from the original design
  doc, not something to "simplify" later by switching to a raw number.
- `ProgressState` intentionally has no `missedDaysStreak` field. It was
  in an earlier draft of this spec and was removed once `lastAdvancedDate`
  was recognized as sufficient to recompute any gap on demand — see the
  git history / this section if a future refactor is tempted to
  re-introduce a redundant running counter. Don't; it's a source of
  state-drift bugs waiting to happen, and `daysBetween()` is cheap.

---

## §4. The Content Generation Engine (how "level tanpa batas" is actually possible)

Levels 1-5 of the Core Session are hand-authored
(`src/content/coreSessionLevels.ts`), mirroring the original design
doc's §A3 exactly — onboarding needs to be controlled and predictable,
not left to a model's improvisation on day one.

**From level 6 onward, static content stops scaling.** Nobody is going to
hand-write thousands of levels, and hard-coding a "level % 5" repeat
would be obviously stale by level 40. The actual mechanism is: **each
station's content is generated on demand by calling Claude**, using one
of the structured prompts in `src/coach/promptTemplates.ts`
(`instingScenarioPrompt`, `brutalHonestyReportPrompt`,
`reflectionLevelPrompt`, `globalMentorSystemPrompt`, `voiceFeedbackPrompt`,
`financeGuidancePrompt`, `healthGuidancePrompt`).

This was a genuine gap in the original design brief — it specified
example content for levels 1-5 and features like Brutal Honesty Report
and Global Mentor Rotation, but never specified the mechanism that
produces content at level 847. The Content Generation Engine is that
mechanism, made concrete and (for the connectivity path) tested — see
`coach/client.test.ts`.

**Current status:** the prompt templates and the API client are written
and tested (`coach/client.ts`, 5 passing tests with a mocked `fetch`).
`Settings.tsx` includes a live "Simpan & Tes Koneksi" button that proves
end-to-end connectivity against the real Anthropic API once a key is
entered. **Wiring these prompts into `SessionRunner.tsx` for level 6+ is
Phase 2** — see `CLAUDE.md`. Today, level 6+ falls back to reusing the
Level 5 content pattern (`content/coreSessionLevels.ts#getLevelContent`),
which is explicitly commented as a placeholder, not a silent gap.

### §4.1 Hallucination guardrails, encoded as system-prompt text

Every prompt template's `BASE_RULES` constant hard-codes the original
brief's "LARANGAN HALUSINASI" / "KLAIM JUJUR" rules directly into the
system prompt sent to the model, rather than hoping the app's own logic
catches a fabrication after the fact:

- Never invent real-time factual data (prices, statistics, schedules).
- Never promise unrealistic outcomes ("100x smarter").
- `financeGuidancePrompt` / `healthGuidancePrompt` additionally forbid
  answering without user-provided data, matching the original brief's
  ⚠️-flagged features exactly.

### §4.2 API key handling — the tradeoff, stated plainly

The Anthropic API key lives in `IndexedDB` (`storage/db.ts#apiKeyStore`)
and is sent only to `https://api.anthropic.com`, using the
`anthropic-dangerous-direct-browser-access: true` CORS header that
Anthropic added specifically for "bring your own key" client-side apps
like this one.

**This is a reasonable risk for a personal, single-user install on your
own phone. It stops being reasonable the moment this codebase is
deployed somewhere public, open-sourced with the key still in a build, or
shared with anyone else.** At that point, replace `coach/client.ts`'s
direct `fetch` with a call to a small server-side proxy that holds the
key instead, and delete the key from client storage entirely. Do not
skip that step if this ever changes from "just Sjupa" to "more than one
person" — this note exists so that future-you (or a future Claude Code
session working from a stale mental model) doesn't skip it by accident.

### §4.4 What "Voice Confidence Check" can and can't actually measure

The original brief describes Voice Confidence Check as evaluating
"kelancaran & ketegasan nada" (fluency and tone assertiveness). **Claude
cannot analyze true vocal pitch/tone from audio.** `voiceFeedbackPrompt`
only ever receives a **text transcript** (from the on-device Web Speech
API) plus JS-computed pacing metrics (words/minute, filler-word count)
— never raw audio.

This is a deliberate, honest scope correction, not an oversight: the UI
copy for this feature must say "kejelasan & struktur bicara" (clarity and
structure), never "penilaian nada" (tone assessment) — see the doc
comment directly above `voiceFeedbackPrompt` in the source. Claiming to
measure something the architecture structurally can't is exactly the
kind of thing the original brief's own anti-hallucination rules exist to
prevent, and that applies to the app's own feature claims, not just the
AI Coach's factual claims.

---

## §5. Storage & data flow

Everything lives on-device in IndexedDB (`src/storage/db.ts`). There is
no backend server, no sync, no account system — this is correct for a
single-user personal app and should not be "upgraded" to a server without
a real reason (multi-device sync being the most likely one). The only
network calls the app ever makes are explicit AI Coach requests, which
send only the specific context that one request needs (e.g. this week's
log summary for a Brutal Honesty Report), never a dump of the whole
database.

`resetAllData()` exists for tests and local dev only — it is deliberately
not wired to any UI button, so a stray tap can't wipe months of progress.
If a "reset my data" feature is ever wanted, it needs its own explicit,
hard-to-misfire confirmation flow — don't just expose the existing
function.

---

## §6. Notification reliability — the one real platform limitation

A PWA on Android **cannot guarantee precise-time notifications** the way
a native app's `AlarmManager` can. Chrome's Notification Triggers API
(`showTrigger` / `TimestampTrigger`) exists in some Chrome versions, but
its support has been inconsistent over the years, is Chromium-only (not
Firefox, not every Android browser), and even Chrome's own historical
issue tracker documents real complaints about Android's Doze mode
delaying or suppressing delivery regardless.

`src/notifications.ts` reflects this honestly:

- It **feature-detects** `TimestampTrigger` and returns `false` cleanly
  if it isn't available — nothing pretends the scheduling succeeded when
  it didn't.
- It never promises reliability in any UI copy (`Settings.tsx`'s copy
  says "usaha terbaik, bukan jaminan" — best-effort, not a guarantee —
  deliberately, do not soften this wording later).
- **The real mitigation is architectural, not a notification trick:** the
  Dashboard computes "what's due today" from stored data (`checkDay()`)
  every single time the app is opened, regardless of whether any push
  ever fired. A missed notification costs convenience, never correctness
  — the user finds out what's due the moment they next open the app,
  which is the actual failure mode worth designing for.

Practical mitigation available today, worth putting in the README for a
human to actually do: exempt the installed PWA / Chrome from Android
battery optimization. This is the same fix Anthropic's own documentation
gives for Claude Code's mobile push notifications on Android — it's a
real, general Android platform behavior, not something specific to this
app's implementation.

If reminder timing ever becomes a genuine blocker (most likely candidate:
sholat reminders needing to actually fire near-exactly on time), the
upgrade path is Capacitor (see §1) for real native scheduling — not more
clever web-platform workarounds layered on top of a fundamentally
best-effort mechanism.

---

## §7. Deployment — getting this onto an Android phone

This app is built through Claude Code, wherever that session runs (web
Code session, Remote Control to a computer, or Termux). Regardless of
where the code is written, the path to actually having it on an Android
phone is the same, and doesn't depend on which of those you used:

1. **Push the repo to GitHub.** (`git init` has already been run in this
   scaffold with an initial commit — see the setup log — so this is just
   `git remote add origin <your-repo-url> && git push -u origin main`.)
2. **Deploy the `dist/` build to a static host.** GitHub Pages is the
   simplest zero-cost option and needs no account beyond GitHub itself:
   add a GitHub Actions workflow that runs `npm run build` and publishes
   `dist/` to the `gh-pages` branch (or use GitHub Pages' native "deploy
   from a branch" with a build action — ask Claude Code to wire this up,
   it's a well-known recipe). Vercel and Netlify are equally fine
   alternatives if preferred, and often even simpler (`vercel --prod` /
   `netlify deploy --prod` after linking the repo).
3. **Open the deployed URL in Chrome on the Android phone.**
4. **Tap the browser menu → "Add to Home screen" / "Install app".** This
   is what actually makes it behave like an installed app: its own icon,
   its own window (no browser chrome), offline-capable app shell via the
   service worker generated in step 2's build.
5. **Open Settings inside the installed app and paste in the Anthropic
   API key** (from console.anthropic.com) to light up the AI Coach
   features, and tap "Simpan & Tes Koneksi" to confirm it's live.

Local development/testing before deploying: `npm run dev` starts a dev
server; open the printed `http://localhost:5173` URL in Chrome on the
same phone (if working inside Termux) or on a desktop browser (if working
via a Claude Code web/Remote Control session) to preview changes live
before pushing.

---

## §8. A note on "Claude Code di Android", for whoever picks this up

There are three real ways to run Claude Code with an Android phone in the
loop, and they have different implications worth being explicit about
rather than assumed:

1. **Claude app's Code tab / claude.ai/code (a cloud session).** Runs in
   an Anthropic-managed sandboxed Linux VM — this is genuinely usable
   from a phone with zero local setup, but the sandbox has no access to
   this project's files unless they're first pushed somewhere reachable
   (GitHub). Assume this is the primary path unless told otherwise; it
   requires nothing beyond the Claude app itself.
2. **Termux, running `claude` directly on the phone.** Termux is a real
   Linux userland, so a Node-based CLI like Claude Code is plausible to
   run there directly, though Anthropic's official install docs list
   macOS/Linux/Windows and don't explicitly document Android/Termux — so
   treat this as community-reported rather than officially guaranteed,
   and if `curl -fsSL https://claude.ai/install.sh | bash` doesn't work
   in Termux, fall back to `npm install -g @anthropic-ai/claude-code`
   after `pkg install nodejs`.
3. **Remote Control, to a separate always-on computer.** Only relevant if
   a separate machine exists to run the actual session on; the phone is
   then just a viewport. Not assumed here since none was mentioned.

**This is why §7's deployment path is written to not depend on which of
the three is actually in use** — GitHub + a static host works
identically regardless of where the `git push` was typed from.

---

## §9. Phased roadmap

See `CLAUDE.md` for the actionable, up-to-date task list. Summary:

- **Phase 1 (done, this handoff):** core engine (Level, Mental Score,
  Growth Index, Memory Vault) fully implemented and tested — 48 passing
  tests. IndexedDB persistence layer, tested. AI Coach client + prompt
  templates, tested, with a live connectivity check in Settings. PWA
  shell (installable, offline app-shell caching). Hand-authored Core
  Session content for Levels 1-5. Onboarding → Dashboard → Session →
  Settings, fully wired and building cleanly (`npm run build`,
  `npm test`, `npx oxlint` all green).
- **Phase 2:** wire the Content Generation Engine into `SessionRunner`
  for level 6+ (replace the Level-5 fallback with live
  `instingScenarioPrompt` etc. calls, with loading/error states and a
  client-side JSON-parsing layer for the model's structured responses).
  Add the remaining Skill Rotation tracks (English Shadow, Public
  Speaking, Kesehatan, Keuangan) per the original design doc's weekly
  rollout schedule. Wire Reflection Level, Brutal Honesty Report, and
  Kompas 5 Tahun check-ins as real scheduled UI flows, not just prompt
  templates sitting unused.
- **Phase 3:** Diamond Tier system UI (Checkpoint exams, Vault gallery),
  Global Mentor Rotation persona switching in the UI, Real-Life Mission /
  Zona Nyaman Breaker random-injection scheduling, Voice Confidence Check
  UI (Web Speech API wiring — the transcript-only approach from §4.4).
- **Phase 4:** Akademi Analisis Saham module (separate coach persona,
  separate level tracks per the original design doc's six categories) —
  entirely unstarted; treat as its own vertical slice with its own
  content data file, following the same pattern as
  `content/coreSessionLevels.ts`.
