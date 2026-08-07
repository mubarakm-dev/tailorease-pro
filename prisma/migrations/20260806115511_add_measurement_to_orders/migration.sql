-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "measurementId" TEXT;

-- CreateIndex
CREATE INDEX "Order_measurementId_idx" ON "Order"("measurementId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
