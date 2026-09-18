-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ALTER COLUMN "startsAt" SET NOT NULL,
ALTER COLUMN "timezone" SET NOT NULL,
ALTER COLUMN "timezone" SET DEFAULT 'America/Sao_Paulo';

