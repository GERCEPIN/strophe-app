import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { skillComboUnlocks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/requireUser";
import { getAllTrackProgress } from "@/lib/services/levelProgressService";
import { checkNewCombos, getMetCombos, COMBO_RULES } from "@/lib/engine/skillCombo";

export async function GET() {
  const { session, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const trackProgressRows = await getAllTrackProgress(session.userId);

  const trackLevels: Record<string, number> = {};
  for (const row of trackProgressRows) {
    trackLevels[row.track] = row.currentLevel;
  }

  const existingUnlocks = await db
    .select()
    .from(skillComboUnlocks)
    .where(eq(skillComboUnlocks.userId, session.userId));

  const alreadyUnlocked = existingUnlocks.map((u) => u.comboCode);

  const newCombos = checkNewCombos(trackLevels, alreadyUnlocked);

  let newlyInserted: typeof existingUnlocks = [];
  if (newCombos.length > 0) {
    newlyInserted = await db
      .insert(skillComboUnlocks)
      .values(
        newCombos.map((combo) => ({
          userId: session.userId,
          comboCode: combo.code,
          bossLevelTrack: combo.bossTrack,
        }))
      )
      .returning();
  }

  const allUnlocks = await db
    .select()
    .from(skillComboUnlocks)
    .where(eq(skillComboUnlocks.userId, session.userId));

  // getMetCombos for diagnostic purposes (not strictly needed by UI but useful)
  const _metCombos = getMetCombos(trackLevels);
  void _metCombos;

  return NextResponse.json({
    unlocked: allUnlocks,
    newlyUnlocked: newlyInserted,
    allRules: COMBO_RULES,
  });
}
