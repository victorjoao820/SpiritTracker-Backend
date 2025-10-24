/*
  Warnings:

  - You are about to drop the column `productionBatchId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `production_batches` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'FERMENTATION_FINISH';

-- DropForeignKey
ALTER TABLE "public"."production_batches" DROP CONSTRAINT "production_batches_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."production_batches" DROP CONSTRAINT "production_batches_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_productionBatchId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "productionBatchId",
ADD COLUMN     "fermentationId" TEXT;

-- DropTable
DROP TABLE "public"."production_batches";

-- CreateTable
CREATE TABLE "Fermenter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityGallons" DECIMAL(10,2),
    "currentVolumeGallons" DECIMAL(10,2),
    "proof" DECIMAL(5,2),
    "status" "BatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fermenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fermentations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "fermenterId" TEXT,
    "mashBill" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "volumeGallons" DECIMAL(10,2),
    "startSG" DECIMAL(5,2),
    "status" "BatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fermentations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distillations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fermentationId" TEXT,
    "productId" TEXT,
    "batchType" "BatchType" NOT NULL,
    "batchNumber" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "volumeGallons" DECIMAL(10,2),
    "chargeProof" DECIMAL(5,2),
    "yeildProof" DECIMAL(5,2),
    "chargeTemperature" DECIMAL(5,2),
    "yeildTemperature" DECIMAL(5,2),
    "chargeVolumeGallons" DECIMAL(10,2),
    "yeildVolumeGallons" DECIMAL(10,2),
    "status" "BatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distillations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Fermenter" ADD CONSTRAINT "Fermenter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fermentations" ADD CONSTRAINT "fermentations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fermentations" ADD CONSTRAINT "fermentations_fermenterId_fkey" FOREIGN KEY ("fermenterId") REFERENCES "Fermenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distillations" ADD CONSTRAINT "distillations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distillations" ADD CONSTRAINT "distillations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distillations" ADD CONSTRAINT "distillations_fermentationId_fkey" FOREIGN KEY ("fermentationId") REFERENCES "fermentations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fermentationId_fkey" FOREIGN KEY ("fermentationId") REFERENCES "fermentations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
