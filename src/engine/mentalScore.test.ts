import { describe, it, expect } from 'vitest';
import { decayForMissedDay, applyMissedDays, applyActiveDayRecovery } from './mentalScore';

describe('decayForMissedDay', () => {
  it('penalizes the first missed day the least', () => {
    expect(decayForMissedDay(1)).toBe(10);
  });

  it('penalizes each additional consecutive missed day more', () => {
    expect(decayForMissedDay(2)).toBe(12);
    expect(decayForMissedDay(3)).toBe(14);
    expect(decayForMissedDay(4)).toBe(16);
  });

  it('caps the per-day penalty so a long absence is never mathematically unrecoverable', () => {
    expect(decayForMissedDay(10)).toBe(25);
    expect(decayForMissedDay(100)).toBe(25);
  });
});

describe('applyMissedDays', () => {
  it('never drops below 0, even after many missed days', () => {
    const score = applyMissedDays(100, 30);
    expect(score).toBe(0);
  });

  it('matches the worked example: 2 missed days from a starting score of 100', () => {
    // day 1 missed: 100 - 10 = 90
    // day 2 missed:  90 - 12 = 78
    expect(applyMissedDays(100, 2)).toBe(78);
  });

  it('is a no-op when 0 days are missed', () => {
    expect(applyMissedDays(85, 0)).toBe(85);
  });
});

describe('applyActiveDayRecovery', () => {
  it('never exceeds 100', () => {
    expect(applyActiveDayRecovery(97)).toBe(100);
    expect(applyActiveDayRecovery(100)).toBe(100);
  });

  it('recovers by a fixed, modest amount', () => {
    expect(applyActiveDayRecovery(78)).toBe(86);
  });

  it('recovers strictly slower than even the mildest decay, so gaming the loop never pays off', () => {
    const recoveredAmount = applyActiveDayRecovery(50) - 50;
    expect(recoveredAmount).toBeLessThan(decayForMissedDay(1));
  });
});
