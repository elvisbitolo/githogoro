-- Run this in the Supabase SQL Editor AFTER part 1.
-- Adds ban/suspend fields to profiles and creates the user-report (flag) table.

ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "is_banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "ban_reason" TEXT;

CREATE TABLE IF NOT EXISTS "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "handled_by_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
    "handled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports"("status");
CREATE INDEX IF NOT EXISTS "reports_target_idx" ON "reports"("target_type", "target_id");
