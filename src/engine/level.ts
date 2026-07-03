import type { ProgressState, ISODateString } from '../types';

/**
 * STROPHE Level Engine
 *
 * Rules (see TECHNICAL_SPEC.md §2 for the full rationale + worked example):
 *   1. Completing today's Core Session advances currentLevel by exactly +1,
 *      regardless of performance quality within the session. Performance
 *      affects Mental Score and Growth Index — never the level number.
 *   2. Max +1 level per calendar day, no matter how many times the app is
 *      opened or how many sessions are (re-)run that day.
 *   3. A fully missed day freezes the level — it does NOT reset to 1 and
 *      does NOT jump forward to "catch up" once the user returns.
 *   4. Missed days affect mentalScore only (see mentalScore.ts), never
 *      currentLevel directly.
 *
 * These functions are pure and have no knowledge of storage, the UI, or
 * mental score — see engine/dailyTransition.ts for the composed function
 * the app actually calls.
 */

export function daysBetween(a: ISODateString, b: ISODateString): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((db.getTime() - da.getTime()) / msPerDay);
}

export function createInitialProgressState(): ProgressState {
  return {
    currentLevel: 0, // becomes 1 after the first completed Core Session
    lastAdvancedDate: null,
    mentalScore: 100,
    growthIndexHistory: [],
  };
}

export interface DayCheckResult {
  /** Full days with no completed session between lastAdvancedDate and today, exclusive of both endpoints. */
  missedDaysSinceLastActive: number;
  /** True once any calendar day has passed since the last completed session (i.e. today's session is not done yet). */
  isNewDaySinceLastAdvance: boolean;
}

/**
 * Read-only status check — call this whenever the app is opened, BEFORE
 * the user has necessarily completed anything today. Use it to show a
 * "you missed N days" banner. It never mutates state and is safe to call
 * as often as you like.
 */
export function checkDay(state: ProgressState, today: ISODateString): DayCheckResult {
  if (state.lastAdvancedDate === null) {
    return { missedDaysSinceLastActive: 0, isNewDaySinceLastAdvance: true };
  }
  if (state.lastAdvancedDate === today) {
    return { missedDaysSinceLastActive: 0, isNewDaySinceLastAdvance: false };
  }
  const gap = daysBetween(state.lastAdvancedDate, today);
  // gap === 1 means yesterday was the last active day -> 0 days missed in between
  // gap >= 2 means (gap - 1) full calendar days were missed
  const missed = Math.max(0, gap - 1);
  return { missedDaysSinceLastActive: missed, isNewDaySinceLastAdvance: true };
}

/**
 * Advances currentLevel by exactly +1 if — and only if — today is a new
 * day relative to lastAdvancedDate (rule 2: idempotent per calendar day).
 * Does not touch mentalScore; see dailyTransition.ts for the full flow.
 */
export function completeCoreSession(state: ProgressState, today: ISODateString): ProgressState {
  if (state.lastAdvancedDate === today) {
    return state; // already advanced today — no-op, satisfies rule 2
  }
  return {
    ...state,
    currentLevel: state.currentLevel + 1,
    lastAdvancedDate: today,
  };
}
