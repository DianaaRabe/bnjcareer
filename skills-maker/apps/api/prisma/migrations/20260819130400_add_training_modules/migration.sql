-- CreateTable
CREATE TABLE "training_modules" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "position" INTEGER NOT NULL,
    "duration_minutes" INTEGER,

    CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_modules_training_id_position_key" ON "training_modules"("training_id", "position");

-- AddForeignKey
ALTER TABLE "training_modules" ADD CONSTRAINT "training_modules_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: the module count now derives from training_modules
ALTER TABLE "trainings" DROP COLUMN "modules";
