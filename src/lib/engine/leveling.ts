/**
 * Leveling engine — implements rules #1 and #2 from the spec:
 *
 *   1. LEVEL TANPA BATAS: starts at level 1, climbs forever, no cap.
 *   2. RESET HARIAN BERTAHAP: if today's session stalls at level 18,
 *      tomorrow picks up at level 19 automatically — it never restarts
 *      from level 1.
 *
 * These are pure functions: no DB, no network, no clock reads inside —
 * "today" is always passed in, so behavior is 100% deterministic and
 * trivially testable.
 */

export interface LevelProgressState {
  currentLevel: number;
  highestLevelReached: number;
  levelCompletedToday: boolean;
  lastActiveDate: string | null; // YYYY-MM-DD
}

export function createInitialLevelState(today: string): LevelProgressState {
  return {
    currentLevel: 1,
    highestLevelReached: 1,
    levelCompletedToday: false,
    lastActiveDate: today,
  };
}

/**
 * Call once per day, before serving today's content, to apply the
 * "gradual daily carry-over" rule. If the user completed a level on a
 * previous day, they advance by exactly one level today — no matter how
 * many days passed. Level never goes backwards, and never resets to 1.
 */
export function applyDailyRollover(
  state: LevelProgressState,
  today: string
): LevelProgressState {
  if (state.lastActiveDate === today) {
    // Already processed today — no-op, idempotent.
    return state;
  }

  const advancesLevel = state.levelCompletedToday;
  const nextLevel = advancesLevel ? state.currentLevel + 1 : state.currentLevel;

  return {
    currentLevel: nextLevel,
    highestLevelReached: Math.max(state.highestLevelReached, nextLevel),
    levelCompletedToday: false,
    lastActiveDate: today,
  };
}

/** Call when the user finishes today's level content. Idempotent per day. */
export function markLevelCompleted(state: LevelProgressState): LevelProgressState {
  return {
    ...state,
    levelCompletedToday: true,
    highestLevelReached: Math.max(state.highestLevelReached, state.currentLevel),
  };
}

/** True every N-th level (e.g. Reflection Level every 10, Diamond every 50). */
export function isMultipleOfLevel(level: number, multiple: number): boolean {
  return level > 0 && level % multiple === 0;
}
