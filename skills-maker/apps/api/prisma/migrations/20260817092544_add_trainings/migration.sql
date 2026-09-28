-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('INTERVIEW', 'CV', 'CAREER_CHANGE', 'SOFT_SKILLS', 'TECHNICAL', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TrainingCategory" NOT NULL,
    "level" "TrainingLevel" NOT NULL,
    "price_cents" INTEGER,
    "modules" INTEGER NOT NULL DEFAULT 0,
    "duration_days" INTEGER NOT NULL,
    "instructor" TEXT,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trainings_published_category_level_idx" ON "trainings"("published", "category", "level");
