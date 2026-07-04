import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { worldPerspectiveLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { desc } from "drizzle-orm";

function mondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const entries = await db
    .select()
    .from(worldPerspectiveLogs)
    .where(eq(worldPerspectiveLogs.userId, session.userId))
    .orderBy(desc(worldPerspectiveLogs.weekOf))
    .limit(20);

  return NextResponse.json({ entries });
}

const postSchema = z.object({
  insightText: z.string().trim().min(10).max(2000),
  comparisonOldThinking: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid. Insight minimal 10 karakter." }, { status: 400 });
  }

  const weekOf = mondayOfCurrentWeek();
  const { insightText, comparisonOldThinking } = parsed.data;

  const [entry] = await db
    .insert(worldPerspectiveLogs)
    .values({
      userId: session.userId,
      weekOf,
      insightText,
      comparisonOldThinking,
    })
    .returning();

  return NextResponse.json({ entry });
}
