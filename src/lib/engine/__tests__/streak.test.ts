import { describe, it, expect } from "vitest";
import {
  createInitialMentalScoreState,
  recordDailyCompletion,
  applyMissedDayDecay,
  shouldShowPanicButton,
  PANIC_BUTTON_THRESHOLD,
} from "../streak";

describe("streak (Streak Ganas) engine", () => {
  it("gains mental score on consecutive daily completion", () => {
    let state = createInitialMentalScoreState();
    const initial = state.mentalScore;
    state = recordDailyCompletion(state, "2026-07-01");
    expect(state.mentalScore).toBeGreaterThanOrEqual(initial); // day 1 counts as itself, no penalty
    state = recordDailyCompletion(state, "2026-07-02");
    expect(state.streakDays).toBe(2);
  });

  it("costs mental score, not level, when a day is missed", () => {
    let state = createInitialMentalScoreState();
    state = recordDailyCompletion(state, "2026-07-01");
    const beforeMiss = state.mentalScore;

    // user skips 2 full days, comes back on July 4
    state = recordDailyCompletion(state, "2026-07-04");

    expect(state.mentalScore).toBeLessThan(beforeMiss);
    expect(state.streakDays).toBe(1); // streak restarts, but this is NOT a level reset
  });

  it("never drops mental score below 0", () => {
    let state = createInitialMentalScoreState();
    state = recordDailyCompletion(state, "2026-01-01");
    state = recordDailyCompletion(state, "2026-06-01"); // months of silence
    expect(state.mentalScore).toBeGreaterThanOrEqual(0);
  });

  it("never exceeds 100", () => {
    let state = createInitialMentalScoreState();
    const date = new Date("2026-07-01T00:00:00Z");
    for (let i = 0; i < 60; i++) {
      const iso = date.toISOString().slice(0, 10);
      state = recordDailyCompletion(state, iso);
      date.setUTCDate(date.getUTCDate() + 1);
    }
    expect(state.mentalScore).toBeLessThanOrEqual(100);
  });

  it("applyMissedDayDecay reflects missed days even before user acts today", () => {
    let state = createInitialMentalScoreState();
    state = recordDailyCompletion(state, "2026-07-01");
    const before = state.mentalScore;
    state = applyMissedDayDecay(state, "2026-07-05");
    expect(state.mentalScore).toBeLessThan(before);
  });

  it("triggers the Panic Button once score falls to the threshold", () => {
    const healthy = { mentalScore: 80, streakDays: 5, lastActiveDate: "2026-07-01" };
    const struggling = { mentalScore: PANIC_BUTTON_THRESHOLD, streakDays: 0, lastActiveDate: "2026-07-01" };

    expect(shouldShowPanicButton(healthy)).toBe(false);
    expect(shouldShowPanicButton(struggling)).toBe(true);
  });
});
