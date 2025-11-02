/*
  Warnings:

  - You are about to drop the `container_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."container_types" DROP CONSTRAINT "container_types_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."containers" DROP CONSTRAINT "containers_containerKindId_fkey";

-- DropTable
DROP TABLE "public"."container_types";

-- CreateTable
CREATE TABLE "public"."container_kinds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tareWeight" DECIMAL(10,2),
    "totalVolume" DECIMAL(10,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_kinds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."container_kinds" ADD CONSTRAINT "container_kinds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_containerKindId_fkey" FOREIGN KEY ("containerKindId") REFERENCES "public"."container_kinds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
