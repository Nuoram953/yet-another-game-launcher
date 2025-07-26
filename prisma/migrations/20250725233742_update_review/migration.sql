/*
  Warnings:

  - You are about to drop the column `score` on the `ExternalReview` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExternalReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "review" TEXT NOT NULL,
    "isPositive" BOOLEAN NOT NULL,
    "isCritic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ExternalReview" ("createdAt", "id", "isCritic", "isPositive", "review") SELECT "createdAt", "id", "isCritic", "isPositive", "review" FROM "ExternalReview";
DROP TABLE "ExternalReview";
ALTER TABLE "new_ExternalReview" RENAME TO "ExternalReview";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
