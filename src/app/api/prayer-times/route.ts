import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { prayerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/requireUser";

const postSchema = z.object({
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  madhab: z.string().optional(),
});

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const [profile] = await db
    .select()
    .from(prayerProfiles)
    .where(eq(prayerProfiles.userId, session.userId));

  if (!profile || !profile.city || !profile.country) {
    return NextResponse.json(
      { error: "Profil lokasi belum diisi. Pergi ke pengaturan dan isi kota dan negara kamu." },
      { status: 400 }
    );
  }

  let aladhanData: {
    code: number;
    data: {
      timings: Record<string, string>;
      date: { readable: string };
    };
  };

  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(profile.city)}&country=${encodeURIComponent(profile.country)}&method=11`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Tidak bisa mengambil jadwal sholat saat ini. Coba lagi nanti." },
        { status: 503 }
      );
    }
    aladhanData = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Tidak bisa mengambil jadwal sholat saat ini. Coba lagi nanti." },
      { status: 503 }
    );
  }

  if (aladhanData.code !== 200) {
    return NextResponse.json(
      { error: "Tidak bisa mengambil jadwal sholat saat ini. Coba lagi nanti." },
      { status: 503 }
    );
  }

  const timings = aladhanData.data.timings;

  return NextResponse.json({
    city: profile.city,
    country: profile.country,
    date: aladhanData.data.date.readable,
    timings: {
      Subuh: timings.Fajr,
      Dzuhur: timings.Dhuhr,
      Ashar: timings.Asr,
      Maghrib: timings.Maghrib,
      Isya: timings.Isha,
    },
  });
}

export async function POST(req: NextRequest) {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid", details: parsed.error.issues }, { status: 400 });
  }

  const { city, country, madhab } = parsed.data;

  await db
    .insert(prayerProfiles)
    .values({
      userId: session.userId,
      city,
      country,
      madhab: madhab ?? "shafi",
    })
    .onConflictDoUpdate({
      target: [prayerProfiles.userId],
      set: { city, country, madhab: madhab ?? "shafi", updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}
