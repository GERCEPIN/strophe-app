import { describe, it, expect } from 'vitest';
import { completeTodaysSession } from './dailyTransition';
import { createInitialProgressState } from './level';

describe('completeTodaysSession — full worked week from the design conversation', () => {
  it('reproduces Senin -> Sabtu exactly: levels 1,2,(frozen),(frozen),3,4 and mental 100,100,-,-,78,86', () => {
    let state = createInitialProgressState();

    const senin = completeTodaysSession(state, '2026-07-06'); // Monday
    expect(senin.state.currentLevel).toBe(1);
    expect(senin.state.mentalScore).toBe(100);
    state = senin.state;

    const selasa = completeTodaysSession(state, '2026-07-07'); // Tuesday
    expect(selasa.state.currentLevel).toBe(2);
    expect(selasa.state.mentalScore).toBe(100); // stays capped even though "the session score was bad" (score quality is out of scope for this engine)
    state = selasa.state;

    // Rabu (07-08) and Kamis (07-09) are missed entirely — no calls made.

    const jumat = completeTodaysSession(state, '2026-07-10'); // Friday, returns after 2 missed days
    expect(jumat.missedDaysSinceLastActive).toBe(2);
    expect(jumat.state.currentLevel).toBe(3); // +1 only, not +3
    expect(jumat.state.mentalScore).toBe(78); // 100 -10 -12
    state = jumat.state;

    const sabtu = completeTodaysSession(state, '2026-07-11'); // Saturday, consecutive active day
    expect(sabtu.state.currentLevel).toBe(4);
    expect(sabtu.state.mentalScore).toBe(86); // 78 + 8, recovery begins the day AFTER the return
  });
});

describe('completeTodaysSession — idempotency', () => {
  it('is a complete no-op when called twice on the same date', () => {
    let state = createInitialProgressState();
    const first = completeTodaysSession(state, '2026-07-01');
    const second = completeTodaysSession(first.state, '2026-07-01');
    expect(second.state).toEqual(first.state);
    expect(second.missedDaysSinceLastActive).toBe(0);
  });
});

describe('completeTodaysSession — long absence never strands the user', () => {
  it('level keeps climbing (by 1) and mental score bottoms out at 0, not negative or NaN', () => {
    let state = createInitialProgressState();
    state = completeTodaysSession(state, '2026-01-01').state;
    const returned = completeTodaysSession(state, '2026-03-01'); // ~2 months later
    expect(returned.state.currentLevel).toBe(2);
    expect(returned.state.mentalScore).toBe(0);
    expect(Number.isNaN(returned.state.mentalScore)).toBe(false);
  });
});
