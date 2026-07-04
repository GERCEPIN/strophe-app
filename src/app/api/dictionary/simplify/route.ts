import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { personalDictionary } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildAutoSimplifierPrompt } from "@/lib/ai/prompts/autoSimplifier";

const simplifySchema = z.object({
  term: z.string().trim().min(1).max(200),
  context: z.string().trim().max(1000).default(""),
});

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = simplifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { term, context } = parsed.data;

  const [existing] = await db
    .select()
    .from(personalDictionary)
    .where(and(eq(personalDictionary.userId, session.userId), eq(personalDictionary.term, term)));

  const nextLevel = existing ? existing.simplificationLevel + 1 : 1;

  const { system, user } = buildAutoSimplifierPrompt({ term, context, simplificationLevel: nextLevel });

  let explanation: string;
  try {
    explanation = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.5, maxTokens: 300 }
    );
  } catch (err) {
    console.error("Auto-Simplifier failed:", err);
    return NextResponse.json({ error: "Gagal menjelaskan istilah lewat AI. Coba lagi." }, { status: 502 });
  }

  if (existing) {
    await db
      .update(personalDictionary)
      .set({ simplifiedExplanation: explanation, simplificationLevel: nextLevel, originalContext: context })
      .where(eq(personalDictionary.id, existing.id));
  } else {
    await db.insert(personalDictionary).values({
      userId: session.userId,
      term,
      simplifiedExplanation: explanation,
      simplificationLevel: nextLevel,
      originalContext: context,
    });
  }

  return NextResponse.json({ term, explanation, simplificationLevel: nextLevel });
}

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const entries = await db
    .select()
    .from(personalDictionary)
    .where(eq(personalDictionary.userId, session.userId))
    .orderBy(personalDictionary.term);

  return NextResponse.json({ entries });
}
