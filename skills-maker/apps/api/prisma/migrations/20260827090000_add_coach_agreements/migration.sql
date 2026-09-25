-- Ported from prisma/migrations/20260601_coach_agreements.sql of the legacy app.
-- No unique constraint on (coach_id, contract_version): a revoked signature must stay
-- re-signable for the same version. Idempotence is enforced in the service.

-- CreateTable
CREATE TABLE "coach_agreements" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "contract_version" TEXT NOT NULL,
    "signed_name" TEXT NOT NULL,
    "subscription_share_coach_pct" INTEGER NOT NULL DEFAULT 25,
    "formation_share_platform_pct" INTEGER NOT NULL DEFAULT 25,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" INET,
    "user_agent" TEXT,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "coach_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_agreements_coach_id_revoked_at_idx" ON "coach_agreements"("coach_id", "revoked_at");

-- AddForeignKey
ALTER TABLE "coach_agreements" ADD CONSTRAINT "coach_agreements_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
