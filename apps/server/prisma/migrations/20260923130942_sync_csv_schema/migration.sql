-- AlterEnum
ALTER TYPE "OpportunityType" ADD VALUE 'FULL_TIME';

-- AlterTable
ALTER TABLE "AssessmentQuestion" ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "difficultyLevel" TEXT,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "questionType" TEXT DEFAULT 'MCQ',
ADD COLUMN     "score" INTEGER DEFAULT 10,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "CareerRole" ADD COLUMN     "industryCategory" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "CareerRoleSkill" ADD COLUMN     "importance" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "verificationStatus" TEXT DEFAULT 'VERIFIED';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rawStipend" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE',
ADD COLUMN     "subCategory" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "department" TEXT,
ADD COLUMN     "semester" INTEGER;
