-- CreateTable
CREATE TABLE "MediaDefault" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediaName" TEXT NOT NULL,
    "mediaTypeId" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "MediaDefault_mediaTypeId_fkey" FOREIGN KEY ("mediaTypeId") REFERENCES "MediaType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MediaDefault_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaDefault_mediaTypeId_gameId_key" ON "MediaDefault"("mediaTypeId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaType_name_key" ON "MediaType"("name");

INSERT  INTO "MediaType" (name) VALUES ('cover');
INSERT  into "MediaType" (name) values ('background');
INSERT  into "MediaType" (name) values ('logo');
INSERT  into "MediaType" (name) values ('icon');
INSERT  into "MediaType" (name) values ('trailer');
INSERT  into "MediaType" (name) values ('achievement');
INSERT  into "MediaType" (name) values ('screenshot');
