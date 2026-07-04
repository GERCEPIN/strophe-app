import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { decisionJournalEntries, aiMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { withCoreRules } from "@/lib/ai/prompts/base";

const createSchema = z.object({
  decisionText: z.string().trim().min(3).max(2000),
  context: z.string().trim().max(2000).optional(),
});

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const entries = await db
    .select()
    .from(decisionJournalEntries)
    .where(eq(decisionJournalEntries.userId, session.userId))
    .orderBy(desc(decisionJournalEntries.date))
    .limit(50);

  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { decisionText, context } = parsed.data;

  // Feature #22 — AI analyzes patterns across time, so give it recent history for context.
  const recentEntries = await db
    .select({ date: decisionJournalEntries.date, decisionText: decisionJournalEntries.decisionText })
    .from(decisionJournalEntries)
    .where(eq(decisionJournalEntries.userId, session.userId))
    .orderBy(desc(decisionJournalEntries.date))
    .limit(10);

  const historyText = recentEntries.length
    ? recentEntries.map((e) => `- ${e.date}: ${e.decisionText}`).join("\n")
    : "(belum ada entri sebelumnya)";

  const system = withCoreRules(
    `Kamu menganalisis pola pengambilan keputusan user di "Decision Journal"
aplikasi STROPHE. HANYA berdasarkan entri yang diberikan — jangan
menambah asumsi di luar data. Tulis 1-2 kalimat singkat yang menunjukkan
pola (kalau ada) antara keputusan hari ini dengan keputusan-keputusan
sebelumnya. Kalau belum cukup data untuk melihat pola, katakan itu terus
terang, jangan dipaksakan.`
  );

  const user = `Riwayat keputusan sebelumnya:\n${historyText}\n\nKeputusan hari ini: "${decisionText}"${
    context ? `\nKonteks tambahan: ${context}` : ""
  }`;

  let aiPatternNote: string | null = null;
  try {
    aiPatternNote = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.5, maxTokens: 200 }
    );
  } catch (err) {
    console.error("Decision journal analysis failed:", err);
    // Non-fatal — the entry is still worth saving even if the AI note fails.
  }

  const [entry] = await db
    .insert(decisionJournalEntries)
    .values({
      userId: session.userId,
      date: todayISO(),
      decisionText,
      context,
      aiPatternNote,
    })
    .returning();

  if (aiPatternNote) {
    await db.insert(aiMessages).values([
      { userId: session.userId, feature: "decision_journal_analysis", role: "user", content: user },
      { userId: session.userId, feature: "decision_journal_analysis", role: "assistant", content: aiPatternNote },
    ]);
  }

  return NextResponse.json({ entry });
}
