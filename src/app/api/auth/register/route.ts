import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { users, levelProgress, mentalScoreLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email sudah terdaftar. Coba login." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, email: users.email });

  // Initialize the "core" track so the dashboard has something to show
  // immediately after registering (Level Tanpa Batas starts at level 1).
  const today = new Date().toISOString().slice(0, 10);
  await db.insert(levelProgress).values({ userId: user.id, track: "core", lastActiveDate: today });
  await db.insert(mentalScoreLog).values({ userId: user.id, date: today, mentalScore: 60, streakDays: 0 });

  await setSessionCookie({ userId: user.id, email: user.email });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name } }, { status: 201 });
}
