/*
  Warnings:

  - The `poolId` column on the `PoolInfo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PoolInfo" DROP COLUMN "poolId",
ADD COLUMN     "poolId" INTEGER;
