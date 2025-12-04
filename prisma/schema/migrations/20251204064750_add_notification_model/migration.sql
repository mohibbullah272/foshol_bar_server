-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDeliver" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationDeliver_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationDeliver" ADD CONSTRAINT "NotificationDeliver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
