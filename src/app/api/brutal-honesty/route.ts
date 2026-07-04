import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { brutalHonestyReports, coreSessionLogs, mentalScoreLog } from "@/db/schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildBrutalHonestyPrompt } from "@/lib/ai/prompts/brutalHonesty";
import { getCurrentMentalScore } from "@/lib/services/mentalScoreService";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = (day === 0 ? -6 : 1 - day); // offset to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function sevenDaysAgoISO(): string {
  return new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const reports = await db
    .select()
    .from(brutalHonestyReports)
    .where(eq(brutalHonestyReports.userId, session.userId))
    .orderBy(desc(brutalHonestyReports.weekOf))
    .limit(4);

  return NextResponse.json({ reports });
}

export async function POST() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const userId = session.userId;
  const weekOf = getWeekStart();
  const sevenDaysAgo = sevenDaysAgoISO();
  const today = todayISO();

  // Check if report already exists for this week
  const [existing] = await db
    .select()
    .from(brutalHonestyReports)
    .where(and(eq(brutalHonestyReports.userId, userId), eq(brutalHonestyReports.weekOf, weekOf)));

  if (existing) {
    return NextResponse.json({ alreadyExists: true, report: existing });
  }

  // Compute weekly data
  const sessionLogs = await db
    .select({ completed: coreSessionLogs.completed, date: coreSessionLogs.date })
    .from(coreSessionLogs)
    .where(
      and(
        eq(coreSessionLogs.userId, userId),
        gte(coreSessionLogs.date, sevenDaysAgo),
        lte(coreSessionLogs.date, today)
      )
    );

  const totalSessions = sessionLogs.length;
  const completedSessions = sessionLogs.filter((s) => s.completed).length;

  const scoreLogs = await db
    .select({ mentalScore: mentalScoreLog.mentalScore, date: mentalScoreLog.date })
    .from(mentalScoreLog)
    .where(
      and(
        eq(mentalScoreLog.userId, userId),
        gte(mentalScoreLog.date, sevenDaysAgo),
        lte(mentalScoreLog.date, today)
      )
    )
    .orderBy(mentalScoreLog.date);

  const mentalState = await getCurrentMentalScore(userId);

  let minScore = mentalState.mentalScore;
  let maxScore = mentalState.mentalScore;
  let latestScore = mentalState.mentalScore;

  if (scoreLogs.length > 0) {
    const scores = scoreLogs.map((s) => s.mentalScore);
    minScore = Math.min(...scores);
    maxScore = Math.max(...scores);
    latestScore = scoreLogs[scoreLogs.length - 1].mentalScore;
  }

  const weeklyDataSummary = `Minggu ini (${weekOf}):
- Sesi Inti selesai: ${completedSessions}/${totalSessions} hari
- Mental score: dari ${minScore} ke ${maxScore}, saat ini ${latestScore}/100
- Streak saat ini: ${mentalState.streakDays} hari`;

  const { system, user } = buildBrutalHonestyPrompt({ weeklyDataSummary });

  const aiResponse = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 250 }
  );

  const sentences = aiResponse
    .split(". ")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const oneSmallStep = sentences[sentences.length - 1] ?? aiResponse.trim();

  const [inserted] = await db
    .insert(brutalHonestyReports)
    .values({
      userId,
      weekOf,
      weaknessesText: aiResponse.trim(),
      oneSmallStep,
    })
    .returning();

  return NextResponse.json({ report: inserted }, { status: 201 });
}
