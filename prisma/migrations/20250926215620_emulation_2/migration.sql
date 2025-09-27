/*
  Warnings:

  - You are about to drop the column `emulatorPlatformId` on the `Emulator` table. All the data in the column will be lost.
  - You are about to drop the column `emulatorPlatformId` on the `Platform` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId,platformId]` on the table `GamePlatform` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emulatorId` to the `EmulatorPlatform` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformId` to the `EmulatorPlatform` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emulator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Emulator" ("createdAt", "id", "name", "updatedAt", "website") SELECT "createdAt", "id", "name", "updatedAt", "website" FROM "Emulator";
DROP TABLE "Emulator";
ALTER TABLE "new_Emulator" RENAME TO "Emulator";
CREATE UNIQUE INDEX "Emulator_name_key" ON "Emulator"("name");
CREATE TABLE "new_EmulatorPlatform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emulatorId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmulatorPlatform_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmulatorPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EmulatorPlatform" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "EmulatorPlatform";
DROP TABLE "EmulatorPlatform";
ALTER TABLE "new_EmulatorPlatform" RENAME TO "EmulatorPlatform";
CREATE UNIQUE INDEX "EmulatorPlatform_emulatorId_platformId_key" ON "EmulatorPlatform"("emulatorId", "platformId");
CREATE TABLE "new_Platform" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emulatorId" INTEGER,
    CONSTRAINT "Platform_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Platform" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Platform";
DROP TABLE "Platform";
ALTER TABLE "new_Platform" RENAME TO "Platform";
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GamePlatform_gameId_platformId_key" ON "GamePlatform"("gameId", "platformId");
