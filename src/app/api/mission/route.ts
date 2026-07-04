import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { realLifeMissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildRealLifeMissionPrompt } from "@/lib/ai/prompts/realLifeMission";
import { getRolledOverProgress } from "@/lib/services/levelProgressService";

const postSchema = z.object({
  isZonaNyamanBreaker: z.boolean().optional(),
});

const patchSchema = z.object({
  missionId: z.string().uuid(),
  reportText: z.string().min(10).max(2000),
});

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const missions = await db
    .select()
    .from(realLifeMissions)
    .where(eq(realLifeMissions.userId, session.userId))
    .orderBy(desc(realLifeMissions.createdAt))
    .limit(10);

  return NextResponse.json({ missions });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { isZonaNyamanBreaker = false } = parsed.data;
  const userId = session.userId;

  const progress = await getRolledOverProgress(userId, "core");
  const currentLevel = progress.currentLevel;

  const recentRows = await db
    .select({ missionText: realLifeMissions.missionText })
    .from(realLifeMissions)
    .where(eq(realLifeMissions.userId, userId))
    .orderBy(desc(realLifeMissions.createdAt))
    .limit(3);

  const recentMissions = recentRows.map((r) => r.missionText);

  const { system, user } = buildRealLifeMissionPrompt({
    currentLevel,
    isZonaNyamanBreaker,
    recentMissions,
  });

  const aiResponse = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.8, maxTokens: 100 }
  );

  const [inserted] = await db
    .insert(realLifeMissions)
    .values({
      userId,
      missionText: aiResponse.trim(),
      category: isZonaNyamanBreaker ? "zona_nyaman_breaker" : "normal",
      status: "assigned",
    })
    .returning();

  return NextResponse.json({ mission: inserted }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid", details: parsed.error.issues }, { status: 400 });
  }

  const { missionId, reportText } = parsed.data;
  const userId = session.userId;

  const [existing] = await db
    .select()
    .from(realLifeMissions)
    .where(eq(realLifeMissions.id, missionId));

  if (!existing) {
    return NextResponse.json({ error: "Misi tidak ditemukan." }, { status: 404 });
  }

  if (existing.userId !== userId) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  }

  const [updated] = await db
    .update(realLifeMissions)
    .set({
      status: "reported",
      reportText,
      reportedAt: new Date(),
    })
    .where(eq(realLifeMissions.id, missionId))
    .returning();

  return NextResponse.json({ ok: true, mission: updated });
}
