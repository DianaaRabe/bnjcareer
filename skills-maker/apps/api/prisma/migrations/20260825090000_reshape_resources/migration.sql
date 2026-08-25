-- The table was an unused stub with no rows: rebuild it rather than patch the enum in place.
DROP TABLE "resources";
DROP TYPE "ResourceType";

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'DOC', 'ARTICLE', 'VIDEO', 'REPLAY');

-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('APPLICATION', 'INTERVIEW', 'NETWORK', 'ORGANIZATION', 'COACHING', 'TOOLS');

-- CreateEnum
CREATE TYPE "ResourceAccess" AS ENUM ('FREE', 'PAID', 'PREMIUM');

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "category" "ResourceCategory" NOT NULL,
    "url" TEXT,
    "size_bytes" INTEGER,
    "duration_minutes" INTEGER,
    "access" "ResourceAccess" NOT NULL DEFAULT 'FREE',
    "price_cents" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resources_published_category_idx" ON "resources"("published", "category");
