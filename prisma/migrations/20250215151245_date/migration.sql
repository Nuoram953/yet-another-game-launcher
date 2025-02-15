/*
  Warnings:

  - You are about to alter the column `startedAt` on the `Company` table. The data in that column could be lost. The data in that column will be cast from `String` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "country" INTEGER,
    "url" TEXT,
    "startedAt" BIGINT
);
INSERT INTO "new_Company" ("country", "description", "id", "name", "startedAt", "url") SELECT "country", "description", "id", "name", "startedAt", "url" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
