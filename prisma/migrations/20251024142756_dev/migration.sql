/*
  Warnings:

  - You are about to drop the column `batchNumber` on the `distillations` table. All the data in the column will be lost.
  - You are about to drop the column `volumeGallons` on the `distillations` table. All the data in the column will be lost.
  - You are about to drop the column `yeildProof` on the `distillations` table. All the data in the column will be lost.
  - You are about to drop the column `yeildTemperature` on the `distillations` table. All the data in the column will be lost.
  - You are about to drop the column `yeildVolumeGallons` on the `distillations` table. All the data in the column will be lost.
  - You are about to drop the column `batchNumber` on the `fermentations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."distillations" DROP COLUMN "batchNumber",
DROP COLUMN "volumeGallons",
DROP COLUMN "yeildProof",
DROP COLUMN "yeildTemperature",
DROP COLUMN "yeildVolumeGallons",
ADD COLUMN     "batchName" TEXT,
ADD COLUMN     "storeYieldContainer" TEXT,
ADD COLUMN     "yieldProof" DECIMAL(5,2),
ADD COLUMN     "yieldTemperature" DECIMAL(5,2),
ADD COLUMN     "yieldVolumeGallons" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."fermentations" DROP COLUMN "batchNumber",
ADD COLUMN     "batchName" TEXT,
ADD COLUMN     "finalFG" DECIMAL(5,2),
ADD COLUMN     "ingredient" TEXT;

-- AddForeignKey
ALTER TABLE "public"."distillations" ADD CONSTRAINT "distillations_storeYieldContainer_fkey" FOREIGN KEY ("storeYieldContainer") REFERENCES "public"."containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
