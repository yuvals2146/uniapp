-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "initValueToken0" DOUBLE PRECISION NOT NULL,
    "token0Symbol" TEXT NOT NULL,
    "initValueToken1" DOUBLE PRECISION NOT NULL,
    "token1Symbol" TEXT NOT NULL,
    "initToken0USDRate" DOUBLE PRECISION,
    "initToken1USDRate" DOUBLE PRECISION,
    "initPriceT0T1" DOUBLE PRECISION,
    "chainId" INTEGER NOT NULL,
    "HasHistoricalData" BOOLEAN NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionInfo" (
    "id" SERIAL NOT NULL,
    "inter_pos_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pair" TEXT NOT NULL,
    "liquidityToken0" DOUBLE PRECISION NOT NULL,
    "liquidityToken1" DOUBLE PRECISION NOT NULL,
    "feesToken0" DOUBLE PRECISION NOT NULL,
    "feesToken1" DOUBLE PRECISION NOT NULL,
    "priceToken0" DOUBLE PRECISION NOT NULL,
    "etherUsdExchangeRate" DOUBLE PRECISION NOT NULL,
    "ArbitUsdExchangeRate" DOUBLE PRECISION NOT NULL,
    "blockNumber" INTEGER NOT NULL,

    CONSTRAINT "PositionInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PositionInfo" ADD CONSTRAINT "PositionInfo_inter_pos_id_fkey" FOREIGN KEY ("inter_pos_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
