-- CreateEnum
CREATE TYPE "AutomationFrequency" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "AutomationRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('MANUAL', 'AUTOMATED');

-- CreateEnum
CREATE TYPE "AutomationStage" AS ENUM ('DISCOVERED', 'MATCHED', 'ELIGIBLE', 'PREPARING', 'READY_TO_SEND', 'SENDING', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AutomationSkipReason" AS ENUM ('MATCH_TOO_LOW', 'ALREADY_APPLIED', 'NO_CONTACT', 'REQUIRES_REVIEW', 'SKIPPED', 'SEND_FAILED');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmailProvider" AS ENUM ('BREVO', 'GOOGLE', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "JobContactSource" AS ENUM ('OFFER', 'SITE', 'LUSHA', 'MANUAL');

-- CreateEnum
CREATE TYPE "JobContactConfidence" AS ENUM ('VERIFIED', 'GUESSED');

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "cover_letter" TEXT,
ADD COLUMN     "cover_letter_model" TEXT,
ADD COLUMN     "cv_reference" TEXT,
ADD COLUMN     "recipient_email" TEXT,
ADD COLUMN     "sent_at" TIMESTAMP(3),
ADD COLUMN     "skip_reason" "AutomationSkipReason",
ADD COLUMN     "source" "ApplicationSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "stage" "AutomationStage",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "job_offers" ADD COLUMN     "canonical_key" TEXT,
ADD COLUMN     "company_website" TEXT,
ADD COLUMN     "discovered_at" TIMESTAMP(3),
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "raw_source_reference" TEXT,
ADD COLUMN     "remote" BOOLEAN,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "candidate_automation_settings" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "frequency" "AutomationFrequency" NOT NULL DEFAULT 'WEEKLY',
    "next_run_at" TIMESTAMP(3),
    "max_applications_per_run" INTEGER,
    "max_applications_per_day" INTEGER,
    "min_match_score" INTEGER,
    "approval_mode" BOOLEAN NOT NULL DEFAULT true,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contract_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_automation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_runs" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "status" "AutomationRunStatus" NOT NULL DEFAULT 'RUNNING',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "heartbeat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobs_discovered" INTEGER NOT NULL DEFAULT 0,
    "jobs_deduplicated" INTEGER NOT NULL DEFAULT 0,
    "jobs_matched" INTEGER NOT NULL DEFAULT 0,
    "applications_sent" INTEGER NOT NULL DEFAULT 0,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "error_summary" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "run_id" TEXT,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_messages" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "provider" "EmailProvider" NOT NULL,
    "provider_message_id" TEXT,
    "provider_thread_id" TEXT,
    "delivery_status" "EmailDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "replied_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_email_accounts" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "provider" "EmailProvider" NOT NULL,
    "email_address" TEXT NOT NULL,
    "encrypted_access_token" TEXT,
    "encrypted_refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_refresh_at" TIMESTAMP(3),
    "disconnected_at" TIMESTAMP(3),

    CONSTRAINT "candidate_email_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_contacts" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact_name" TEXT,
    "source" "JobContactSource" NOT NULL,
    "confidence" "JobContactConfidence" NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_automation_settings_candidate_id_key" ON "candidate_automation_settings"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_automation_settings_enabled_next_run_at_idx" ON "candidate_automation_settings"("enabled", "next_run_at");

-- CreateIndex
CREATE INDEX "automation_runs_candidate_id_started_at_idx" ON "automation_runs"("candidate_id", "started_at");

-- CreateIndex
CREATE INDEX "automation_runs_status_started_at_idx" ON "automation_runs"("status", "started_at");

-- CreateIndex
CREATE INDEX "application_events_application_id_created_at_idx" ON "application_events"("application_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_application_id_key" ON "email_messages"("application_id");

-- CreateIndex
CREATE INDEX "email_messages_provider_message_id_idx" ON "email_messages"("provider_message_id");

-- CreateIndex
CREATE INDEX "email_messages_provider_thread_id_idx" ON "email_messages"("provider_thread_id");

-- CreateIndex
CREATE INDEX "email_messages_delivery_status_created_at_idx" ON "email_messages"("delivery_status", "created_at");

-- CreateIndex
CREATE INDEX "candidate_email_accounts_candidate_id_disconnected_at_idx" ON "candidate_email_accounts"("candidate_id", "disconnected_at");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_email_accounts_candidate_id_provider_key" ON "candidate_email_accounts"("candidate_id", "provider");

-- CreateIndex
CREATE INDEX "job_contacts_job_id_confidence_idx" ON "job_contacts"("job_id", "confidence");

-- CreateIndex
CREATE UNIQUE INDEX "job_contacts_job_id_email_key" ON "job_contacts"("job_id", "email");

-- CreateIndex
CREATE INDEX "applications_user_id_stage_idx" ON "applications"("user_id", "stage");

-- CreateIndex
CREATE INDEX "applications_user_id_created_at_idx" ON "applications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "applications_user_id_job_offer_id_key" ON "applications"("user_id", "job_offer_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_offers_canonical_key_key" ON "job_offers"("canonical_key");

-- CreateIndex
CREATE INDEX "job_offers_source_external_id_idx" ON "job_offers"("source", "external_id");

-- AddForeignKey
ALTER TABLE "candidate_automation_settings" ADD CONSTRAINT "candidate_automation_settings_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "automation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_email_accounts" ADD CONSTRAINT "candidate_email_accounts_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_contacts" ADD CONSTRAINT "job_contacts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

