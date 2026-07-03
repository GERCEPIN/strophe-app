import { describe, it, expect } from 'vitest';
import {
  createMemoryVaultItem,
  reviewItem,
  itemsDueToday,
  addDays,
  LEITNER_INTERVALS_DAYS,
} from './memoryVault';

describe('addDays', () => {
  it('adds days across a month boundary', () => {
    expect(addDays('2026-07-30', 3)).toBe('2026-08-02');
  });
});

describe('createMemoryVaultItem', () => {
  it('starts in box 1, due immediately', () => {
    const item = createMemoryVaultItem('id-1', 'payung', '2026-07-01');
    expect(item.box).toBe(1);
    expect(item.dueDate).toBe('2026-07-01');
    expect(item.correctStreak).toBe(0);
  });
});

describe('reviewItem', () => {
  it('promotes to the next box on a correct answer, with a longer interval', () => {
    const item = createMemoryVaultItem('id-1', 'payung', '2026-07-01');
    const reviewed = reviewItem(item, '2026-07-01', true);
    expect(reviewed.box).toBe(2);
    expect(reviewed.dueDate).toBe(addDays('2026-07-01', LEITNER_INTERVALS_DAYS[2]));
    expect(reviewed.correctStreak).toBe(1);
  });

  it('caps promotion at box 5', () => {
    let item = createMemoryVaultItem('id-1', 'payung', '2026-07-01');
    for (let i = 0; i < 10; i++) {
      item = reviewItem(item, item.dueDate, true);
    }
    expect(item.box).toBe(5);
  });

  it('sends an item back to box 1 on an incorrect answer, resetting the streak', () => {
    let item = createMemoryVaultItem('id-1', 'payung', '2026-07-01');
    item = reviewItem(item, '2026-07-01', true); // -> box 2
    item = reviewItem(item, item.dueDate, true); // -> box 3
    item = reviewItem(item, item.dueDate, false); // forgotten -> back to box 1
    expect(item.box).toBe(1);
    expect(item.correctStreak).toBe(0);
  });
});

describe('itemsDueToday', () => {
  it('includes items due exactly today and overdue items, excludes future items', () => {
    const dueToday = createMemoryVaultItem('a', 'today', '2026-07-10');
    const overdue = { ...createMemoryVaultItem('b', 'overdue', '2026-07-05'), dueDate: '2026-07-05' };
    const future = { ...createMemoryVaultItem('c', 'future', '2026-07-10'), dueDate: '2026-07-20' };

    const due = itemsDueToday([dueToday, overdue, future], '2026-07-10');
    const ids = due.map((i) => i.id);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).not.toContain('c');
  });
});
