-- CreateEnum
CREATE TYPE "ProfileSituation" AS ENUM ('EMPLOYED', 'JOB_SEARCH', 'RECONVERSION', 'STUDENT');

-- CreateEnum
CREATE TYPE "ProfileObjective" AS ENUM ('FIND_JOB', 'IMPROVE_CV', 'CAREER_CHANGE', 'DEVELOP_SKILLS', 'NETWORK');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "education_level" TEXT,
ADD COLUMN     "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "objective" "ProfileObjective",
ADD COLUMN     "school" TEXT,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "situation" "ProfileSituation",
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[];
