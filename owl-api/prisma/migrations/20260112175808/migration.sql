/*
  Warnings:

  - The primary key for the `users_airtable` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[slack_user_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `onboard_complete` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."idx_users_email";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "is_fraud" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "airtable_rec_id" SET DATA TYPE TEXT,
ALTER COLUMN "now_hackatime_projects" DROP DEFAULT;

-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "reviewed_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_fraud" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_sus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slack_user_id" TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DATA TYPE TEXT,
ALTER COLUMN "onboard_complete" SET NOT NULL,
ALTER COLUMN "address_line_1" SET DATA TYPE TEXT,
ALTER COLUMN "address_line_2" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "state" SET DATA TYPE TEXT,
ALTER COLUMN "country" SET DATA TYPE TEXT,
ALTER COLUMN "zip_code" SET DATA TYPE TEXT,
ALTER COLUMN "airtable_rec_id" SET DATA TYPE TEXT,
ALTER COLUMN "referral_code" SET DATA TYPE TEXT,
ALTER COLUMN "raffle_pos" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users_airtable" DROP CONSTRAINT "users_airtable_pkey",
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "first_name" SET DATA TYPE TEXT,
ALTER COLUMN "last_name" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "slack_link_tokens" (
    "id" TEXT NOT NULL,
    "slack_user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slack_link_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_items" (
    "item_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "image_url" TEXT,
    "cost" DOUBLE PRECISION NOT NULL,
    "max_per_user" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "shop_item_variants" (
    "variant_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_item_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "item_description" VARCHAR(500) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "gift_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "item_description" VARCHAR(500) NOT NULL,
    "image_url" TEXT NOT NULL,
    "fillout_url" TEXT NOT NULL,
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "email_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "submissions_frozen" BOOLEAN NOT NULL DEFAULT false,
    "submissions_frozen_at" TIMESTAMP(3),
    "submissions_frozen_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "slack_link_tokens_token_key" ON "slack_link_tokens"("token");

-- CreateIndex
CREATE INDEX "slack_link_tokens_token_idx" ON "slack_link_tokens"("token");

-- CreateIndex
CREATE INDEX "slack_link_tokens_slack_user_id_idx" ON "slack_link_tokens"("slack_user_id");

-- CreateIndex
CREATE INDEX "shop_item_variants_item_id_idx" ON "shop_item_variants"("item_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_item_id_idx" ON "transactions"("item_id");

-- CreateIndex
CREATE INDEX "transactions_variant_id_idx" ON "transactions"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "gift_codes_code_key" ON "gift_codes"("code");

-- CreateIndex
CREATE INDEX "gift_codes_code_idx" ON "gift_codes"("code");

-- CreateIndex
CREATE INDEX "gift_codes_email_idx" ON "gift_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_slack_user_id_key" ON "users"("slack_user_id");

-- AddForeignKey
ALTER TABLE "shop_item_variants" ADD CONSTRAINT "shop_item_variants_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "shop_items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "shop_items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "shop_item_variants"("variant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_projects_user_id" RENAME TO "projects_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_submissions_project_id" RENAME TO "submissions_project_id_idx";
