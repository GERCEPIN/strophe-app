/**
 * Mental Score Engine
 *
 * mentalScore starts at 100, drops when days are missed, and recovers
 * slowly on consistent days afterward. Always clamped to [0, 100].
 *
 * Decay is front-loaded but capped, so a long absence never mathematically
 * strands a returning user at 0 with no way back — see TECHNICAL_SPEC.md §2:
 *   1st consecutive missed day:  -10
 *   2nd consecutive missed day:  -12
 *   nth consecutive missed day:  -(12 + 2*(n-2)), capped at -25/day
 *
 * Recovery is deliberately slower than decay (+8/day) so the score can't
 * be gamed by missing a day on purpose to "feel" a big recovery swing, and
 * so it reflects the real psychology of slowly rebuilding trust with
 * yourself rather than an instant bounce-back.
 */

export function decayForMissedDay(consecutiveMissedDayIndex: number): number {
  // consecutiveMissedDayIndex: 1 = first missed day in this gap, 2 = second, ...
  if (consecutiveMissedDayIndex <= 1) return 10;
  const value = 12 + 2 * (consecutiveMissedDayIndex - 2);
  return Math.min(value, 25);
}

/** Applies `missedDaysToApply` consecutive daily decays starting from day-index 1. */
export function applyMissedDays(mentalScore: number, missedDaysToApply: number): number {
  let score = mentalScore;
  for (let i = 1; i <= missedDaysToApply; i++) {
    score -= decayForMissedDay(i);
  }
  return clamp(Math.round(score));
}

export function applyActiveDayRecovery(mentalScore: number): number {
  return clamp(Math.round(mentalScore + 8));
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, score));
}
