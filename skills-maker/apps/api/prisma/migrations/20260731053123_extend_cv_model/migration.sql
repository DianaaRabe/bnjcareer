/*
  Warnings:

  - Added the required column `updated_at` to the `cvs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CvStatus" AS ENUM ('UPLOADED', 'EXTRACTING', 'EXTRACTED', 'EXTRACTION_FAILED', 'OPTIMIZING', 'OPTIMIZED', 'OPTIMIZATION_FAILED');

-- AlterTable
ALTER TABLE "cvs" ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "file_size_bytes" INTEGER,
ADD COLUMN     "improvements" JSONB,
ADD COLUMN     "optimized_html" TEXT,
ADD COLUMN     "status" "CvStatus" NOT NULL DEFAULT 'UPLOADED',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
