import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { coreSessionContent, coreSessionLogs, userProfiles } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getRolledOverProgress, completeTodayLevel } from "@/lib/services/levelProgressService";
import { recordTodayCompletion } from "@/lib/services/mentalScoreService";
import { isMultipleOfLevel } from "@/lib/engine/leveling";
import { chatCompletion } from "@/lib/ai/openrouter";
import { withCoreRules } from "@/lib/ai/prompts/base";

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
    isKompasAlignmentLevel: isMultipleOfLevel(progress.currentLevel, 20),
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

  let kompasAlignmentNote: string | undefined;

  // Check if the level just completed is a multiple of 20 (Kompas alignment check)
  if (isMultipleOfLevel(newProgress.currentLevel - 1, 20)) {
    try {
      const [profileRow] = await db
        .select({ visi5Tahun: userProfiles.visi5Tahun })
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.userId));

      if (profileRow?.visi5Tahun) {
        const system = withCoreRules(
          "Kamu mengecek keselarasan antara tindakan harian user dengan visi 5 tahun mereka di aplikasi STROPHE. Tulis 2-3 kalimat refleksi singkat: apakah pola progres yang ada (level dan streak) terlihat sejalan dengan visi yang dinyatakan? Jujur dan suportif — bukan hanya pujian kosong."
        );
        const user = `Visi 5 tahun user: ${profileRow.visi5Tahun}\nLevel saat ini: ${newProgress.currentLevel}\nStreak saat ini: ${mentalScore.streakDays} hari\n\nApakah progres ini sejalan dengan visinya?`;
        kompasAlignmentNote = await chatCompletion(
          [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          { maxTokens: 200, temperature: 0.6 }
        );
      }
    } catch (err) {
      console.error("Kompas alignment check failed (non-fatal):", err);
    }
  }

  return NextResponse.json({ ok: true, progress: newProgress, mentalScore, kompasAlignmentNote });
}
