import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { instingScenarios } from "@/db/schema";
import { requireUser } from "@/lib/auth/requireUser";
import { getRolledOverProgress } from "@/lib/services/levelProgressService";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildCrossCulturalScenarioPrompt, CULTURAL_CONTEXTS, type CulturalContextId } from "@/lib/ai/prompts/crossCulturalScenario";
import { parseInstingScenarioResponse } from "@/lib/validation/instingScenario";

const validIds = CULTURAL_CONTEXTS.map((c) => c.id);

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => ({})) as { culturalContextId?: string };
  const culturalContextId = body?.culturalContextId as CulturalContextId | undefined;

  if (!culturalContextId || !validIds.includes(culturalContextId)) {
    return NextResponse.json(
      { error: "Pilih konteks budaya yang valid." },
      { status: 400 }
    );
  }

  const progress = await getRolledOverProgress(session.userId, "core");
  const { system, user } = buildCrossCulturalScenarioPrompt({
    level: progress.currentLevel,
    culturalContextId,
  });

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
    console.error("Cross-cultural scenario generation failed:", err);
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
      isReverseLevel: false,
      culturalContext: culturalContextId,
      aiGenerated: true,
    })
    .returning();

  return NextResponse.json({
    scenarioId: scenario.id,
    level: scenario.level,
    scenario: scenario.scenarioPrompt,
    options: scenario.options,
    culturalContext: culturalContextId,
  });
}
