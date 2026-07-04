import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { hygieneChecklistLogs } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { desc } from "drizzle-orm";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const today = todayISO();
  const sevenDaysAgo = daysAgoISO(7);

  const history = await db
    .select()
    .from(hygieneChecklistLogs)
    .where(
      and(
        eq(hygieneChecklistLogs.userId, session.userId),
        gte(hygieneChecklistLogs.date, sevenDaysAgo)
      )
    )
    .orderBy(desc(hygieneChecklistLogs.date));

  const todayLog = history.find((h) => h.date === today) ?? null;

  return NextResponse.json({ todayLog, history });
}

const postSchema = z.object({
  completedItems: z.array(z.string()).min(0),
});

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const today = todayISO();
  const { completedItems } = parsed.data;

  const [log] = await db
    .insert(hygieneChecklistLogs)
    .values({
      userId: session.userId,
      date: today,
      completedItems,
    })
    .onConflictDoUpdate({
      target: [hygieneChecklistLogs.userId, hygieneChecklistLogs.date],
      set: { completedItems },
    })
    .returning();

  return NextResponse.json({ log });
}
