import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { stockCaseStudies, stockCaseStudyAttempts, stockLessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { withCoreRules } from "@/lib/ai/prompts/base";

export async function GET(req: NextRequest) {
  const { unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId wajib diisi" }, { status: 400 });
  }

  const [caseStudy] = await db.select().from(stockCaseStudies).where(eq(stockCaseStudies.lessonId, lessonId));
  if (!caseStudy) {
    return NextResponse.json({ caseStudy: null });
  }

  return NextResponse.json({ caseStudy });
}

const attemptSchema = z.object({
  caseStudyId: z.string().uuid(),
  userAnalysis: z.string().trim().min(10).max(3000),
});

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const { caseStudyId, userAnalysis } = parsed.data;

  const [caseStudy] = await db.select().from(stockCaseStudies).where(eq(stockCaseStudies.id, caseStudyId));
  if (!caseStudy) {
    return NextResponse.json({ error: "Studi kasus tidak ditemukan" }, { status: 404 });
  }
  const [lesson] = await db.select().from(stockLessons).where(eq(stockLessons.id, caseStudy.lessonId));

  const system = withCoreRules(
    `Kamu adalah Coach di Akademi Analisis Saham STROPHE, sedang mengoreksi
CARA BERPIKIR user dalam studi kasus ILUSTRASI (bukan data nyata — jangan
pernah membahasnya seolah nyata). Jangan cuma bilang benar/salah — jelaskan
bagian mana dari alur berpikirnya sudah tepat, bagian mana yang masih
kurang lengkap, dan kenapa. Tulis 3-5 kalimat. Ingatkan lagi bahwa ini
studi kasus ilustrasi kalau relevan.`
  );

  const user = `Materi terkait: "${lesson?.title ?? "Analisis Fundamental"}"
Skenario studi kasus:\n${caseStudy.scenarioText}

Pertanyaan panduan:\n${caseStudy.guidingQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Analisis user:\n${userAnalysis}`;

  let coachFeedback: string | null = null;
  try {
    coachFeedback = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.5, maxTokens: 500 }
    );
  } catch (err) {
    console.error("Case study feedback failed:", err);
    return NextResponse.json({ error: "Coach sedang tidak bisa dihubungi. Coba lagi sebentar lagi." }, { status: 502 });
  }

  const [attempt] = await db
    .insert(stockCaseStudyAttempts)
    .values({ userId: session.userId, caseStudyId, userAnalysis, coachFeedback })
    .returning();

  return NextResponse.json({ attempt });
}
