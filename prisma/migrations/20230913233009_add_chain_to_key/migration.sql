/*
  Warnings:

  - The primary key for the `Position` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `inter_pos_id` on the `PositionInfo` table. All the data in the column will be lost.
  - Added the required column `posChain` to the `PositionInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posId` to the `PositionInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PositionInfo" DROP CONSTRAINT "PositionInfo_inter_pos_id_fkey";

-- AlterTable
ALTER TABLE "Position" DROP CONSTRAINT "Position_pkey",
ADD CONSTRAINT "Position_pkey" PRIMARY KEY ("id", "chainId");

-- AlterTable
ALTER TABLE "PositionInfo" DROP COLUMN "inter_pos_id",
ADD COLUMN     "posChain" INTEGER NOT NULL,
ADD COLUMN     "posId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "PositionInfo" ADD CONSTRAINT "PositionInfo_posId_posChain_fkey" FOREIGN KEY ("posId", "posChain") REFERENCES "Position"("id", "chainId") ON DELETE CASCADE ON UPDATE CASCADE;
