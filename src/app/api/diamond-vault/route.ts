import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { diamondCheckpoints, badges } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const [checkpoints, userBadges] = await Promise.all([
    db
      .select()
      .from(diamondCheckpoints)
      .where(eq(diamondCheckpoints.userId, session.userId))
      .orderBy(asc(diamondCheckpoints.levelAtCheckpoint)),
    db
      .select()
      .from(badges)
      .where(eq(badges.userId, session.userId)),
  ]);

  return NextResponse.json({ checkpoints, badges: userBadges });
}
