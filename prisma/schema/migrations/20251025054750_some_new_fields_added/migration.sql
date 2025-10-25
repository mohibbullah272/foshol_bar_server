-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CROPS', 'LIVESTOCK', 'HORTICULTURE', 'FISHERIES', 'INPUT_SUPPLY', 'AGRO_INDUSTRY', 'FARM_EQUIPMENT', 'AGRI_TECH', 'IRRIGATION_SYSTEMS', 'SUSTAINABLE_FARMING', 'STORAGE_LOGISTICS', 'AGRICULTURAL_FINANCE', 'LAND_ACQUISITION', 'RENEWABLE_ENERGY', 'AGRICULTURAL_RESEARCH', 'VALUE_CHAIN_INTEGRATION', 'FORESTRY', 'PEST_DISEASE_CONTROL', 'WATER_MANAGEMENT', 'SOIL_HEALTH');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INVESTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'BLOCKED');

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
    "status" "paymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethods" NOT NULL DEFAULT 'NAGAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT[],
    "totalShare" TEXT NOT NULL,
    "sharePrice" TEXT NOT NULL,
    "profitPerShare" TEXT NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "Duration" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "progressUpdateImage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progressUpdate" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progressUpdateDate" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "category" "Category" NOT NULL,
    "keywords" TEXT[],
    "estimatedROI" DOUBLE PRECISION,
    "roiCalculation" TEXT,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
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
    "role" "Role" NOT NULL DEFAULT 'INVESTOR',
    "status" "Status" NOT NULL DEFAULT 'PENDING',
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
    "passportImage" TEXT,
    "birthCertificateImage" TEXT,
    "userImage" TEXT NOT NULL,
    "nidImage" TEXT,
    "status" "KycStatus" NOT NULL DEFAULT 'NOTREQUSTED',

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
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
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
