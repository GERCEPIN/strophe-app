import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { instingScenarios, instingAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";

const submitSchema = z.object({
  scenarioId: z.string().uuid(),
  chosenOptionId: z.string().min(1),
  decisionMs: z.number().int().positive().max(120_000),
});

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const { scenarioId, chosenOptionId, decisionMs } = parsed.data;

  const [scenario] = await db.select().from(instingScenarios).where(eq(instingScenarios.id, scenarioId));
  if (!scenario) {
    return NextResponse.json({ error: "Skenario tidak ditemukan" }, { status: 404 });
  }

  const correct = chosenOptionId === scenario.correctOptionId;

  await db.insert(instingAttempts).values({
    userId: session.userId,
    scenarioId,
    chosenOptionId,
    correct,
    decisionMs,
  });

  return NextResponse.json({
    correct,
    correctOptionId: scenario.correctOptionId,
    reasoning: scenario.reasoning,
    decisionMs,
  });
}
