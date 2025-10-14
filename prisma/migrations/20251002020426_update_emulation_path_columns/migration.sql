/*
  Warnings:

  - You are about to drop the column `longName` on the `EmulatorOption` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `EmulatorOption` table. All the data in the column will be lost.
  - Added the required column `name` to the `EmulatorOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Emulator" ADD COLUMN "cmdPath" TEXT;
ALTER TABLE "Emulator" ADD COLUMN "path" TEXT;

-- AlterTable
ALTER TABLE "GameLaunchEmulation" ADD COLUMN "path" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmulatorOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emulatorId" INTEGER,
    "name" TEXT NOT NULL,
    "short" TEXT,
    "long" TEXT,
    "description" TEXT,
    "defautlValue" TEXT,
    "showInGameSettings" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmulatorOption_emulatorId_fkey" FOREIGN KEY ("emulatorId") REFERENCES "Emulator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EmulatorOption" ("createdAt", "defautlValue", "description", "emulatorId", "id", "updatedAt") SELECT "createdAt", "defautlValue", "description", "emulatorId", "id", "updatedAt" FROM "EmulatorOption";
DROP TABLE "EmulatorOption";
ALTER TABLE "new_EmulatorOption" RENAME TO "EmulatorOption";
CREATE UNIQUE INDEX "EmulatorOption_emulatorId_name_key" ON "EmulatorOption"("emulatorId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
