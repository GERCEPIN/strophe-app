import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { instingScenarios, instingAttempts } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getRolledOverProgress } from "@/lib/services/levelProgressService";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildInstingScenarioPrompt } from "@/lib/ai/prompts/instingScenario";
import { parseInstingScenarioResponse } from "@/lib/validation/instingScenario";

async function reverseLevelUsedThisWeek(userId: string): Promise<boolean> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const rows = await db
    .select({ id: instingAttempts.id })
    .from(instingAttempts)
    .innerJoin(instingScenarios, eq(instingAttempts.scenarioId, instingScenarios.id))
    .where(
      and(
        eq(instingAttempts.userId, userId),
        eq(instingScenarios.isReverseLevel, true),
        gte(instingAttempts.createdAt, weekAgo)
      )
    )
    .limit(1);

  return rows.length > 0;
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({}));
  const wantReverseLevel = Boolean(body?.wantReverseLevel);

  const progress = await getRolledOverProgress(session.userId, "core");

  // Feature #3 — Reverse Level (Uji Nyali): max 1x/week to avoid excess frustration.
  const isReverseLevel = wantReverseLevel && !(await reverseLevelUsedThisWeek(session.userId));
  if (wantReverseLevel && !isReverseLevel) {
    return NextResponse.json(
      { error: "Reverse Level (Uji Nyali) cuma bisa 1x per minggu. Coba lagi minggu depan." },
      { status: 429 }
    );
  }

  const { system, user } = buildInstingScenarioPrompt({ level: progress.currentLevel, isReverseLevel });

  let parsed;
  try {
    const raw = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.9, maxTokens: 500 }
    );
    parsed = parseInstingScenarioResponse(raw);
  } catch (err) {
    console.error("Insting scenario generation failed:", err);
    return NextResponse.json(
      { error: "Gagal membuat skenario dari AI. Coba lagi sebentar lagi." },
      { status: 502 }
    );
  }

  const [scenario] = await db
    .insert(instingScenarios)
    .values({
      level: progress.currentLevel,
      scenarioPrompt: parsed.scenario,
      options: parsed.options,
      correctOptionId: parsed.correctOptionId,
      reasoning: parsed.reasoning,
      isReverseLevel,
      aiGenerated: true,
    })
    .returning();

  // Never send the answer to the client before they've decided.
  return NextResponse.json({
    scenarioId: scenario.id,
    level: scenario.level,
    scenario: scenario.scenarioPrompt,
    options: scenario.options,
    isReverseLevel: scenario.isReverseLevel,
  });
}
