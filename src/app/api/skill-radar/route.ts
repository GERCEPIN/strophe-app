import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { skillRadarSuggestions, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildSkillRadarPrompt } from "@/lib/ai/prompts/skillRadar";
import { getAllTrackProgress } from "@/lib/services/levelProgressService";

const TRACK_LABELS: Record<string, string> = {
  core: "Sesi Inti",
  daya_ingat: "Daya Ingat",
  bahasa_inggris: "Bahasa Inggris",
  public_speaking: "Public Speaking",
  jangka_panjang: "Jangka Panjang",
  kesehatan: "Kesehatan",
  keuangan: "Keuangan",
};

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const suggestions = await db
    .select()
    .from(skillRadarSuggestions)
    .where(eq(skillRadarSuggestions.userId, session.userId))
    .orderBy(desc(skillRadarSuggestions.createdAt))
    .limit(5);

  return NextResponse.json({ suggestions });
}

export async function POST() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const userId = session.userId;

  const [trackRows, profileRows] = await Promise.all([
    getAllTrackProgress(userId),
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
  ]);

  const profile = profileRows[0] ?? null;

  const trackProgressSummary = trackRows
    .map((r) => `${TRACK_LABELS[r.track] ?? r.track} (${r.track}): level ${r.currentLevel}`)
    .join("\n");

  const { system, user } = buildSkillRadarPrompt({
    trackProgressSummary,
    userGoals: profile?.visi5Tahun ?? null,
  });

  const aiResponse = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 200 }
  );

  const trimmed = aiResponse.trim();

  const [inserted] = await db
    .insert(skillRadarSuggestions)
    .values({
      userId,
      suggestedSkill: trimmed.slice(0, 100),
      reason: trimmed,
    })
    .returning();

  return NextResponse.json({ suggestion: inserted }, { status: 201 });
}
