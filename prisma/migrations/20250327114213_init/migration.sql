-- CreateTable
CREATE TABLE "Update" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COBBLEMON_BASE',
    "filename" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versionString" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PatchNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "html" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Update_name_key" ON "Update"("name");
