-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "investmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
