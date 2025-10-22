/*
  Warnings:

  - Added the required column `userImage` to the `KYC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KYC" ADD COLUMN     "birthCertificateImage" TEXT,
ADD COLUMN     "nidImage" TEXT,
ADD COLUMN     "passportImage" TEXT,
ADD COLUMN     "userImage" TEXT NOT NULL;
