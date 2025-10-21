ALTER TABLE "email_jobs" ADD COLUMN "lockedBy" TEXT;
ALTER TABLE "email_jobs" ADD COLUMN "lockedAt" TIMESTAMP(3);
ALTER TABLE "email_jobs" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "email_jobs_lockedBy_idx" ON "email_jobs"("lockedBy");


