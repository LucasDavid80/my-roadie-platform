-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "federativeUnit" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "instruments" TEXT[],
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minCache" DECIMAL(10,2),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "styles" TEXT[],
ADD COLUMN     "youtubeLink" TEXT;
