/*
  Warnings:

  - You are about to drop the column `investmentId` on the `payment` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."payment" DROP CONSTRAINT "payment_investmentId_fkey";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "investmentId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
