/**
 * STROPHE — Database Schema
 * ==========================
 * This file is the single source of truth for every data model in the app.
 * It is organized to mirror the feature spec 1:1 (sections A–K + the Akademi
 * Analisis Saham module) so anyone extending the app — human or Claude Code —
 * can find "where does feature #N live" in seconds.
 *
 * Engine (Postgres via Neon) — chosen so the exact same schema/driver works
 * in Termux during development and on Vercel in production. No native
 * binaries, no separate SQLite migration story.
 */

import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  uuid,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────

/** Every progression track a user can level up in. "core" = Sesi Inti. */
export const trackEnum = pgEnum("track", [
  "core", // Sesi Inti: disiplin, insting, ketelitian, mental tangguh, percaya diri
  "daya_ingat", // Memory Vault / spaced repetition
  "bahasa_inggris", // English Shadow Mode
  "public_speaking",
  "jangka_panjang", // long-term thinking
  "kesehatan",
  "keuangan",
]);

export const stockCategoryEnum = pgEnum("stock_category", [
  "fundamental",
  "teknikal",
  "makro_sektoral",
  "sentimen_berita",
  "manajemen_risiko",
  "legal_compliance",
]);

export const aiFeatureEnum = pgEnum("ai_feature", [
  "investor_coach",
  "decision_journal_analysis",
  "future_self_simulator",
  "brutal_honesty_report",
  "global_mentor",
  "auto_simplifier",
  "insting_scenario",
]);

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system"]);

export const goalEnum = pgEnum("body_goal", ["kurus", "ideal", "otot"]);

export const skinTypeEnum = pgEnum("skin_type", ["kering", "oily", "sensitif", "kombinasi", "normal"]);

export const missionStatusEnum = pgEnum("mission_status", ["assigned", "reported"]);

export const mentorPersonaEnum = pgEnum("mentor_persona", [
  "netral",
  "disiplin_jepang",
  "keberanian_barat",
  "ketekunan_jerman",
  "harmoni_nordik",
  "ketegasan_korea",
]);

// ─────────────────────────────────────────────────────────────────────────
// Auth / Identity
// ─────────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Jakarta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

// ─────────────────────────────────────────────────────────────────────────
// Onboarding / Profile — Kompas 5 Tahun, Blueprint 1-5-10 (feature 23, 27)
// ─────────────────────────────────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  visi5Tahun: text("visi_5_tahun"), // Kompas 5 Tahun — feature 23
  blueprintBisnis: jsonb("blueprint_bisnis").$type<{
    tahun1?: string;
    tahun5?: string;
    tahun10?: string;
    targetTahunan?: string[];
    targetBulanan?: string[];
    targetMingguan?: string[];
  }>(), // Blueprint 1-5-10 Tahun — feature 27
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
});

