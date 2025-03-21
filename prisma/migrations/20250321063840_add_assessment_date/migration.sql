-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssessmentType" ADD VALUE 'HOMEWORK';
ALTER TYPE "AssessmentType" ADD VALUE 'DAILY_TEST';

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
