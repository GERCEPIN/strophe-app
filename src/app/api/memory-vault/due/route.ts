import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { memoryVaultItems, memoryVaultReviews } from "@/db/schema";
import { eq, and, lte, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getRolledOverProgress } from "@/lib/services/levelProgressService";
import { createInitialReviewState, isDue } from "@/lib/engine/spacedRepetition";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const progress = await getRolledOverProgress(session.userId, "daya_ingat");
  const today = todayISO();

  // Unlock every item up to the user's current daya_ingat level.
  const unlockedItems = await db
    .select()
    .from(memoryVaultItems)
    .where(lte(memoryVaultItems.level, progress.currentLevel));

  if (unlockedItems.length === 0) {
    return NextResponse.json({ level: progress.currentLevel, due: [] });
  }

  const existingReviews = await db
    .select()
    .from(memoryVaultReviews)
    .where(
      and(
        eq(memoryVaultReviews.userId, session.userId),
        inArray(
          memoryVaultReviews.itemId,
          unlockedItems.map((i) => i.id)
        )
      )
    );

  const reviewByItemId = new Map(existingReviews.map((r) => [r.itemId, r]));

  // Lazily create review state for newly-unlocked items (SM-2 default: due immediately).
  const toCreate = unlockedItems.filter((i) => !reviewByItemId.has(i.id));
  if (toCreate.length > 0) {
    const initial = createInitialReviewState(today);
    await db.insert(memoryVaultReviews).values(
      toCreate.map((item) => ({
        userId: session.userId,
        itemId: item.id,
        easeFactor: initial.easeFactor,
        intervalDays: initial.intervalDays,
        repetitions: initial.repetitions,
        dueDate: initial.dueDate,
      }))
    );
  }

  // Re-fetch to get a complete, consistent view including just-created rows.
  const allReviews = await db
    .select()
    .from(memoryVaultReviews)
    .where(
      and(
        eq(memoryVaultReviews.userId, session.userId),
        inArray(
          memoryVaultReviews.itemId,
          unlockedItems.map((i) => i.id)
        )
      )
    );

  const itemById = new Map(unlockedItems.map((i) => [i.id, i]));

  const due = allReviews
    .filter((r) => isDue({ easeFactor: r.easeFactor, intervalDays: r.intervalDays, repetitions: r.repetitions, dueDate: r.dueDate }, today))
    .map((r) => {
      const item = itemById.get(r.itemId)!;
      return {
        itemId: item.id,
        term: item.term,
        prompt: item.prompt,
        answer: item.answer,
        explanation: item.explanation,
        level: item.level,
        repetitions: r.repetitions,
      };
    });

  return NextResponse.json({ level: progress.currentLevel, due: shuffle(due) });
}
