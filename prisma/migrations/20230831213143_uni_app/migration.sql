/*
  Warnings:

  - You are about to drop the column `priceToken0` on the `PositionInfo` table. All the data in the column will be lost.
  - Added the required column `token0Token1Rate` to the `PositionInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PositionInfo" DROP COLUMN "priceToken0",
ADD COLUMN     "token0Token1Rate" DOUBLE PRECISION NOT NULL;
