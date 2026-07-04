import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { stockLessons } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { getRolledOverStockProgress, completeStockLevel, type StockCategory } from "@/lib/services/stockLevelService";

const categorySchema = z.enum([
  "fundamental",
  "teknikal",
  "makro_sektoral",
  "sentimen_berita",
  "manajemen_risiko",
  "legal_compliance",
]);

async function fetchLessonForLevel(category: StockCategory, level: number) {
  const [exact] = await db
    .select()
    .from(stockLessons)
    .where(and(eq(stockLessons.category, category), eq(stockLessons.level, level)));
  if (exact) return { lesson: exact, recycled: false };

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(stockLessons)
    .where(eq(stockLessons.category, category));

  if (total === 0) return { lesson: null, recycled: false };

  const cycledLevel = ((level - 1) % total) + 1;
  const [fallback] = await db
    .select()
    .from(stockLessons)
    .where(and(eq(stockLessons.category, category), eq(stockLessons.level, cycledLevel)));
  return { lesson: fallback ?? null, recycled: true };
}

export async function GET(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const categoryParam = req.nextUrl.searchParams.get("category") ?? "fundamental";
  const parsedCategory = categorySchema.safeParse(categoryParam);
  if (!parsedCategory.success) {
    return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
  }
  const category = parsedCategory.data;

  const progress = await getRolledOverStockProgress(session.userId, category);
  const { lesson, recycled } = await fetchLessonForLevel(category, progress.currentLevel);

  return NextResponse.json({
    category,
    level: progress.currentLevel,
    lesson,
    lessonRecycledFromEarlierLevel: recycled,
  });
}

const completeSchema = z.object({ category: categorySchema });

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const progress = await completeStockLevel(session.userId, parsed.data.category);
  return NextResponse.json({ ok: true, progress });
}
