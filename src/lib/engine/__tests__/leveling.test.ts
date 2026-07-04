import { describe, it, expect } from "vitest";
import {
  createInitialLevelState,
  applyDailyRollover,
  markLevelCompleted,
  isMultipleOfLevel,
} from "../leveling";

describe("leveling engine", () => {
  it("starts every user at level 1", () => {
    const state = createInitialLevelState("2026-07-01");
    expect(state.currentLevel).toBe(1);
    expect(state.highestLevelReached).toBe(1);
  });

  it("advances exactly one level the day after completion (rule #2)", () => {
    let state = createInitialLevelState("2026-07-01");
    state = markLevelCompleted(state);
    state = applyDailyRollover(state, "2026-07-02");

    expect(state.currentLevel).toBe(2);
    expect(state.levelCompletedToday).toBe(false);
  });

  it("does NOT advance if the level was not completed", () => {
    let state = createInitialLevelState("2026-07-01");
    state = applyDailyRollover(state, "2026-07-02");

    expect(state.currentLevel).toBe(1);
  });

  it("never resets to level 1 even after many days of silence", () => {
    let state = createInitialLevelState("2026-07-01");
    state.currentLevel = 18;
    state.highestLevelReached = 18;
    state = markLevelCompleted(state);
    // user vanishes for 10 days, then comes back
    state = applyDailyRollover(state, "2026-07-11");

    expect(state.currentLevel).toBe(19); // advances by exactly one, not ten
    expect(state.currentLevel).toBeGreaterThanOrEqual(1);
  });

  it("rollover is idempotent within the same day", () => {
    let state = createInitialLevelState("2026-07-01");
    state = markLevelCompleted(state);
    state = applyDailyRollover(state, "2026-07-01"); // same day, no-op

    expect(state.currentLevel).toBe(1);
    expect(state.levelCompletedToday).toBe(true);
  });

  it("highestLevelReached only ever increases", () => {
    let state = createInitialLevelState("2026-07-01");
    state.currentLevel = 5;
    state.highestLevelReached = 5;
    state = applyDailyRollover(state, "2026-07-02"); // not completed, level stays

    expect(state.highestLevelReached).toBe(5);
  });

  it("isMultipleOfLevel detects reflection levels (every 10) and diamond levels (every 50)", () => {
    expect(isMultipleOfLevel(10, 10)).toBe(true);
    expect(isMultipleOfLevel(15, 10)).toBe(false);
    expect(isMultipleOfLevel(50, 50)).toBe(true);
    expect(isMultipleOfLevel(0, 10)).toBe(false);
  });
});
