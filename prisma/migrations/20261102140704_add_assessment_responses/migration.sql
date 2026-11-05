-- CreateEnum
CREATE TYPE "MathSkill" AS ENUM ('REPRESENTAR', 'MODELAR', 'RESOLVER_PROBLEMAS', 'ARGUMENTAR_COMUNICAR');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'AUTO_GRADED', 'TEACHER_REVIEWED');

-- CreateTable
CREATE TABLE "AssessmentResponse" (
    "id" TEXT NOT NULL,
    "submissionKey" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "skill" "MathSkill" NOT NULL,
    "studentId" TEXT,
    "groupId" TEXT,
    "answerJson" TEXT NOT NULL,
    "points" DOUBLE PRECISION,
    "maxPoints" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResponse_submissionKey_key" ON "AssessmentResponse"("submissionKey");

-- CreateIndex
CREATE INDEX "AssessmentResponse_activityKey_skill_idx" ON "AssessmentResponse"("activityKey", "skill");

-- CreateIndex
CREATE INDEX "AssessmentResponse_studentId_createdAt_idx" ON "AssessmentResponse"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentResponse_groupId_createdAt_idx" ON "AssessmentResponse"("groupId", "createdAt");

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LearningGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
