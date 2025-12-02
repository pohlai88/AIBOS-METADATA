CREATE TABLE IF NOT EXISTS "iam_audit_event" (
	"audit_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"action" text NOT NULL,
	"actor_user_id" uuid,
	"location_ref" text,
	"metadata_diff" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"prev_hash" text,
	"hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_invite_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"is_used" boolean DEFAULT false NOT NULL,
	"invited_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_user_tenant_membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_password_reset_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"is_used" boolean DEFAULT false NOT NULL,
	"requested_ip" text,
	"requested_user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'pending_setup' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"logo_url" text,
	"domain" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"avatar_url" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_audit_event" ADD CONSTRAINT "iam_audit_event_actor_user_id_iam_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."iam_user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_invite_token" ADD CONSTRAINT "iam_invite_token_user_id_iam_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."iam_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_invite_token" ADD CONSTRAINT "iam_invite_token_tenant_id_iam_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."iam_tenant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_user_tenant_membership" ADD CONSTRAINT "iam_user_tenant_membership_user_id_iam_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."iam_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_user_tenant_membership" ADD CONSTRAINT "iam_user_tenant_membership_tenant_id_iam_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."iam_tenant"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_password_reset_token" ADD CONSTRAINT "iam_password_reset_token_user_id_iam_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."iam_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_audit_event_trace_id_idx" ON "iam_audit_event" USING btree ("trace_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_audit_event_resource_type_idx" ON "iam_audit_event" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_audit_event_actor_idx" ON "iam_audit_event" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_audit_event_created_at_idx" ON "iam_audit_event" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_invite_token_hash_uq" ON "iam_invite_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_invite_token_user_idx" ON "iam_invite_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_invite_token_expires_at_idx" ON "iam_invite_token" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_membership_user_tenant_uq" ON "iam_user_tenant_membership" USING btree ("user_id","tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_membership_tenant_idx" ON "iam_user_tenant_membership" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_membership_user_idx" ON "iam_user_tenant_membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_membership_tenant_role_idx" ON "iam_user_tenant_membership" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_password_reset_token_hash_uq" ON "iam_password_reset_token" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_password_reset_token_user_idx" ON "iam_password_reset_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_password_reset_token_expires_at_idx" ON "iam_password_reset_token" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_tenant_slug_uq" ON "iam_tenant" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_tenant_trace_id_uq" ON "iam_tenant" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_tenant_status_idx" ON "iam_tenant" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_user_email_uq" ON "iam_user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "iam_user_trace_id_uq" ON "iam_user" USING btree ("trace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_user_status_idx" ON "iam_user" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_user_last_login_idx" ON "iam_user" USING btree ("last_login_at");