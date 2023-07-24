/*
  Warnings:

  - You are about to drop the column `poolId` on the `PositionInfo` table. All the data in the column will be lost.
  - Added the required column `inter_pos_id` to the `PositionInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PositionInfo" DROP COLUMN "poolId",
ADD COLUMN     "inter_pos_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PositionInfo" ADD CONSTRAINT "PositionInfo_inter_pos_id_fkey" FOREIGN KEY ("inter_pos_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
