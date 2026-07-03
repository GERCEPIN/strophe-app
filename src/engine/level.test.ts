import { describe, it, expect } from 'vitest';
import { checkDay, completeCoreSession, createInitialProgressState, daysBetween } from './level';

describe('daysBetween', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetween('2026-07-01', '2026-07-01')).toBe(0);
  });

  it('returns 1 for consecutive days', () => {
    expect(daysBetween('2026-07-01', '2026-07-02')).toBe(1);
  });

  it('handles month boundaries correctly', () => {
    expect(daysBetween('2026-06-30', '2026-07-02')).toBe(2);
  });

  it('handles year boundaries correctly', () => {
    expect(daysBetween('2025-12-30', '2026-01-02')).toBe(3);
  });
});

describe('completeCoreSession — rule 1: +1 level per completed session', () => {
  it('advances level from 0 to 1 on the first-ever completion', () => {
    const state = createInitialProgressState();
    const next = completeCoreSession(state, '2026-07-01');
    expect(next.currentLevel).toBe(1);
    expect(next.lastAdvancedDate).toBe('2026-07-01');
  });

  it('advances by exactly 1 on each fresh day, regardless of order of magnitude', () => {
    let state = createInitialProgressState();
    for (let i = 1; i <= 20; i++) {
      const date = `2026-07-${String(i).padStart(2, '0')}`;
      state = completeCoreSession(state, date);
    }
    expect(state.currentLevel).toBe(20);
  });
});

describe('completeCoreSession — rule 2: max +1 level per calendar day', () => {
  it('does not advance twice for the same calendar date, however many times it is called', () => {
    let state = createInitialProgressState();
    state = completeCoreSession(state, '2026-07-01');
    state = completeCoreSession(state, '2026-07-01');
    state = completeCoreSession(state, '2026-07-01');
    expect(state.currentLevel).toBe(1);
  });
});

describe('completeCoreSession — rule 3: missed days freeze, never reset to 1', () => {
  it('continues from the last level +1 after a gap, instead of resetting or catching up', () => {
    let state = createInitialProgressState();
    state = completeCoreSession(state, '2026-07-01'); // level 1
    state = completeCoreSession(state, '2026-07-02'); // level 2
    // 07-03 and 07-04 are missed entirely — no call made for those dates
    state = completeCoreSession(state, '2026-07-05'); // returns
    expect(state.currentLevel).toBe(3); // not reset to 1, not jumped to 5
    expect(state.lastAdvancedDate).toBe('2026-07-05');
  });

  it('never decreases the level under any sequence of calls', () => {
    let state = createInitialProgressState();
    const dates = ['2026-07-01', '2026-07-01', '2026-07-10', '2026-07-10', '2026-08-15'];
    let previousLevel = 0;
    for (const date of dates) {
      state = completeCoreSession(state, date);
      expect(state.currentLevel).toBeGreaterThanOrEqual(previousLevel);
      previousLevel = state.currentLevel;
    }
  });
});

describe('checkDay', () => {
  it('reports 0 missed days for the very first session (no prior activity)', () => {
    const state = createInitialProgressState();
    const result = checkDay(state, '2026-07-01');
    expect(result.missedDaysSinceLastActive).toBe(0);
    expect(result.isNewDaySinceLastAdvance).toBe(true);
  });

  it('reports 0 missed days for consecutive-day usage', () => {
    let state = createInitialProgressState();
    state = completeCoreSession(state, '2026-07-01');
    const result = checkDay(state, '2026-07-02');
    expect(result.missedDaysSinceLastActive).toBe(0);
  });

  it('reports the correct count of missed days after a gap', () => {
    let state = createInitialProgressState();
    state = completeCoreSession(state, '2026-07-01');
    // gap to 07-05 = 4 days; 07-02, 07-03, 07-04 were missed (3 days)
    const result = checkDay(state, '2026-07-05');
    expect(result.missedDaysSinceLastActive).toBe(3);
  });

  it('reports isNewDaySinceLastAdvance = false when checked again on the same date', () => {
    let state = createInitialProgressState();
    state = completeCoreSession(state, '2026-07-01');
    const result = checkDay(state, '2026-07-01');
    expect(result.missedDaysSinceLastActive).toBe(0);
    expect(result.isNewDaySinceLastAdvance).toBe(false);
  });
});
