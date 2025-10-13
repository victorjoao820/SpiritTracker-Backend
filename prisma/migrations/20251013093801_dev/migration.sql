/*
  Warnings:

  - You are about to drop the column `volumeGallons` on the `containers` table. All the data in the column will be lost.
  - Added the required column `capacityGallons` to the `containers` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `batchType` on the `production_batches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `transactionType` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('EMPTY', 'FILLED', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BarrelStatus" AS ENUM ('EMPTY', 'FILLED', 'DUMPED', 'TRANSFERRED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "BarrelLogType" AS ENUM ('FILL', 'DUMP', 'TRANSFER', 'SAMPLING', 'INSPECTION', 'MAINTENANCE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "BatchingType" AS ENUM ('BLENDING', 'FILTERING', 'CHILL_FILTERING', 'CARBON_FILTERING', 'FINISHING');

-- CreateEnum
CREATE TYPE "BatchingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BottlingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('BARREL', 'CONTAINER', 'TOTE', 'TANKER');

-- CreateEnum
CREATE TYPE "TransferDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinishedGoodsStatus" AS ENUM ('IN_WAREHOUSE', 'SHIPPED', 'RETURNED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "DepletionType" AS ENUM ('SALE', 'SAMPLE', 'DAMAGE', 'THEFT', 'RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TankType" AS ENUM ('STORAGE', 'BLENDING', 'FINISHING', 'FILTERING', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "TankStatus" AS ENUM ('EMPTY', 'FILLED', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "TankLogType" AS ENUM ('FILL', 'EMPTY', 'TRANSFER', 'FILTER', 'ADJUST', 'MAINTENANCE', 'SAMPLING');

-- CreateEnum
CREATE TYPE "TTBReportType" AS ENUM ('MONTHLY_PRODUCTION', 'MONTHLY_INVENTORY', 'ANNUAL_PRODUCTION', 'SPECIAL_REPORT');

-- CreateEnum
CREATE TYPE "TTBReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'AMENDED');

-- AlterTable
ALTER TABLE "containers" DROP COLUMN "volumeGallons",
ADD COLUMN     "capacityGallons" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "containerNumber" TEXT,
ADD COLUMN     "currentVolumeGallons" DECIMAL(10,2),
ADD COLUMN     "dumpDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "ContainerStatus" NOT NULL DEFAULT 'EMPTY';

-- AlterTable
ALTER TABLE "production_batches" ADD COLUMN     "status" "BatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "temperatureFahrenheit" DECIMAL(5,2),
DROP COLUMN "batchType",
ADD COLUMN     "batchType" "BatchType" NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "abv" DECIMAL(4,2),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "productCode" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "proofGallons" DECIMAL(10,2),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "transactionType",
ADD COLUMN     "transactionType" "TransactionType" NOT NULL;

-- CreateTable
CREATE TABLE "barrels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barrelNumber" TEXT NOT NULL,
    "barrelType" TEXT NOT NULL,
    "charLevel" INTEGER,
    "toastLevel" INTEGER,
    "capacityGallons" DECIMAL(10,2) NOT NULL,
    "currentVolumeGallons" DECIMAL(10,2),
    "proof" DECIMAL(5,2),
    "temperatureFahrenheit" DECIMAL(5,2),
    "fillDate" TIMESTAMP(3),
    "dumpDate" TIMESTAMP(3),
    "ageYears" DECIMAL(4,2),
    "location" TEXT,
    "status" "BarrelStatus" NOT NULL DEFAULT 'FILLED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barrels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barrel_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barrelId" TEXT NOT NULL,
    "logType" "BarrelLogType" NOT NULL,
    "volumeGallons" DECIMAL(10,2),
    "proof" DECIMAL(5,2),
    "temperatureFahrenheit" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barrel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batching_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "productId" TEXT,
    "batchType" "BatchingType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "volumeGallons" DECIMAL(10,2),
    "proof" DECIMAL(5,2),
    "temperatureFahrenheit" DECIMAL(5,2),
    "status" "BatchingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batching_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bottling_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchingRunId" TEXT,
    "batchNumber" TEXT NOT NULL,
    "productId" TEXT,
    "bottleSize" DECIMAL(8,2) NOT NULL,
    "bottlesProduced" INTEGER NOT NULL,
    "volumeGallons" DECIMAL(10,2) NOT NULL,
    "proof" DECIMAL(5,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "BottlingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bottling_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "transferType" "TransferType" NOT NULL,
    "direction" "TransferDirection" NOT NULL,
    "barrelId" TEXT,
    "containerId" TEXT,
    "volumeGallons" DECIMAL(10,2) NOT NULL,
    "proof" DECIMAL(5,2) NOT NULL,
    "temperatureFahrenheit" DECIMAL(5,2),
    "transferDate" TIMESTAMP(3) NOT NULL,
    "destination" TEXT,
    "carrier" TEXT,
    "sealNumber" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finished_goods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "batchNumber" TEXT,
    "bottleSize" DECIMAL(8,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "proof" DECIMAL(5,2) NOT NULL,
    "location" TEXT,
    "status" "FinishedGoodsStatus" NOT NULL DEFAULT 'IN_WAREHOUSE',
    "receivedDate" TIMESTAMP(3),
    "shippedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finished_goods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bailment_depletions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finishedGoodsId" TEXT,
    "productId" TEXT,
    "depletionType" "DepletionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "depletionDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bailment_depletions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tanks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tankNumber" TEXT NOT NULL,
    "tankType" "TankType" NOT NULL,
    "capacityGallons" DECIMAL(10,2) NOT NULL,
    "currentVolumeGallons" DECIMAL(10,2),
    "proof" DECIMAL(5,2),
    "temperatureFahrenheit" DECIMAL(5,2),
    "status" "TankStatus" NOT NULL DEFAULT 'EMPTY',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tanks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tank_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "logType" "TankLogType" NOT NULL,
    "volumeGallons" DECIMAL(10,2),
    "proof" DECIMAL(5,2),
    "temperatureFahrenheit" DECIMAL(5,2),
    "action" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tank_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ttb_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportType" "TTBReportType" NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "status" "TTBReportStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedDate" TIMESTAMP(3),
    "ttbApprovalDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ttb_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "barrels_barrelNumber_key" ON "barrels"("barrelNumber");

-- AddForeignKey
ALTER TABLE "barrels" ADD CONSTRAINT "barrels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barrel_logs" ADD CONSTRAINT "barrel_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barrel_logs" ADD CONSTRAINT "barrel_logs_barrelId_fkey" FOREIGN KEY ("barrelId") REFERENCES "barrels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batching_runs" ADD CONSTRAINT "batching_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batching_runs" ADD CONSTRAINT "batching_runs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bottling_runs" ADD CONSTRAINT "bottling_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bottling_runs" ADD CONSTRAINT "bottling_runs_batchingRunId_fkey" FOREIGN KEY ("batchingRunId") REFERENCES "batching_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bottling_runs" ADD CONSTRAINT "bottling_runs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_barrelId_fkey" FOREIGN KEY ("barrelId") REFERENCES "barrels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finished_goods" ADD CONSTRAINT "finished_goods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finished_goods" ADD CONSTRAINT "finished_goods_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bailment_depletions" ADD CONSTRAINT "bailment_depletions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bailment_depletions" ADD CONSTRAINT "bailment_depletions_finishedGoodsId_fkey" FOREIGN KEY ("finishedGoodsId") REFERENCES "finished_goods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bailment_depletions" ADD CONSTRAINT "bailment_depletions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tanks" ADD CONSTRAINT "tanks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tank_logs" ADD CONSTRAINT "tank_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tank_logs" ADD CONSTRAINT "tank_logs_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "tanks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttb_reports" ADD CONSTRAINT "ttb_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
