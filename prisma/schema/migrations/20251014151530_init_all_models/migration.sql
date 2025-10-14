-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NOTREQUSTED', 'PENDING', 'APPROVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOTREQUSTED', 'APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentMethods" AS ENUM ('BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'BANK', 'UCB');

-- CreateEnum
CREATE TYPE "paymentStatus" AS ENUM ('APPROVED', 'PENDING');

-- CreateTable
CREATE TABLE "Investment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "shareBought" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalShare" TEXT NOT NULL,
    "sharePrice" TEXT NOT NULL,
    "profitPerShare" TEXT NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "Duration" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "progressUpdate" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "address" TEXT,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "Status" NOT NULL DEFAULT 'NOTREQUSTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYC" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nidNumber" INTEGER,
    "birthCertificateNumber" INTEGER,
    "passportNumber" INTEGER,
    "status" "KycStatus" NOT NULL DEFAULT 'NOTREQUSTED',

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "method" "PaymentMethods" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "paymentStatus" NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "methodName" "PaymentMethods" NOT NULL,
    "number" INTEGER NOT NULL,
    "accountName" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_userId_key" ON "KYC"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_nidNumber_key" ON "KYC"("nidNumber");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_birthCertificateNumber_key" ON "KYC"("birthCertificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_passportNumber_key" ON "KYC"("passportNumber");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
