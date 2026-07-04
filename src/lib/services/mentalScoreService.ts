import { db } from "@/db/client";
import { mentalScoreLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  recordDailyCompletion,
  applyMissedDayDecay,
  createInitialMentalScoreState,
  type MentalScoreState,
} from "@/lib/engine/streak";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getLatestState(userId: string): Promise<MentalScoreState> {
  const [latest] = await db
    .select()
    .from(mentalScoreLog)
    .where(eq(mentalScoreLog.userId, userId))
    .orderBy(desc(mentalScoreLog.date))
    .limit(1);

  if (!latest) return createInitialMentalScoreState();

  return {
    mentalScore: latest.mentalScore,
    streakDays: latest.streakDays,
    lastActiveDate: latest.date,
  };
}

/** Read-only: reflects missed-day decay without recording a completion. Safe to call on every page load. */
export async function getCurrentMentalScore(userId: string): Promise<MentalScoreState> {
  const state = await getLatestState(userId);
  return applyMissedDayDecay(state, todayISO());
}

/** Call when the user finishes today's Core Session — the only action that grants streak credit. */
export async function recordTodayCompletion(userId: string): Promise<MentalScoreState> {
  const today = todayISO();
  const state = await getLatestState(userId);
  const updated = recordDailyCompletion(state, today);

  await db
    .insert(mentalScoreLog)
    .values({
      userId,
      date: today,
      mentalScore: updated.mentalScore,
      streakDays: updated.streakDays,
      missedDay: state.lastActiveDate !== null && state.lastActiveDate !== today && updated.streakDays === 1,
    })
    .onConflictDoUpdate({
      target: [mentalScoreLog.userId, mentalScoreLog.date],
      set: { mentalScore: updated.mentalScore, streakDays: updated.streakDays },
    });

  return updated;
}
