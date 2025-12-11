-- CreateTable
CREATE TABLE "Rivew" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Rivew_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rivew" ADD CONSTRAINT "Rivew_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rivew" ADD CONSTRAINT "Rivew_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
