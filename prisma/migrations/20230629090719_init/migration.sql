-- CreateTable
CREATE TABLE "PoolInfo" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feesToken0" INTEGER NOT NULL,
    "feesToken1" INTEGER NOT NULL,
    "priceToken0" INTEGER NOT NULL,
    "priceToken1" INTEGER NOT NULL,
    "pair" TEXT NOT NULL,
    "liquidity" INTEGER NOT NULL,

    CONSTRAINT "PoolInfo_pkey" PRIMARY KEY ("id")
);
