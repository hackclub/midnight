-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "fulfilled_at" TIMESTAMP(3),
ADD COLUMN     "is_fulfilled" BOOLEAN NOT NULL DEFAULT false;
