import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { instingAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";

/**
 * Feature #2 — Insting Speed Log. Aggregates raw attempts into weekly
 * buckets server-side (in JS, not SQL, to keep this readable and portable
 * across drivers) — fine at this data volume for a personal-progress app.
 */
export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const attempts = await db
    .select({
      decisionMs: instingAttempts.decisionMs,
      correct: instingAttempts.correct,
      createdAt: instingAttempts.createdAt,
    })
    .from(instingAttempts)
    .where(eq(instingAttempts.userId, session.userId));

  function isoWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  const buckets = new Map<string, { totalMs: number; count: number; correctCount: number }>();

  for (const a of attempts) {
    const key = isoWeekKey(new Date(a.createdAt));
    const bucket = buckets.get(key) ?? { totalMs: 0, count: 0, correctCount: 0 };
    bucket.totalMs += a.decisionMs;
    bucket.count += 1;
    if (a.correct) bucket.correctCount += 1;
    buckets.set(key, bucket);
  }

  const weeks = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, b]) => ({
      week,
      avgDecisionMs: Math.round(b.totalMs / b.count),
      accuracy: Math.round((b.correctCount / b.count) * 100) / 100,
      attempts: b.count,
    }));

  return NextResponse.json({ weeks });
}
