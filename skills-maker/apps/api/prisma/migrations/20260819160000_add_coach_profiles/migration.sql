-- CreateEnum
CREATE TYPE "CoachExpertise" AS ENUM ('CV_STRATEGY', 'INTERVIEW', 'LINKEDIN', 'NEGOTIATION', 'CAREER_CHANGE', 'LEADERSHIP');

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialty" TEXT,
    "years_experience" INTEGER,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expertise" "CoachExpertise"[] DEFAULT ARRAY[]::"CoachExpertise"[],
    "rating" DOUBLE PRECISION,
    "accepting_clients" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_user_id_key" ON "coach_profiles"("user_id");

-- CreateIndex
CREATE INDEX "coach_profiles_published_accepting_clients_idx" ON "coach_profiles"("published", "accepting_clients");

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
