/*
  Warnings:

  - You are about to drop the `TaskAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TaskAssignment" DROP CONSTRAINT "TaskAssignment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TaskAssignment" DROP CONSTRAINT "TaskAssignment_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "public"."TaskAssignment";

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
