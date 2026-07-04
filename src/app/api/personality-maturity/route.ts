import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { personalityMaturityReports, decisionJournalEntries } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildPersonalityMaturityPrompt } from "@/lib/ai/prompts/personalityMaturity";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function firstOfMonthISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const reports = await db
    .select()
    .from(personalityMaturityReports)
    .where(eq(personalityMaturityReports.userId, session.userId))
    .orderBy(desc(personalityMaturityReports.monthOf))
    .limit(6);

  return NextResponse.json({ reports });
}

export async function POST() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const monthOf = firstOfMonthISO();

  // Check if report already exists for this month
  const [existing] = await db
    .select()
    .from(personalityMaturityReports)
    .where(
      and(
        eq(personalityMaturityReports.userId, session.userId),
        eq(personalityMaturityReports.monthOf, monthOf)
      )
    );

  if (existing) {
    return NextResponse.json({ report: existing, alreadyExists: true });
  }

  const today = todayISO();
  const thirtyDaysAgo = daysAgoISO(30);
  const sixtyDaysAgo = daysAgoISO(60);

  // Last 30 days
  const recentRows = await db
    .select({ date: decisionJournalEntries.date, decisionText: decisionJournalEntries.decisionText })
    .from(decisionJournalEntries)
    .where(
      and(
        eq(decisionJournalEntries.userId, session.userId),
        gte(decisionJournalEntries.date, thirtyDaysAgo),
        lte(decisionJournalEntries.date, today)
      )
    )
    .orderBy(desc(decisionJournalEntries.date));

  // 30-60 days ago
  const prevRows = await db
    .select({ date: decisionJournalEntries.date, decisionText: decisionJournalEntries.decisionText })
    .from(decisionJournalEntries)
    .where(
      and(
        eq(decisionJournalEntries.userId, session.userId),
        gte(decisionJournalEntries.date, sixtyDaysAgo),
        lte(decisionJournalEntries.date, thirtyDaysAgo)
      )
    )
    .orderBy(desc(decisionJournalEntries.date));

  const recentEntries = recentRows.length
    ? recentRows.map((e) => `- ${e.date}: ${e.decisionText}`).join("\n")
    : "(tidak ada entri)";

  const prevEntries = prevRows.length
    ? prevRows.map((e) => `- ${e.date}: ${e.decisionText}`).join("\n")
    : "tidak ada";

  const { system, user } = buildPersonalityMaturityPrompt({
    recentEntries,
    prevEntries,
    entriesCount: recentRows.length,
  });

  const reportText = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 350 }
  );

  const [inserted] = await db
    .insert(personalityMaturityReports)
    .values({
      userId: session.userId,
      monthOf,
      reportText,
      entriesAnalyzed: recentRows.length,
    })
    .returning();

  return NextResponse.json({ report: inserted, alreadyExists: false });
}
