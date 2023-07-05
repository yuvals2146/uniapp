-- CreateTable
CREATE TABLE "PoolInfo" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "poolId" INTEGER NOT NULL,
    "pair" TEXT NOT NULL,
    "liquidityToken0" DOUBLE PRECISION NOT NULL,
    "liquidityToken1" DOUBLE PRECISION NOT NULL,
    "feesToken0" DOUBLE PRECISION NOT NULL,
    "feesToken1" DOUBLE PRECISION NOT NULL,
    "priceToken0" DOUBLE PRECISION NOT NULL,
    "etherUsdExchangeRate" DOUBLE PRECISION NOT NULL,
    "ArbitUsdExchangeRate" DOUBLE PRECISION NOT NULL,
    "blockNumber" INTEGER NOT NULL,

    CONSTRAINT "PoolInfo_pkey" PRIMARY KEY ("id")
);
