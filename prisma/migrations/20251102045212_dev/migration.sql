-- AlterTable
ALTER TABLE "public"."containers" ADD COLUMN     "containerKindId" TEXT;

-- CreateTable
CREATE TABLE "public"."container_types" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tareWeight" DECIMAL(10,2),
    "totalVolume" DECIMAL(10,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."container_types" ADD CONSTRAINT "container_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."containers" ADD CONSTRAINT "containers_containerKindId_fkey" FOREIGN KEY ("containerKindId") REFERENCES "public"."container_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
