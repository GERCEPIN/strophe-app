import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { futureSelfSimulations, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildFutureSelfSimulatorPrompt } from "@/lib/ai/prompts/futureSelfSimulator";
import { getAllTrackProgress } from "@/lib/services/levelProgressService";
import { getCurrentMentalScore } from "@/lib/services/mentalScoreService";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const simulations = await db
    .select()
    .from(futureSelfSimulations)
    .where(eq(futureSelfSimulations.userId, session.userId))
    .orderBy(desc(futureSelfSimulations.createdAt))
    .limit(5);

  return NextResponse.json({ simulations });
}

export async function POST() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const userId = session.userId;

  const [trackRows, mentalState, profileRows] = await Promise.all([
    getAllTrackProgress(userId),
    getCurrentMentalScore(userId),
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
  ]);

  const profile = profileRows[0] ?? null;

  const trackLabels: Record<string, string> = {
    core: "Sesi Inti",
    daya_ingat: "Daya Ingat",
    bahasa_inggris: "Bahasa Inggris",
    public_speaking: "Public Speaking",
    jangka_panjang: "Jangka Panjang",
    kesehatan: "Kesehatan",
    keuangan: "Keuangan",
  };

  const coreRow = trackRows.find((r) => r.track === "core");
  const coreLevel = coreRow?.currentLevel ?? 1;

  const trackSummaryParts = trackRows.map(
    (r) => `Level ${r.currentLevel} di ${trackLabels[r.track] ?? r.track}`
  );
  const progressSummary = [
    ...trackSummaryParts,
    `streak ${mentalState.streakDays} hari`,
    `mental score ${mentalState.mentalScore}/100`,
  ].join(", ");

  const { system, user } = buildFutureSelfSimulatorPrompt({
    progressSummary,
    visi5Tahun: profile?.visi5Tahun ?? null,
  });

  const narrativeText = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.7, maxTokens: 300 }
  );

  const [inserted] = await db
    .insert(futureSelfSimulations)
    .values({
      userId,
      basedOnLevel: coreLevel,
      narrativeText,
    })
    .returning();

  return NextResponse.json({ simulation: inserted }, { status: 201 });
}
