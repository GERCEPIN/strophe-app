import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { userProfiles, healthProfiles, financeProfiles, prayerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { onboardingSchema } from "@/lib/validation/onboarding";
import { requireUser } from "@/lib/auth/requireUser";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, session.userId));
  const [health] = await db.select().from(healthProfiles).where(eq(healthProfiles.userId, session.userId));
  const [finance] = await db.select().from(financeProfiles).where(eq(financeProfiles.userId, session.userId));
  const [prayer] = await db.select().from(prayerProfiles).where(eq(prayerProfiles.userId, session.userId));

  return NextResponse.json({ profile: profile ?? null, health: health ?? null, finance: finance ?? null, prayer: prayer ?? null });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { vision, health, finance, prayer } = parsed.data;
  const userId = session.userId;

  if (vision) {
    await db
      .insert(userProfiles)
      .values({
        userId,
        visi5Tahun: vision.visi5Tahun,
        blueprintBisnis: vision.blueprintBisnis,
        onboardingCompletedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          visi5Tahun: vision.visi5Tahun,
          blueprintBisnis: vision.blueprintBisnis,
          onboardingCompletedAt: new Date(),
        },
      });
  }

  if (health) {
    await db
      .insert(healthProfiles)
      .values({ userId, ...health, updatedAt: new Date() })
      .onConflictDoUpdate({ target: healthProfiles.userId, set: { ...health, updatedAt: new Date() } });
  }

  if (finance) {
    await db
      .insert(financeProfiles)
      .values({ userId, ...finance, updatedAt: new Date() })
      .onConflictDoUpdate({ target: financeProfiles.userId, set: { ...finance, updatedAt: new Date() } });
  }

  if (prayer) {
    await db
      .insert(prayerProfiles)
      .values({ userId, ...prayer, updatedAt: new Date() })
      .onConflictDoUpdate({ target: prayerProfiles.userId, set: { ...prayer, updatedAt: new Date() } });
  }

  return NextResponse.json({ ok: true });
}
