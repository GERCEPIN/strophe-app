CREATE TYPE "public"."ai_feature" AS ENUM('investor_coach', 'decision_journal_analysis', 'future_self_simulator', 'brutal_honesty_report', 'global_mentor', 'auto_simplifier', 'insting_scenario');--> statement-breakpoint
CREATE TYPE "public"."body_goal" AS ENUM('kurus', 'ideal', 'otot');--> statement-breakpoint
CREATE TYPE "public"."mentor_persona" AS ENUM('netral', 'disiplin_jepang', 'keberanian_barat', 'ketekunan_jerman', 'harmoni_nordik', 'ketegasan_korea');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."mission_status" AS ENUM('assigned', 'reported');--> statement-breakpoint
CREATE TYPE "public"."skin_type" AS ENUM('kering', 'oily', 'sensitif', 'kombinasi', 'normal');--> statement-breakpoint
CREATE TYPE "public"."stock_category" AS ENUM('fundamental', 'teknikal', 'makro_sektoral', 'sentimen_berita', 'manajemen_risiko', 'legal_compliance');--> statement-breakpoint
CREATE TYPE "public"."track" AS ENUM('core', 'daya_ingat', 'bahasa_inggris', 'public_speaking', 'jangka_panjang', 'kesehatan', 'keuangan');--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" "ai_feature" NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"permanent" boolean DEFAULT true NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brutal_honesty_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_of" date NOT NULL,
	"weaknesses_text" text NOT NULL,
	"one_small_step" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_session_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" integer NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"instructions" text NOT NULL,
	"duration_minutes" integer DEFAULT 12 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_session_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"response_data" jsonb,
	"decision_speed_ms" integer,
	"accuracy_score" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decision_journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"decision_text" text NOT NULL,
	"context" text,
	"ai_pattern_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diamond_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"track" "track" NOT NULL,
	"level_at_checkpoint" integer NOT NULL,
	"passed_at" timestamp with time zone,
	"badge_permanent" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "english_shadow_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"transcript" jsonb,
	"fluency_score" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"income_range" text,
	"monthly_expense_range" text,
	"financial_goal" text,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "future_self_simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"based_on_level" integer NOT NULL,
	"narrative_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"height_cm" real,
	"weight_kg" real,
	"activity_level" text,
	"goal" "body_goal",
	"skin_type" "skin_type",
	"skin_concerns" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insting_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scenario_id" uuid NOT NULL,
	"chosen_option_id" text NOT NULL,
	"correct" boolean NOT NULL,
	"decision_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insting_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" integer NOT NULL,
	"scenario_prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" text NOT NULL,
	"reasoning" text NOT NULL,
	"is_reverse_level" boolean DEFAULT false NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"track" "track" NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"highest_level_reached" integer DEFAULT 1 NOT NULL,
	"level_completed_today" boolean DEFAULT false NOT NULL,
	"last_active_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_vault_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" integer NOT NULL,
	"term" text NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"explanation" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_vault_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"ease_factor" real DEFAULT 2.5 NOT NULL,
	"interval_days" integer DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"due_date" date NOT NULL,
	"last_grade" integer,
	"last_reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mental_score_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"mental_score" integer NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"missed_day" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"persona" "mentor_persona" DEFAULT 'netral' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_dictionary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"term" text NOT NULL,
	"simplified_explanation" text NOT NULL,
	"simplification_level" integer DEFAULT 1 NOT NULL,
	"original_context" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"city" text,
	"country" text,
	"madhab" text DEFAULT 'shafi',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_speaking_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"topic" text NOT NULL,
	"transcript" text,
	"structure_feedback" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "real_life_missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mission_text" text NOT NULL,
	"category" text NOT NULL,
	"status" "mission_status" DEFAULT 'assigned' NOT NULL,
	"report_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reported_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reflection_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"track" "track" NOT NULL,
	"level" integer NOT NULL,
	"question" text NOT NULL,
	"answer_text" text NOT NULL,
	"previous_answer_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_combo_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"combo_code" text NOT NULL,
	"boss_level_track" "track" NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_radar_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"suggested_skill" text NOT NULL,
	"reason" text NOT NULL,
	"accepted" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_academy_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "stock_category" NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"highest_level_reached" integer DEFAULT 1 NOT NULL,
	"level_completed_today" boolean DEFAULT false NOT NULL,
	"last_active_date" date
);
--> statement-breakpoint
CREATE TABLE "stock_case_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"scenario_text" text NOT NULL,
	"guiding_questions" jsonb NOT NULL,
	"is_illustrative" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_case_study_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"case_study_id" uuid NOT NULL,
	"user_analysis" text NOT NULL,
	"coach_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "stock_category" NOT NULL,
	"level" integer NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"analogy" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"visi_5_tahun" text,
	"blueprint_bisnis" jsonb,
	"onboarding_completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_confidence_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transcript" text,
	"fluency_score" real,
	"tone_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_perspective_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_of" date NOT NULL,
	"insight_text" text NOT NULL,
	"comparison_old_thinking" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brutal_honesty_reports" ADD CONSTRAINT "brutal_honesty_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_session_logs" ADD CONSTRAINT "core_session_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_journal_entries" ADD CONSTRAINT "decision_journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diamond_checkpoints" ADD CONSTRAINT "diamond_checkpoints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "english_shadow_sessions" ADD CONSTRAINT "english_shadow_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_profiles" ADD CONSTRAINT "finance_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "future_self_simulations" ADD CONSTRAINT "future_self_simulations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_profiles" ADD CONSTRAINT "health_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insting_attempts" ADD CONSTRAINT "insting_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insting_attempts" ADD CONSTRAINT "insting_attempts_scenario_id_insting_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."insting_scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_vault_reviews" ADD CONSTRAINT "memory_vault_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_vault_reviews" ADD CONSTRAINT "memory_vault_reviews_item_id_memory_vault_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."memory_vault_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mental_score_log" ADD CONSTRAINT "mental_score_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_assignments" ADD CONSTRAINT "mentor_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_dictionary" ADD CONSTRAINT "personal_dictionary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_profiles" ADD CONSTRAINT "prayer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_speaking_sessions" ADD CONSTRAINT "public_speaking_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_life_missions" ADD CONSTRAINT "real_life_missions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reflection_logs" ADD CONSTRAINT "reflection_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_combo_unlocks" ADD CONSTRAINT "skill_combo_unlocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_radar_suggestions" ADD CONSTRAINT "skill_radar_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_academy_progress" ADD CONSTRAINT "stock_academy_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_case_studies" ADD CONSTRAINT "stock_case_studies_lesson_id_stock_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."stock_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_case_study_attempts" ADD CONSTRAINT "stock_case_study_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_case_study_attempts" ADD CONSTRAINT "stock_case_study_attempts_case_study_id_stock_case_studies_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "public"."stock_case_studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_confidence_checks" ADD CONSTRAINT "voice_confidence_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_perspective_logs" ADD CONSTRAINT "world_perspective_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_messages_user_feature_idx" ON "ai_messages" USING btree ("user_id","feature");--> statement-breakpoint
CREATE UNIQUE INDEX "brutal_honesty_user_week_idx" ON "brutal_honesty_reports" USING btree ("user_id","week_of");--> statement-breakpoint
CREATE UNIQUE INDEX "core_session_level_idx" ON "core_session_content" USING btree ("level");--> statement-breakpoint
CREATE UNIQUE INDEX "diamond_user_track_level_idx" ON "diamond_checkpoints" USING btree ("user_id","track","level_at_checkpoint");--> statement-breakpoint
CREATE INDEX "insting_attempts_user_idx" ON "insting_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "level_progress_user_track_idx" ON "level_progress" USING btree ("user_id","track");--> statement-breakpoint
CREATE UNIQUE INDEX "memory_vault_user_item_idx" ON "memory_vault_reviews" USING btree ("user_id","item_id");--> statement-breakpoint
CREATE INDEX "memory_vault_due_idx" ON "memory_vault_reviews" USING btree ("user_id","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "mental_score_user_date_idx" ON "mental_score_log" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_dictionary_user_term_idx" ON "personal_dictionary" USING btree ("user_id","term");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_progress_user_category_idx" ON "stock_academy_progress" USING btree ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_lessons_category_level_idx" ON "stock_lessons" USING btree ("category","level");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");