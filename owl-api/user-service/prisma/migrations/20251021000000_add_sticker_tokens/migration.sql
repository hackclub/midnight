CREATE TABLE "sticker_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "rsvpNumber" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sticker_tokens_token_key" ON "sticker_tokens"("token");
CREATE INDEX "sticker_tokens_token_idx" ON "sticker_tokens"("token");
CREATE INDEX "sticker_tokens_email_idx" ON "sticker_tokens"("email");


