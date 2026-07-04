import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { memoryVaultReviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { scheduleNextReview } from "@/lib/engine/spacedRepetition";

const reviewSchema = z.object({
  itemId: z.string().uuid(),
  grade: z.number().int().min(0).max(5),
});

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { itemId, grade } = parsed.data;

  const [existing] = await db
    .select()
    .from(memoryVaultReviews)
    .where(and(eq(memoryVaultReviews.userId, session.userId), eq(memoryVaultReviews.itemId, itemId)));

  if (!existing) {
    return NextResponse.json({ error: "Item belum di-unlock untuk user ini" }, { status: 404 });
  }

  const today = todayISO();
  const next = scheduleNextReview(
    { easeFactor: existing.easeFactor, intervalDays: existing.intervalDays, repetitions: existing.repetitions, dueDate: existing.dueDate },
    grade,
    today
  );

  await db
    .update(memoryVaultReviews)
    .set({
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lastGrade: grade,
      lastReviewedAt: new Date(),
    })
    .where(and(eq(memoryVaultReviews.userId, session.userId), eq(memoryVaultReviews.itemId, itemId)));

  return NextResponse.json({ ok: true, nextDueDate: next.dueDate, intervalDays: next.intervalDays });
}
