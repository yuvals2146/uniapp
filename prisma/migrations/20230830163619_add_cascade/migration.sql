-- DropForeignKey
ALTER TABLE "PositionInfo" DROP CONSTRAINT "PositionInfo_inter_pos_id_fkey";

-- AddForeignKey
ALTER TABLE "PositionInfo" ADD CONSTRAINT "PositionInfo_inter_pos_id_fkey" FOREIGN KEY ("inter_pos_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
