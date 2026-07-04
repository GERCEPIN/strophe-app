export interface ComboRule {
  code: string;
  description: string;
  requirements: { track: string; minLevel: number }[];
  bossTrack: "core" | "daya_ingat" | "bahasa_inggris" | "public_speaking" | "jangka_panjang" | "kesehatan" | "keuangan";
}

export const COMBO_RULES: ComboRule[] = [
  {
    code: "memory_master",
    description: "Sesi Inti level 10 + Daya Ingat level 5 — master ingatan dasar",
    requirements: [{ track: "core", minLevel: 10 }, { track: "daya_ingat", minLevel: 5 }],
    bossTrack: "daya_ingat",
  },
  {
    code: "sharp_mind",
    description: "Sesi Inti level 20 + Daya Ingat level 10 — pikiran tajam level lanjut",
    requirements: [{ track: "core", minLevel: 20 }, { track: "daya_ingat", minLevel: 10 }],
    bossTrack: "core",
  },
  {
    code: "long_game_player",
    description: "Sesi Inti level 15 + Jangka Panjang level 5 — pemain jangka panjang",
    requirements: [{ track: "core", minLevel: 15 }, { track: "jangka_panjang", minLevel: 5 }],
    bossTrack: "jangka_panjang",
  },
  {
    code: "confident_speaker",
    description: "Sesi Inti level 15 + Public Speaking level 5 — pembicara percaya diri",
    requirements: [{ track: "core", minLevel: 15 }, { track: "public_speaking", minLevel: 5 }],
    bossTrack: "public_speaking",
  },
  {
    code: "money_mind",
    description: "Sesi Inti level 20 + Keuangan level 5 — mindset keuangan kuat",
    requirements: [{ track: "core", minLevel: 20 }, { track: "keuangan", minLevel: 5 }],
    bossTrack: "keuangan",
  },
];

/** Returns combo rules that are newly unlocked (met requirements but not yet in alreadyUnlocked). */
export function checkNewCombos(
  trackLevels: Record<string, number>,
  alreadyUnlocked: string[]
): ComboRule[] {
  return COMBO_RULES.filter(
    (rule) =>
      !alreadyUnlocked.includes(rule.code) &&
      rule.requirements.every((req) => (trackLevels[req.track] ?? 0) >= req.minLevel)
  );
}

/** Returns all combos currently met by the given track levels (regardless of unlock status). */
export function getMetCombos(trackLevels: Record<string, number>): ComboRule[] {
  return COMBO_RULES.filter((rule) =>
    rule.requirements.every((req) => (trackLevels[req.track] ?? 0) >= req.minLevel)
  );
}
