import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { decisionJournalEntries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getAllTrackProgress } from "@/lib/services/levelProgressService";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildCrossSkillInsightPrompt } from "@/lib/ai/prompts/crossSkillInsight";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const trackProgressRows = await getAllTrackProgress(session.userId);

  const trackProgressSummary = trackProgressRows
    .map((r) => `- ${r.track}: level saat ini ${r.currentLevel}, level tertinggi ${r.highestLevelReached}`)
    .join("\n");

  const recentDecisionRows = await db
    .select({ date: decisionJournalEntries.date, decisionText: decisionJournalEntries.decisionText })
    .from(decisionJournalEntries)
    .where(eq(decisionJournalEntries.userId, session.userId))
    .orderBy(desc(decisionJournalEntries.createdAt))
    .limit(5);

  const recentDecisions = recentDecisionRows.length
    ? recentDecisionRows.map((e) => `- ${e.date}: ${e.decisionText}`).join("\n")
    : undefined;

  const { system, user } = buildCrossSkillInsightPrompt({ trackProgressSummary, recentDecisions });

  const insight = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 250 }
  );

  return NextResponse.json({ insight, generatedAt: new Date().toISOString() });
}