/** ⚠️ Feature 29 — WAJIB tanya data user dulu, dilarang mengarang angka. */
export const healthProfiles = pgTable("health_profiles", {
  userId: uuid("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  activityLevel: text("activity_level"), // sedentary / light / moderate / active / very_active
  goal: goalEnum("goal"),
  skinType: skinTypeEnum("skin_type"), // Feature 30 — Perawatan Wajah
  skinConcerns: text("skin_concerns"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** ⚠️ Feature 33 — WAJIB tanya kondisi keuangan user dulu. */
export const financeProfiles = pgTable("finance_profiles", {
  userId: uuid("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  incomeRange: text("income_range"),
  monthlyExpenseRange: text("monthly_expense_range"),
  financialGoal: text("financial_goal"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** ⚠️ Feature 32 — WAJIB tanya lokasi, pakai sumber jadwal sholat resmi. */
export const prayerProfiles = pgTable("prayer_profiles", {
  userId: uuid("user_id").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  city: text("city"),
  country: text("country"),
  madhab: text("madhab").default("shafi"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────
// B. Leveling core — infinite levels, daily carry-over (rule #1, #2)
// ─────────────────────────────────────────────────────────────────────────

export const levelProgress = pgTable("level_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  track: trackEnum("track").notNull(),
  currentLevel: integer("current_level").notNull().default(1),
  highestLevelReached: integer("highest_level_reached").notNull().default(1),
  levelCompletedToday: boolean("level_completed_today").notNull().default(false),
  lastActiveDate: date("last_active_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userTrackIdx: uniqueIndex("level_progress_user_track_idx").on(t.userId, t.track),
}));

/** D. Streak Ganas (feature 11) — missing a day lowers mental score, never resets level. */
export const mentalScoreLog = pgTable("mental_score_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mentalScore: integer("mental_score").notNull(), // 0-100
  streakDays: integer("streak_days").notNull().default(0),
  missedDay: boolean("missed_day").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userDateIdx: uniqueIndex("mental_score_user_date_idx").on(t.userId, t.date),
}));

/** J. Diamond Tier System (feature 34) — checkpoint every 50 levels, permanent badge. */
export const diamondCheckpoints = pgTable("diamond_checkpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  track: trackEnum("track").notNull(),
  levelAtCheckpoint: integer("level_at_checkpoint").notNull(), // 50, 100, 150...
  passedAt: timestamp("passed_at", { withTimezone: true }),
  badgePermanent: boolean("badge_permanent").notNull().default(true), // Diamond Reset Protection
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userTrackLevelIdx: uniqueIndex("diamond_user_track_level_idx").on(t.userId, t.track, t.levelAtCheckpoint),
}));

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  permanent: boolean("permanent").notNull().default(true),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────
// A/B. Sesi Inti — disiplin, insting, ketelitian, mental tangguh, percaya diri
// ─────────────────────────────────────────────────────────────────────────

/** Static, curated content bank per level — no hallucination risk, human-authored. */
export const coreSessionContent = pgTable("core_session_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: integer("level").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // disiplin | insting | ketelitian | mental_tangguh | percaya_diri
  instructions: text("instructions").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(12),
}, (t) => ({
  levelIdx: uniqueIndex("core_session_level_idx").on(t.level),
}));

export const coreSessionLogs = pgTable("core_session_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  responseData: jsonb("response_data"),
  decisionSpeedMs: integer("decision_speed_ms"),
  accuracyScore: real("accuracy_score"), // 0-1
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** A. Insting & Kecepatan Berpikir — features 1-3 */
export const instingScenarios = pgTable("insting_scenarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: integer("level").notNull(),
  scenarioPrompt: text("scenario_prompt").notNull(),
  options: jsonb("options").$type<{ id: string; label: string }[]>().notNull(),
  correctOptionId: text("correct_option_id").notNull(),
  reasoning: text("reasoning").notNull(),
  isReverseLevel: boolean("is_reverse_level").notNull().default(false), // Uji Nyali, feature 3
  aiGenerated: boolean("ai_generated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const instingAttempts = pgTable("insting_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scenarioId: uuid("scenario_id").notNull().references(() => instingScenarios.id, { onDelete: "cascade" }),
  chosenOptionId: text("chosen_option_id").notNull(),
  correct: boolean("correct").notNull(),
  decisionMs: integer("decision_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index("insting_attempts_user_idx").on(t.userId),
}));

// ─────────────────────────────────────────────────────────────────────────
// B. Daya Ingat — Memory Vault spaced repetition (feature 4-6)
// ─────────────────────────────────────────────────────────────────────────

export const memoryVaultItems = pgTable("memory_vault_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  level: integer("level").notNull(),
  term: text("term").notNull(),
  prompt: text("prompt").notNull(), // the puzzle/question shown to the user
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull(),
});

/** SM-2-derived spaced repetition state, one row per user per item. */
export const memoryVaultReviews = pgTable("memory_vault_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").notNull().references(() => memoryVaultItems.id, { onDelete: "cascade" }),
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  dueDate: date("due_date").notNull(),
  lastGrade: integer("last_grade"), // 0-5
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
}, (t) => ({
  userItemIdx: uniqueIndex("memory_vault_user_item_idx").on(t.userId, t.itemId),
  dueIdx: index("memory_vault_due_idx").on(t.userId, t.dueDate),
}));

// ─────────────────────────────────────────────────────────────────────────
// K. Kamus Pribadi / Auto-Simplifier — feature 35
// ─────────────────────────────────────────────────────────────────────────

export const personalDictionary = pgTable("personal_dictionary", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  simplifiedExplanation: text("simplified_explanation").notNull(),
  simplificationLevel: integer("simplification_level").notNull().default(1), // "Jelasin Lagi Lebih Gampang" bumps this
  originalContext: text("original_context"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userTermIdx: uniqueIndex("personal_dictionary_user_term_idx").on(t.userId, t.term),
}));

// ─────────────────────────────────────────────────────────────────────────
// G. Refleksi & Jangka Panjang — features 22-28
// ─────────────────────────────────────────────────────────────────────────

export const decisionJournalEntries = pgTable("decision_journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  decisionText: text("decision_text").notNull(),
  context: text("context"),
  aiPatternNote: text("ai_pattern_note"), // filled asynchronously by AI analysis
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Feature 24 — tiap kelipatan 10 level, sesi wajib merenung. */
export const reflectionLogs = pgTable("reflection_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  track: trackEnum("track").notNull(),
  level: integer("level").notNull(), // multiple of 10
  question: text("question").notNull(),
  answerText: text("answer_text").notNull(),
  previousAnswerId: uuid("previous_answer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Feature 21 — World Perspective Log. */
export const worldPerspectiveLogs = pgTable("world_perspective_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekOf: date("week_of").notNull(),
  insightText: text("insight_text").notNull(),
  comparisonOldThinking: text("comparison_old_thinking"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Feature 14 — Skill Radar. */
export const skillRadarSuggestions = pgTable("skill_radar_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  suggestedSkill: text("suggested_skill").notNull(),
  reason: text("reason").notNull(),
  accepted: boolean("accepted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Features 16-17 — Real-Life Mission & Zona Nyaman Breaker. */
export const realLifeMissions = pgTable("real_life_missions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionText: text("mission_text").notNull(),
  category: text("category").notNull(), // normal | zona_nyaman_breaker
  status: missionStatusEnum("status").notNull().default("assigned"),
  reportText: text("report_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reportedAt: timestamp("reported_at", { withTimezone: true }),
});

/** Feature 25 — Future Self Simulator. MUST always be shown as a simulation, not a prophecy. */
export const futureSelfSimulations = pgTable("future_self_simulations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  basedOnLevel: integer("based_on_level").notNull(),
  narrativeText: text("narrative_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Feature 26 — Brutal Honesty Report, weekly. */
export const brutalHonestyReports = pgTable("brutal_honesty_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekOf: date("week_of").notNull(),
  weaknessesText: text("weaknesses_text").notNull(),
  oneSmallStep: text("one_small_step").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userWeekIdx: uniqueIndex("brutal_honesty_user_week_idx").on(t.userId, t.weekOf),
}));

// ─────────────────────────────────────────────────────────────────────────
// C. Komunikasi & Percaya Diri — features 7-10
// ─────────────────────────────────────────────────────────────────────────

export const voiceConfidenceChecks = pgTable("voice_confidence_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transcript: text("transcript"),
  fluencyScore: real("fluency_score"),
  toneFeedback: text("tone_feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publicSpeakingSessions = pgTable("public_speaking_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  topic: text("topic").notNull(),
  transcript: text("transcript"),
  structureFeedback: jsonb("structure_feedback").$type<{
    pembuka: string;
    isi: string;
    penutup: string;
    bahasaTubuhNotes?: string;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const englishShadowSessions = pgTable("english_shadow_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  transcript: jsonb("transcript").$type<{ role: "coach" | "user"; text: string }[]>(),
  fluencyScore: real("fluency_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────
// F. Perspektif & Wawasan Luas — Global Mentor Rotation (feature 18)
// ─────────────────────────────────────────────────────────────────────────

export const mentorAssignments = pgTable("mentor_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  persona: mentorPersonaEnum("persona").notNull().default("netral"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────
// E. Skill Combo Unlock — feature 15
// ─────────────────────────────────────────────────────────────────────────

export const skillComboUnlocks = pgTable("skill_combo_unlocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comboCode: text("combo_code").notNull(),
  bossLevelTrack: trackEnum("boss_level_track").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────
// AI conversation log — unified across every AI-backed feature.
// Keeping ONE table (instead of one per feature) means the anti-hallucination
// rules & disclaimers live in one enforced place (see lib/ai).
// ─────────────────────────────────────────────────────────────────────────

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  feature: aiFeatureEnum("feature").notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  userFeatureIdx: index("ai_messages_user_feature_idx").on(t.userId, t.feature),
}));

// ─────────────────────────────────────────────────────────────────────────
// Akademi Analisis Saham (Investor Coach module)
// ─────────────────────────────────────────────────────────────────────────

export const stockAcademyProgress = pgTable("stock_academy_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: stockCategoryEnum("category").notNull(),
  currentLevel: integer("current_level").notNull().default(1),
  highestLevelReached: integer("highest_level_reached").notNull().default(1),
  levelCompletedToday: boolean("level_completed_today").notNull().default(false),
  lastActiveDate: date("last_active_date"),
}, (t) => ({
  userCategoryIdx: uniqueIndex("stock_progress_user_category_idx").on(t.userId, t.category),
}));

export const stockLessons = pgTable("stock_lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: stockCategoryEnum("category").notNull(),
  level: integer("level").notNull(),
  title: text("title").notNull(),
  contentMarkdown: text("content_markdown").notNull(),
  analogy: text("analogy").notNull(), // e.g. "PER = berapa lama modal balik"
}, (t) => ({
  categoryLevelIdx: uniqueIndex("stock_lessons_category_level_idx").on(t.category, t.level),
}));

/** Illustrative-only case studies — every row must read as clearly not real market data. */
export const stockCaseStudies = pgTable("stock_case_studies", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id").notNull().references(() => stockLessons.id, { onDelete: "cascade" }),
  scenarioText: text("scenario_text").notNull(),
  guidingQuestions: jsonb("guiding_questions").$type<string[]>().notNull(),
  isIllustrative: boolean("is_illustrative").notNull().default(true),
});

export const stockCaseStudyAttempts = pgTable("stock_case_study_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  caseStudyId: uuid("case_study_id").notNull().references(() => stockCaseStudies.id, { onDelete: "cascade" }),
  userAnalysis: text("user_analysis").notNull(),
  coachFeedback: text("coach_feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────
// Relations (for Drizzle's relational query API)
// ─────────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  healthProfile: one(healthProfiles, { fields: [users.id], references: [healthProfiles.userId] }),
  financeProfile: one(financeProfiles, { fields: [users.id], references: [financeProfiles.userId] }),
  prayerProfile: one(prayerProfiles, { fields: [users.id], references: [prayerProfiles.userId] }),
  levelProgress: many(levelProgress),
  badges: many(badges),
}));

export const memoryVaultReviewsRelations = relations(memoryVaultReviews, ({ one }) => ({
  item: one(memoryVaultItems, { fields: [memoryVaultReviews.itemId], references: [memoryVaultItems.id] }),
}));

export const stockCaseStudiesRelations = relations(stockCaseStudies, ({ one }) => ({
  lesson: one(stockLessons, { fields: [stockCaseStudies.lessonId], references: [stockLessons.id] }),
}));
