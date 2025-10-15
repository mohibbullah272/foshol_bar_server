-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "image" TEXT[],
ADD COLUMN     "progressUpdateImage" TEXT[] DEFAULT ARRAY[]::TEXT[];
