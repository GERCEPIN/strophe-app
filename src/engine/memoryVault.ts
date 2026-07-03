import type { MemoryVaultItem, ISODateString } from '../types';
import { daysBetween } from './level';

/**
 * Memory Vault — a 5-box Leitner spaced-repetition scheduler. A correct
 * review promotes an item to the next box (longer interval before it
 * resurfaces); an incorrect review sends it straight back to box 1. This
 * is the mechanism behind "materi lama muncul ulang acak di level
 * berikutnya" from the original design brief, made concrete and testable.
 */
export const LEITNER_INTERVALS_DAYS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export function addDays(date: ISODateString, days: number): ISODateString {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function createMemoryVaultItem(
  id: string,
  content: string,
  today: ISODateString
): MemoryVaultItem {
  return {
    id,
    content,
    box: 1,
    lastReviewedDate: null,
    dueDate: today, // due immediately the first time it's introduced
    correctStreak: 0,
  };
}

export function reviewItem(
  item: MemoryVaultItem,
  today: ISODateString,
  wasCorrect: boolean
): MemoryVaultItem {
  const nextBox = wasCorrect
    ? (Math.min(5, item.box + 1) as MemoryVaultItem['box'])
    : 1;
  return {
    ...item,
    box: nextBox,
    lastReviewedDate: today,
    dueDate: addDays(today, LEITNER_INTERVALS_DAYS[nextBox]),
    correctStreak: wasCorrect ? item.correctStreak + 1 : 0,
  };
}

/** Items due today or overdue — this is what resurfaces in today's Skill Rotation session. */
export function itemsDueToday(items: MemoryVaultItem[], today: ISODateString): MemoryVaultItem[] {
  return items.filter((item) => daysBetween(item.dueDate, today) >= 0);
}
