import type { ProgressState, ISODateString } from '../types';
import { checkDay, completeCoreSession } from './level';
import { applyMissedDays, applyActiveDayRecovery } from './mentalScore';

export interface DailyTransitionResult {
  state: ProgressState;
  missedDaysSinceLastActive: number;
}

/**
 * The one function the app calls when the user finishes today's Core
 * Session. Composes the Level engine and the Mental Score engine so the
 * two numbers always move together correctly. This is the exact logic
 * behind the worked example from the design conversation:
 *
 *   Senin  (active, good score):  level 1, mental 100
 *   Selasa (active, bad score):   level 2, mental 100   score quality never touches mentalScore
 *   Rabu   (missed — no call):           -, mental  90  (-10, applied when the user next returns)
 *   Kamis  (missed — no call):           -, mental  78  (-12, applied when the user next returns)
 *   Jumat  (active, returns):     level 3, mental  78   returning does not itself heal the score
 *   Sabtu  (active again):        level 4, mental  86   (+8) recovery begins the day AFTER a return
 *
 * Calling this twice on the same calendar date is a safe no-op (mirrors
 * the level engine's own idempotency guard).
 */
export function completeTodaysSession(
  state: ProgressState,
  today: ISODateString
): DailyTransitionResult {
  if (state.lastAdvancedDate === today) {
    return { state, missedDaysSinceLastActive: 0 };
  }

  const { missedDaysSinceLastActive } = checkDay(state, today);
  let mentalScore = state.mentalScore;

  if (missedDaysSinceLastActive > 0) {
    // returning from a gap: decay applies, recovery does not (not yet)
    mentalScore = applyMissedDays(mentalScore, missedDaysSinceLastActive);
  } else if (state.lastAdvancedDate !== null) {
    // a genuine back-to-back active day (yesterday was also active): recover
    mentalScore = applyActiveDayRecovery(mentalScore);
  }
  // else: this is the very first session ever — leave the starting value untouched

  const advanced = completeCoreSession(state, today);

  return {
    state: { ...advanced, mentalScore },
    missedDaysSinceLastActive,
  };
}
