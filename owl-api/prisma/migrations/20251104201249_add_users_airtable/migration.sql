-- CreateTable
CREATE TABLE IF NOT EXISTS "users_airtable" (
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "code" INTEGER NOT NULL,
    "birthday" DATE NOT NULL,

    CONSTRAINT "users_airtable_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_airtable_email_key" ON "users_airtable"("email");

