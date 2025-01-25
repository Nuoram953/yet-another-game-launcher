/*
  Warnings:

  - You are about to drop the `Developer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Publisher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `developerId` on the `GameDeveloper` table. All the data in the column will be lost.
  - You are about to drop the column `publisheId` on the `GamePublisher` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `GameDeveloper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `GamePublisher` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Developer_name_key";

-- DropIndex
DROP INDEX "Publisher_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Developer";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Publisher";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameDeveloper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "GameDeveloper_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameDeveloper_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameDeveloper" ("gameId", "id") SELECT "gameId", "id" FROM "GameDeveloper";
DROP TABLE "GameDeveloper";
ALTER TABLE "new_GameDeveloper" RENAME TO "GameDeveloper";
CREATE TABLE "new_GamePublisher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "GamePublisher_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GamePublisher_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GamePublisher" ("gameId", "id") SELECT "gameId", "id" FROM "GamePublisher";
DROP TABLE "GamePublisher";
ALTER TABLE "new_GamePublisher" RENAME TO "GamePublisher";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
