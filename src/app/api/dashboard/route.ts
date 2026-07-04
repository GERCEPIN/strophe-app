import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { badges, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getAllTrackProgress } from "@/lib/services/levelProgressService";
import { getCurrentMentalScore } from "@/lib/services/mentalScoreService";
import { shouldShowPanicButton } from "@/lib/engine/streak";
import { highestPassedCheckpoint, nextCheckpointLevel } from "@/lib/engine/diamondTier";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, session.userId));
  const tracks = await getAllTrackProgress(session.userId);
  const mentalScore = await getCurrentMentalScore(session.userId);
  const userBadges = await db.select().from(badges).where(eq(badges.userId, session.userId));

  const coreTrack = tracks.find((t) => t.track === "core");
  const diamond = coreTrack
    ? {
        highestPassedCheckpoint: highestPassedCheckpoint(coreTrack.highestLevelReached),
        nextCheckpointLevel: nextCheckpointLevel(coreTrack.currentLevel),
      }
    : null;

  return NextResponse.json({
    user,
    tracks,
    mentalScore,
    showPanicButton: shouldShowPanicButton(mentalScore),
    diamond,
    badges: userBadges,
  });
}
