/**
 * Streak Ganas (feature #11) — "aggressive streak":
 *   - Missing a day NEVER resets the level (leveling.ts handles that).
 *   - Missing a day DOES cost mental score, which is the actual discipline
 *     pressure. This keeps the punishment proportional instead of the
 *     all-or-nothing streak counters that make people give up entirely
 *     after one bad day.
 *
 * Also implements the trigger condition for feature #12, Panic Button
 * Anti-Menyerah: when the mental score drops far enough, the UI should
 * offer a 60-second micro-challenge instead of letting the user quit.
 */

export interface MentalScoreState {
  mentalScore: number; // 0-100
  streakDays: number;
  lastActiveDate: string | null; // YYYY-MM-DD
}

const MAX_SCORE = 100;
const MIN_SCORE = 0;
const DAILY_GAIN = 4;
const MISSED_DAY_PENALTY = 12;
export const PANIC_BUTTON_THRESHOLD = 35;

export function createInitialMentalScoreState(): MentalScoreState {
  // lastActiveDate starts null — no activity has been recorded yet, so the
  // very first recordDailyCompletion() call correctly counts as day 1 of a
  // streak instead of being treated as a same-day no-op.
  return { mentalScore: 60, streakDays: 0, lastActiveDate: null };
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / msPerDay);
}

/**
 * Call once when the user completes today's core session.
 * Applies penalties for every day missed since their last active day,
 * then applies today's gain. Clamped to [0, 100].
 */
export function recordDailyCompletion(state: MentalScoreState, today: string): MentalScoreState {
  if (state.lastActiveDate === today) return state; // idempotent

  const missedDays = state.lastActiveDate ? Math.max(0, daysBetween(state.lastActiveDate, today) - 1) : 0;

  const scoreAfterPenalty = Math.max(MIN_SCORE, state.mentalScore - missedDays * MISSED_DAY_PENALTY);
  const scoreAfterGain = Math.min(MAX_SCORE, scoreAfterPenalty + DAILY_GAIN);

  return {
    mentalScore: scoreAfterGain,
    streakDays: missedDays > 0 ? 1 : state.streakDays + 1,
    lastActiveDate: today,
  };
}

/**
 * Call on app load (independent of whether the user does today's session)
 * to reflect missed days in the score even before they act today.
 */
export function applyMissedDayDecay(state: MentalScoreState, today: string): MentalScoreState {
  if (!state.lastActiveDate || state.lastActiveDate === today) return state;

  const missedDays = Math.max(0, daysBetween(state.lastActiveDate, today) - 1);
  if (missedDays <= 0) return state;

  return {
    ...state,
    mentalScore: Math.max(MIN_SCORE, state.mentalScore - missedDays * MISSED_DAY_PENALTY),
    streakDays: 0,
  };
}

/** Feature #12 — Panic Button Anti-Menyerah trigger condition. */
export function shouldShowPanicButton(state: MentalScoreState): boolean {
  return state.mentalScore <= PANIC_BUTTON_THRESHOLD;
}
