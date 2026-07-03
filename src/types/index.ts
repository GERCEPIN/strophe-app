// ============================================================
// STROPHE — Core Domain Types
// Single source of truth for every persisted entity.
// Keep this file dependency-free (no imports from engine/storage)
// so it can be safely imported everywhere without cycles.
// ============================================================

/** Local calendar date, "YYYY-MM-DD", always in the device's local timezone. */
export type ISODateString = string;

export interface UserProfile {
  id: string; // local UUID; single-user app today, but keeps schema future-proof
  displayName: string;
  originLanguage: string; // calibrates Auto-Simplifier + English Shadow Mode starting point
  timezone: string; // IANA tz, e.g. "Asia/Jakarta"
  onboardedAt: ISODateString;
  modulesEnabled: {
    kesehatan: boolean;
    keuangan: boolean;
    // Ibadah has no toggle here — finalized for Islam, personal use (see CLAUDE.md).
  };
}

/**
 * The numbers that MUST stay in three separate fields — never collapse
 * these into one "score". See TECHNICAL_SPEC.md §2 for the full rationale
 * and a worked day-by-day example.
 */
export interface ProgressState {
  currentLevel: number; // starts at 0, becomes 1 after the first completed session. Never decreases.
  lastAdvancedDate: ISODateString | null; // last calendar date a Core Session was completed
  mentalScore: number; // 0-100
  growthIndexHistory: GrowthIndexSnapshot[]; // one snapshot per week
}

export interface GrowthIndexSnapshot {
  date: ISODateString;
  instingSpeedAccuracy: number; // 0-100
  ketelitianAccuracy: number; // 0-100
  memoryRecallTrend: number; // 0-100
  decisionJournalQuality: number; // 0-100, AI-scored pattern shift (reaktif -> deliberatif)
  honestyReportShrinkage: number; // 0-100, inverse of "same weakness keeps repeating"
  visionAlignmentPct: number; // 0-100, from Kompas 5 Tahun self-tagging
  composite: number; // weighted sum — see engine/growthIndex.ts
}

export type StationId = 'disiplin' | 'insting' | 'ketelitian' | 'mentalTangguh' | 'percayaDiri';

export interface SessionStationResult {
  station: StationId;
  completedAt: string; // full ISO datetime
  reactionTimeMs?: number; // insting
  accuracyPct?: number; // ketelitian
  freeTextResponse?: string; // mentalTangguh / percayaDiri / disiplin journal
}

export interface DailyCoreSession {
  date: ISODateString;
  level: number;
  stations: SessionStationResult[];
  completed: boolean;
}

export type SkillTrackId =
  | 'dayaIngat'
  | 'englishShadow'
  | 'publicSpeaking'
  | 'kesehatan'
  | 'keuangan';

export interface SkillTrackProgress {
  trackId: SkillTrackId;
  unlockedAt: ISODateString | null;
  level: number; // independent per-track level, same daily-advance rules as ProgressState.currentLevel
  lastAdvancedDate: ISODateString | null;
}

/** Leitner-box spaced repetition item that powers the Memory Vault. */
export interface MemoryVaultItem {
  id: string;
  content: string; // the word / fact / paragraph-fact being tested
  box: 1 | 2 | 3 | 4 | 5; // Leitner box; 1 = reviewed most often
  lastReviewedDate: ISODateString | null;
  dueDate: ISODateString;
  correctStreak: number;
}

export interface DecisionJournalEntry {
  id: string;
  date: ISODateString;
  decision: string;
  reasoningType?: 'reaktif' | 'deliberatif'; // tagged by the AI Coach after the fact
}

export interface KompasVisi {
  fiveYearVision: string;
  setAt: ISODateString;
  lastCheckedLevel: number;
}

export interface Blueprint {
  oneLiner: string;
  yearlyTargets: string[];
  monthlyTargets: string[];
  weeklyTargets: string[];
  lastReviewedAt: ISODateString | null;
}

export interface DiamondState {
  tier: number; // floor(currentLevel / 50)
  badgesEarned: number[]; // level numbers at which a Diamond Checkpoint was passed
  vaultEntries: { level: number; note: string }[];
}

export interface IbadahSettings {
  city: string;
  calculationMethod: 'kemenag' | 'default';
  remindersEnabled: {
    sholat: boolean;
    dzikirPagiPetang: boolean;
    puasaSunnah: boolean;
  };
}

export interface FinanceSettings {
  incomeRangeMonthly?: string; // bucketed range, never an exact figure — privacy by design
  hasDebt?: boolean;
  riskProfile?: 'konservatif' | 'moderat' | 'agresif';
  goalsShortTerm?: string;
  goalsLongTerm?: string;
}
