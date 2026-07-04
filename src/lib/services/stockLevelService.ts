import { db } from "@/db/client";
import { stockAcademyProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  applyDailyRollover,
  markLevelCompleted,
  createInitialLevelState,
  type LevelProgressState,
} from "@/lib/engine/leveling";

export type StockCategory =
  | "fundamental"
  | "teknikal"
  | "makro_sektoral"
  | "sentimen_berita"
  | "manajemen_risiko"
  | "legal_compliance";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getRolledOverStockProgress(userId: string, category: StockCategory): Promise<LevelProgressState> {
  const today = todayISO();

  const [existing] = await db
    .select()
    .from(stockAcademyProgress)
    .where(and(eq(stockAcademyProgress.userId, userId), eq(stockAcademyProgress.category, category)));

  if (!existing) {
    const initial = createInitialLevelState(today);
    await db.insert(stockAcademyProgress).values({
      userId,
      category,
      currentLevel: initial.currentLevel,
      highestLevelReached: initial.highestLevelReached,
      levelCompletedToday: initial.levelCompletedToday,
      lastActiveDate: initial.lastActiveDate,
    });
    return initial;
  }

  const rolled = applyDailyRollover(
    {
      currentLevel: existing.currentLevel,
      highestLevelReached: existing.highestLevelReached,
      levelCompletedToday: existing.levelCompletedToday,
      lastActiveDate: existing.lastActiveDate,
    },
    today
  );

  if (rolled.lastActiveDate !== existing.lastActiveDate || rolled.currentLevel !== existing.currentLevel) {
    await db
      .update(stockAcademyProgress)
      .set({
        currentLevel: rolled.currentLevel,
        highestLevelReached: rolled.highestLevelReached,
        levelCompletedToday: rolled.levelCompletedToday,
        lastActiveDate: rolled.lastActiveDate,
      })
      .where(and(eq(stockAcademyProgress.userId, userId), eq(stockAcademyProgress.category, category)));
  }

  return rolled;
}

export async function completeStockLevel(userId: string, category: StockCategory): Promise<LevelProgressState> {
  const current = await getRolledOverStockProgress(userId, category);
  const completed = markLevelCompleted(current);

  await db
    .update(stockAcademyProgress)
    .set({ levelCompletedToday: completed.levelCompletedToday, highestLevelReached: completed.highestLevelReached })
    .where(and(eq(stockAcademyProgress.userId, userId), eq(stockAcademyProgress.category, category)));

  return completed;
}
