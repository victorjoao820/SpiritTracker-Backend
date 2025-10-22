/*
  Warnings:

  - You are about to drop the column `capacityGallons` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `containerNumber` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `containerType` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `currentVolumeGallons` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `dumpDate` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `grossWeightLbs` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `isEmpty` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `netWeightLbs` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `proofGallons` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `tareWeightLbs` on the `containers` table. All the data in the column will be lost.
  - You are about to drop the column `wineGallons` on the `containers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "containers" DROP COLUMN "capacityGallons",
DROP COLUMN "containerNumber",
DROP COLUMN "containerType",
DROP COLUMN "createdAt",
DROP COLUMN "currentVolumeGallons",
DROP COLUMN "dumpDate",
DROP COLUMN "grossWeightLbs",
DROP COLUMN "isEmpty",
DROP COLUMN "netWeightLbs",
DROP COLUMN "proofGallons",
DROP COLUMN "tareWeightLbs",
DROP COLUMN "wineGallons",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "netWeight" DECIMAL(10,2),
ADD COLUMN     "tareWeight" DECIMAL(10,2),
ADD COLUMN     "type" TEXT;
