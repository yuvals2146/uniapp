/*
  Warnings:

  - You are about to drop the column `HasHistoricalData` on the `Position` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Position" DROP COLUMN "HasHistoricalData";
