-- AlterTable
ALTER TABLE "trainings" ADD COLUMN     "coach_id" TEXT;

-- CreateIndex
CREATE INDEX "trainings_coach_id_idx" ON "trainings"("coach_id");

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
