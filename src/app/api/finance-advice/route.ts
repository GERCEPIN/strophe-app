import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { financeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildFinanceAdvicePrompt } from "@/lib/ai/prompts/financeAdvice";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const [profile] = await db
    .select()
    .from(financeProfiles)
    .where(eq(financeProfiles.userId, session.userId));

  if (!profile || !profile.incomeRange || !profile.financialGoal) {
    return NextResponse.json(
      { error: "Profil keuangan belum diisi. Isi data keuangan di halaman Profil dulu." },
      { status: 400 }
    );
  }

  const { system, user } = buildFinanceAdvicePrompt({
    incomeRange: profile.incomeRange,
    monthlyExpenseRange: profile.monthlyExpenseRange ?? "tidak diketahui",
    financialGoal: profile.financialGoal,
    notes: profile.notes ?? null,
  });

  const advice = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.5, maxTokens: 400 }
  );

  return NextResponse.json({ advice });
}
