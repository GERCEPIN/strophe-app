import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { coreSessionContent, coreSessionLogs } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getRolledOverProgress, completeTodayLevel } from "@/lib/services/levelProgressService";
import { recordTodayCompletion } from "@/lib/services/mentalScoreService";
import { isMultipleOfLevel } from "@/lib/engine/leveling";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchContentForLevel(level: number) {
  const [exact] = await db.select().from(coreSessionContent).where(eq(coreSessionContent.level, level));
  if (exact) return { content: exact, recycled: false };

  const [{ value: totalLevels }] = await db.select({ value: count() }).from(coreSessionContent);
  if (totalLevels === 0) return { content: null, recycled: false };

  const cycledLevel = ((level - 1) % totalLevels) + 1;
  const [fallback] = await db.select().from(coreSessionContent).where(eq(coreSessionContent.level, cycledLevel));
  return { content: fallback ?? null, recycled: true };
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const progress = await getRolledOverProgress(session.userId, "core");
  const { content, recycled } = await fetchContentForLevel(progress.currentLevel);

  const [log] = await db
    .select()
    .from(coreSessionLogs)
    .where(
      and(
        eq(coreSessionLogs.userId, session.userId),
        eq(coreSessionLogs.level, progress.currentLevel),
        eq(coreSessionLogs.date, todayISO())
      )
    );

  return NextResponse.json({
    level: progress.currentLevel,
    highestLevelReached: progress.highestLevelReached,
    isReflectionLevel: isMultipleOfLevel(progress.currentLevel, 10),
    isDiamondCheckpoint: isMultipleOfLevel(progress.currentLevel, 50),
    content,
    contentRecycledFromEarlierLevel: recycled,
    completedToday: log?.completed ?? false,
  });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const { decisionSpeedMs, accuracyScore, responseData } = body ?? {};

  const progress = await getRolledOverProgress(session.userId, "core");
  const today = todayISO();

  const [existingLog] = await db
    .select()
    .from(coreSessionLogs)
    .where(
      and(
        eq(coreSessionLogs.userId, session.userId),
        eq(coreSessionLogs.level, progress.currentLevel),
        eq(coreSessionLogs.date, today)
      )
    );

  if (existingLog?.completed) {
    return NextResponse.json({ ok: true, alreadyCompleted: true });
  }

  if (existingLog) {
    await db
      .update(coreSessionLogs)
      .set({ completed: true, decisionSpeedMs, accuracyScore, responseData })
      .where(eq(coreSessionLogs.id, existingLog.id));
  } else {
    await db.insert(coreSessionLogs).values({
      userId: session.userId,
      level: progress.currentLevel,
      date: today,
      completed: true,
      decisionSpeedMs,
      accuracyScore,
      responseData,
    });
  }

  const newProgress = await completeTodayLevel(session.userId, "core");
  const mentalScore = await recordTodayCompletion(session.userId);

  return NextResponse.json({ ok: true, progress: newProgress, mentalScore });
}
