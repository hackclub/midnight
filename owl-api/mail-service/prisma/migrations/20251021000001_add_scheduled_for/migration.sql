ALTER TABLE "email_jobs" ADD COLUMN "scheduledFor" TIMESTAMP(3);

CREATE INDEX "email_jobs_scheduledFor_idx" ON "email_jobs"("scheduledFor");


