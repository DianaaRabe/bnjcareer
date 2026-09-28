-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'CANCELED');

-- AlterTable
ALTER TABLE "calendar_events" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED';
