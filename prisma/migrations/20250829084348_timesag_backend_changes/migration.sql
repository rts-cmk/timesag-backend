/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "assignedTo",
ALTER COLUMN "estimate" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."_AssignedTasks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedTasks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AssignedTasks_B_index" ON "public"."_AssignedTasks"("B");

-- AddForeignKey
ALTER TABLE "public"."_AssignedTasks" ADD CONSTRAINT "_AssignedTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AssignedTasks" ADD CONSTRAINT "_AssignedTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
