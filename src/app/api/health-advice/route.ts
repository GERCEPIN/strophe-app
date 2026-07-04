import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { healthProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { chatCompletion } from "@/lib/ai/openrouter";
import { buildProteinAdvicePrompt, buildSkinCareAdvicePrompt } from "@/lib/ai/prompts/healthAdvice";

export async function GET(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const [profile] = await db
    .select()
    .from(healthProfiles)
    .where(eq(healthProfiles.userId, session.userId));

  if (!profile) {
    return NextResponse.json(
      { error: "Profil kesehatan belum diisi. Isi data kesehatan kamu di halaman Profil dulu." },
      { status: 400 }
    );
  }

  if (type === "protein") {
    if (!profile.heightCm || !profile.weightKg) {
      return NextResponse.json(
        { error: "Data tinggi dan berat badan belum diisi di profil kesehatan." },
        { status: 400 }
      );
    }

    const { system, user } = buildProteinAdvicePrompt({
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel ?? "tidak diketahui",
      goal: profile.goal ?? "tidak diketahui",
    });

    const advice = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.6, maxTokens: 400 }
    );

    return NextResponse.json({
      advice,
      type: "protein",
      disclaimer: "Ini panduan umum, bukan rekomendasi medis. Konsultasikan dengan profesional.",
    });
  }

  if (type === "skin") {
    if (!profile.skinType) {
      return NextResponse.json(
        { error: "Tipe kulit belum diisi di profil kesehatan." },
        { status: 400 }
      );
    }

    const { system, user } = buildSkinCareAdvicePrompt({
      skinType: profile.skinType,
      skinConcerns: profile.skinConcerns ?? null,
    });

    const advice = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.6, maxTokens: 400 }
    );

    return NextResponse.json({
      advice,
      type: "skin",
      disclaimer: "Ini panduan umum, bukan rekomendasi medis. Konsultasikan dengan profesional.",
    });
  }

  return NextResponse.json({ error: "Parameter type harus 'protein' atau 'skin'." }, { status: 400 });
}
