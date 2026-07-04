CREATE TABLE "hygiene_checklist_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"completed_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personality_maturity_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month_of" date NOT NULL,
	"report_text" text NOT NULL,
	"entries_analyzed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hygiene_checklist_logs" ADD CONSTRAINT "hygiene_checklist_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personality_maturity_reports" ADD CONSTRAINT "personality_maturity_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hygiene_checklist_user_date_idx" ON "hygiene_checklist_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "personality_maturity_user_month_idx" ON "personality_maturity_reports" USING btree ("user_id","month_of");