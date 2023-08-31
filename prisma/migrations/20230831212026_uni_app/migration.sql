/*
  Warnings:

  - You are about to drop the column `ArbitUsdExchangeRate` on the `PositionInfo` table. All the data in the column will be lost.
  - You are about to drop the column `etherUsdExchangeRate` on the `PositionInfo` table. All the data in the column will be lost.
  - Added the required column `token0USDCExchangeRate` to the `PositionInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token1USDCExchangeRate` to the `PositionInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PositionInfo" DROP CONSTRAINT "PositionInfo_inter_pos_id_fkey";

-- AlterTable
ALTER TABLE "PositionInfo" DROP COLUMN "ArbitUsdExchangeRate",
DROP COLUMN "etherUsdExchangeRate",
ADD COLUMN     "token0USDCExchangeRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "token1USDCExchangeRate" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "PositionInfo" ADD CONSTRAINT "PositionInfo_inter_pos_id_fkey" FOREIGN KEY ("inter_pos_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
