/*
  Warnings:

  - You are about to drop the column `ownerUsername` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `TodoItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_TodoItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "username" TEXT NOT NULL,
    "createdBy" TEXT,
    "kanbanTaskId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TodoItem_kanbanTaskId_fkey" FOREIGN KEY ("kanbanTaskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TodoItem" ("completed", "createdAt", "createdBy", "description", "dueDate", "id", "priority", "title", "updatedAt", "username") SELECT "completed", "createdAt", "createdBy", "description", "dueDate", "id", "priority", "title", "updatedAt", "username" FROM "TodoItem";
DROP TABLE "TodoItem";
ALTER TABLE "new_TodoItem" RENAME TO "TodoItem";
CREATE INDEX "TodoItem_kanbanTaskId_idx" ON "TodoItem"("kanbanTaskId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
