/*
  Warnings:

  - You are about to drop the column `cmdPath` on the `Emulator` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emulator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "cmd" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Emulator" ("cmd", "createdAt", "id", "name", "path", "updatedAt") SELECT "cmd", "createdAt", "id", "name", "path", "updatedAt" FROM "Emulator";
DROP TABLE "Emulator";
ALTER TABLE "new_Emulator" RENAME TO "Emulator";
CREATE UNIQUE INDEX "Emulator_name_key" ON "Emulator"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
