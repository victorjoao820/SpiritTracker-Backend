/*
  Warnings:

  - You are about to drop the column `totalVolume` on the `container_kinds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."container_kinds" DROP COLUMN "totalVolume",
ADD COLUMN     "capacityGallons" DECIMAL(10,2);

-- DropEnum
DROP TYPE "public"."ContainerType";
