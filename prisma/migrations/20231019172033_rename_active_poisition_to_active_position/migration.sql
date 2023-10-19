/*
  Warnings:

  - You are about to drop the column `ActivePoisition` on the `Position` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Position" DROP COLUMN "ActivePoisition",
ADD COLUMN     "ActivePosition" BOOLEAN NOT NULL DEFAULT true;
