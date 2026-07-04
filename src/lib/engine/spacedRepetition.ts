/**
 * Memory Vault (feature #4) spaced repetition — a standard SM-2 scheduler.
 * This is "real method" per rule #5 (no hand-waved "100x memory" claims):
 * it's the same algorithm behind Anki and SuperMemo, just implemented as a
 * small pure function so it's easy to verify and test.
 */

export interface ReviewState {
  easeFactor: number; // starts at 2.5
  intervalDays: number;
  repetitions: number;
  dueDate: string; // YYYY-MM-DD
}

export function createInitialReviewState(today: string): ReviewState {
  return { easeFactor: 2.5, intervalDays: 0, repetitions: 0, dueDate: today };
}

function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Grade is 0-5 (SM-2 scale): 0-2 = failed recall, 3-5 = successful recall
 * with increasing confidence. Returns the next review state.
 */
export function scheduleNextReview(state: ReviewState, grade: number, today: string): ReviewState {
  if (grade < 0 || grade > 5 || !Number.isInteger(grade)) {
    throw new Error(`grade must be an integer 0-5, got ${grade}`);
  }

  if (grade < 3) {
    // Failed recall: restart repetition count but don't punish ease as hard
    // as a full SM-2 would — this is a *training* app, not a punishment app.
    return {
      easeFactor: Math.max(1.3, state.easeFactor - 0.2),
      intervalDays: 1,
      repetitions: 0,
      dueDate: addDays(today, 1),
    };
  }

  const nextEase = Math.max(
    1.3,
    state.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  const nextRepetitions = state.repetitions + 1;
  let nextInterval: number;
  if (nextRepetitions === 1) nextInterval = 1;
  else if (nextRepetitions === 2) nextInterval = 6;
  else nextInterval = Math.round(state.intervalDays * nextEase);

  return {
    easeFactor: nextEase,
    intervalDays: nextInterval,
    repetitions: nextRepetitions,
    dueDate: addDays(today, nextInterval),
  };
}

export function isDue(state: ReviewState, today: string): boolean {
  return state.dueDate <= today;
}
