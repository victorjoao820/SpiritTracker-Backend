-- AlterTable
ALTER TABLE "containers" ADD COLUMN     "account" TEXT,
ADD COLUMN     "grossWeightLbs" DECIMAL(10,2),
ADD COLUMN     "netWeightLbs" DECIMAL(10,2),
ADD COLUMN     "proofGallons" DECIMAL(10,2),
ADD COLUMN     "tareWeightLbs" DECIMAL(10,2),
ADD COLUMN     "wineGallons" DECIMAL(10,2);
