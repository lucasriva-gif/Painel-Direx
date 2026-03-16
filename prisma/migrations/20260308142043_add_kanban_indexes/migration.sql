-- DropIndex
DROP INDEX "Column_projectId_idx";

-- DropIndex
DROP INDEX "Task_columnId_idx";

-- CreateIndex
CREATE INDEX "Column_projectId_order_idx" ON "Column"("projectId", "order");

-- CreateIndex
CREATE INDEX "Task_columnId_order_idx" ON "Task"("columnId", "order");
