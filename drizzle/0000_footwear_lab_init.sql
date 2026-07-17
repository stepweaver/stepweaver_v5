CREATE TABLE "shoe_media" (
	"id" text PRIMARY KEY NOT NULL,
	"shoe_id" text NOT NULL,
	"observation_id" text,
	"image_url" text NOT NULL,
	"image_type" text NOT NULL,
	"mileage_at_photo" numeric(8, 2) NOT NULL,
	"caption" text,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoe_mileage_allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"shoe_id" text NOT NULL,
	"carrier_log_notion_page_id" text,
	"date" text NOT NULL,
	"miles" numeric(8, 2) NOT NULL,
	"mileage_type" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoe_observations" (
	"id" text PRIMARY KEY NOT NULL,
	"shoe_id" text NOT NULL,
	"date" text NOT NULL,
	"shoe_mileage_at_entry" numeric(8, 2) NOT NULL,
	"entry_type" text NOT NULL,
	"checkpoint_miles" integer,
	"title" text,
	"notes" text NOT NULL,
	"cushioning" integer,
	"stability" integer,
	"traction_dry" integer,
	"traction_wet" integer,
	"comfort" integer,
	"fit_security" integer,
	"breathability" integer,
	"durability" integer,
	"foot_comfort" integer,
	"knee_comfort" integer,
	"hip_back_comfort" integer,
	"end_of_shift_support" integer,
	"outsole_wear" integer,
	"midsole_wear" integer,
	"upper_wear" integer,
	"heel_wear" integer,
	"insole_wear" integer,
	"structural_deformation" integer,
	"would_continue_wearing" boolean,
	"better_than_previous" text,
	"worse_than_previous" text,
	"new_discomfort_patterns" text,
	"traction_changed" text,
	"fit_changed" text,
	"unexpected_events" text,
	"monitor_next" text,
	"incident_type" text,
	"conditions" text,
	"body_impact" text,
	"remained_in_service" boolean,
	"immediately_retired" boolean,
	"retrospective" boolean DEFAULT false NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoes" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"nickname" text,
	"colorway" text,
	"size" text NOT NULL,
	"width" text,
	"purchase_date" text,
	"first_wear_date" text,
	"retirement_date" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"acquisition_type" text DEFAULT 'purchased' NOT NULL,
	"retail_price" numeric(10, 2),
	"amount_paid" numeric(10, 2),
	"provider" text,
	"intended_use" text,
	"baseline_notes" text,
	"is_legacy_record" boolean DEFAULT false NOT NULL,
	"mileage_confidence" text DEFAULT 'exact' NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"retirement_reason" text,
	"retired_from_work_only" boolean,
	"failure_location" text,
	"would_buy_again" boolean,
	"ideal_user" text,
	"who_should_avoid" text,
	"final_verdict" text,
	"final_review" text,
	"post_work_status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shoes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "shoe_media" ADD CONSTRAINT "shoe_media_shoe_id_shoes_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_media" ADD CONSTRAINT "shoe_media_observation_id_shoe_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."shoe_observations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_mileage_allocations" ADD CONSTRAINT "shoe_mileage_allocations_shoe_id_shoes_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_observations" ADD CONSTRAINT "shoe_observations_shoe_id_shoes_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_shoe_idx" ON "shoe_media" USING btree ("shoe_id");--> statement-breakpoint
CREATE INDEX "media_observation_idx" ON "shoe_media" USING btree ("observation_id");--> statement-breakpoint
CREATE INDEX "allocations_shoe_date_idx" ON "shoe_mileage_allocations" USING btree ("shoe_id","date");--> statement-breakpoint
CREATE INDEX "allocations_date_type_idx" ON "shoe_mileage_allocations" USING btree ("date","mileage_type");--> statement-breakpoint
CREATE INDEX "observations_shoe_date_idx" ON "shoe_observations" USING btree ("shoe_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "observations_checkpoint_unique_idx" ON "shoe_observations" USING btree ("shoe_id","checkpoint_miles") WHERE "shoe_observations"."entry_type" = 'checkpoint';--> statement-breakpoint
CREATE UNIQUE INDEX "shoes_one_active_idx" ON "shoes" USING btree ("status") WHERE "shoes"."status" = 'active';--> statement-breakpoint
CREATE INDEX "shoes_public_status_idx" ON "shoes" USING btree ("public","status");