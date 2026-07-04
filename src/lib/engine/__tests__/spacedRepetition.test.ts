import { describe, it, expect } from "vitest";
import {
  createInitialReviewState,
  scheduleNextReview,
  isDue,
} from "../spacedRepetition";

describe("spaced repetition engine (Memory Vault)", () => {
  it("a new item is due immediately", () => {
    const state = createInitialReviewState("2026-07-01");
    expect(isDue(state, "2026-07-01")).toBe(true);
  });

  it("first successful review schedules a 1-day interval", () => {
    const state = createInitialReviewState("2026-07-01");
    const next = scheduleNextReview(state, 4, "2026-07-01");
    expect(next.intervalDays).toBe(1);
    expect(next.dueDate).toBe("2026-07-02");
    expect(next.repetitions).toBe(1);
  });

  it("second successful review schedules a 6-day interval", () => {
    let state = createInitialReviewState("2026-07-01");
    state = scheduleNextReview(state, 4, "2026-07-01");
    state = scheduleNextReview(state, 4, "2026-07-02");
    expect(state.intervalDays).toBe(6);
    expect(state.repetitions).toBe(2);
  });

  it("intervals grow with repeated success (real spacing, not a gimmick)", () => {
    let state = createInitialReviewState("2026-07-01");
    let today = "2026-07-01";
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) {
      state = scheduleNextReview(state, 5, today);
      intervals.push(state.intervalDays);
      today = state.dueDate;
    }
    // each successful interval should be >= the previous one
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
  });

  it("a failed recall (grade < 3) resets repetitions and schedules tomorrow", () => {
    let state = createInitialReviewState("2026-07-01");
    state = scheduleNextReview(state, 5, "2026-07-01");
    state = scheduleNextReview(state, 5, state.dueDate);
    const beforeFail = state.repetitions;
    expect(beforeFail).toBeGreaterThan(0);

    state = scheduleNextReview(state, 1, "2026-07-20");
    expect(state.repetitions).toBe(0);
    expect(state.intervalDays).toBe(1);
  });

  it("ease factor never drops below 1.3 (SM-2 floor)", () => {
    let state = createInitialReviewState("2026-07-01");
    let today = "2026-07-01";
    for (let i = 0; i < 20; i++) {
      state = scheduleNextReview(state, 0, today);
      today = state.dueDate;
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("rejects out-of-range grades", () => {
    const state = createInitialReviewState("2026-07-01");
    expect(() => scheduleNextReview(state, 6, "2026-07-01")).toThrow();
    expect(() => scheduleNextReview(state, -1, "2026-07-01")).toThrow();
  });
});
