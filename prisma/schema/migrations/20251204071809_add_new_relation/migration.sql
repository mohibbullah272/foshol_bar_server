/*
  Warnings:

  - Added the required column `notificationId` to the `NotificationDeliver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NotificationDeliver" ADD COLUMN     "notificationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "NotificationDeliver" ADD CONSTRAINT "NotificationDeliver_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
