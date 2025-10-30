/*
 Warnings:
 
 - The values [SAMPLE_ADJUST] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
 
 */
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TransactionType_new" AS ENUM (
  'CREATE_EMPTY_CONTAINER',
  'CREATE_FILLED_CONTAINER',
  'DELETE_EMPTY_CONTAINER',
  'DELETE_FILLED_CONTAINER',
  'EDIT_EMPTY_DATA_CORRECTION',
  'EDIT_FILL_DATA_CORRECTION',
  'EDIT_FILL_FROM_EMPTY',
  'EDIT_EMPTY_FROM_FILLED',
  'REFILL_CONTAINER',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'PRODUCTION',
  'DISTILLATION_FINISH',
  'FERMENTATION_FINISH',
  'SAMPLE_ADJUST',
  'ADJUST_CONTAINER_ADD',
  'ADJUST_CONTAINER_REMOVE',
  'PROOF_DOWN',
  'BOTTLE_KEEP',
  'BOTTLE_EMPTY',
  'BOTTLING_GAIN',
  'BOTTLING_LOSS',
  'DELETE_PRODUCT',
  'DELETE_PRODUCTION_BATCH',
  'CHANGE_ACCOUNT'
);
ALTER TABLE "public"."transactions"
ALTER COLUMN "transactionType" TYPE "public"."TransactionType_new" USING (
    "transactionType"::text::"public"."TransactionType_new"
  );
ALTER TYPE "public"."TransactionType"
RENAME TO "TransactionType_old";
ALTER TYPE "public"."TransactionType_new"
RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;