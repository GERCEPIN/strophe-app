import { db } from "@/db/client";
import { levelProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  applyDailyRollover,
  markLevelCompleted,
  createInitialLevelState,
  type LevelProgressState,
} from "@/lib/engine/leveling";

export type Track =
  | "core"
  | "daya_ingat"
  | "bahasa_inggris"
  | "public_speaking"
  | "jangka_panjang"
  | "kesehatan"
  | "keuangan";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowToState(row: {
  currentLevel: number;
  highestLevelReached: number;
  levelCompletedToday: boolean;
  lastActiveDate: string | null;
}): LevelProgressState {
  return {
    currentLevel: row.currentLevel,
    highestLevelReached: row.highestLevelReached,
    levelCompletedToday: row.levelCompletedToday,
    lastActiveDate: row.lastActiveDate,
  };
}

/**
 * Fetches the user's progress on a track, applying the daily rollover rule
 * (rule #2) transparently, and persists the rolled-over state. Creates the
 * row on first access. Always call this before reading/showing a level to
 * the user — it's what guarantees "yesterday's stall becomes today's next
 * level" instead of requiring a cron job to get it right.
 */
export async function getRolledOverProgress(userId: string, track: Track): Promise<LevelProgressState> {
  const today = todayISO();

  const [existing] = await db
    .select()
    .from(levelProgress)
    .where(and(eq(levelProgress.userId, userId), eq(levelProgress.track, track)));

  if (!existing) {
    const initial = createInitialLevelState(today);
    await db.insert(levelProgress).values({
      userId,
      track,
      currentLevel: initial.currentLevel,
      highestLevelReached: initial.highestLevelReached,
      levelCompletedToday: initial.levelCompletedToday,
      lastActiveDate: initial.lastActiveDate,
    });
    return initial;
  }

  const rolled = applyDailyRollover(rowToState(existing), today);

  if (rolled.lastActiveDate !== existing.lastActiveDate || rolled.currentLevel !== existing.currentLevel) {
    await db
      .update(levelProgress)
      .set({
        currentLevel: rolled.currentLevel,
        highestLevelReached: rolled.highestLevelReached,
        levelCompletedToday: rolled.levelCompletedToday,
        lastActiveDate: rolled.lastActiveDate,
      })
      .where(and(eq(levelProgress.userId, userId), eq(levelProgress.track, track)));
  }

  return rolled;
}

export async function completeTodayLevel(userId: string, track: Track): Promise<LevelProgressState> {
  const current = await getRolledOverProgress(userId, track);
  const completed = markLevelCompleted(current);

  await db
    .update(levelProgress)
    .set({
      levelCompletedToday: completed.levelCompletedToday,
      highestLevelReached: completed.highestLevelReached,
    })
    .where(and(eq(levelProgress.userId, userId), eq(levelProgress.track, track)));

  return completed;
}

export async function getAllTrackProgress(userId: string) {
  return db.select().from(levelProgress).where(eq(levelProgress.userId, userId));
}
