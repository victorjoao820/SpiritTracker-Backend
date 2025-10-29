/*
  Warnings:

  - The values [SAMPLE_ADJUST] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('CREATE_EMPTY_CONTAINER', 'CREATE_FILLED_CONTAINER', 'DELETE_EMPTY_CONTAINER', 'DELETE_FILLED_CONTAINER', 'EDIT_EMPTY_DATA_CORRECTION', 'EDIT_FILL_DATA_CORRECTION', 'EDIT_FILL_FROM_EMPTY', 'EDIT_EMPTY_FROM_FILLED', 'REFILL_CONTAINER', 'TRANSFER_IN', 'TRANSFER_OUT', 'PRODUCTION', 'DISTILLATION_FINISH', 'FERMENTATION_FINISH', 'ADJUST_CONTAINER_ADD', 'ADJUST_CONTAINER_REMOVE', 'PROOF_DOWN', 'BOTTLE_KEEP', 'BOTTLE_EMPTY', 'BOTTLING_GAIN', 'BOTTLING_LOSS', 'DELETE_PRODUCT', 'DELETE_PRODUCTION_BATCH', 'CHANGE_ACCOUNT');
ALTER TABLE "transactions" ALTER COLUMN "transactionType" TYPE "TransactionType_new" USING ("transactionType"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;
