-- AlterTable
ALTER TABLE "ExternalReview" ADD COLUMN "author" TEXT;
ALTER TABLE "ExternalReview" ADD COLUMN "reviewedAt" DATETIME;
ALTER TABLE "ExternalReview" ADD COLUMN "source" TEXT;
ALTER TABLE "ExternalReview" ADD COLUMN "timePlayed" INTEGER DEFAULT 0;
