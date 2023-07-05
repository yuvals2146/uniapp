const { createClient } = require("redis");
const { PrismaClient } = require("@prisma/client");

async function savePositionDataSQL(positionData,etherUsdExchangeRate,ArbitUsdExchangeRate ,poolId, blockNumber) {
  const prisma = new PrismaClient();
  console.log("Saving position data to SQL", positionData);
  const poolInfo = await prisma.poolInfo.create({
    data: {
      poolId: poolId,
      pair: positionData.pair,
      liquidityToken0: parseFloat(positionData.liquidityToken0),
      liquidityToken1: parseFloat(positionData.liquidityToken1),
      feesToken0: parseFloat(positionData.feesToken0),
      feesToken1: parseFloat(positionData.feesToken1),
      priceToken0: positionData.priceToken0 / 1e18,
      etherUsdExchangeRate: etherUsdExchangeRate,
      ArbitUsdExchangeRate: ArbitUsdExchangeRate,
      blockNumber: blockNumber,
    },
  });

  console.log("Created poolInfo: ", poolInfo);
}

async function savePositionDataRedis(positionData) {
  const client = createClient();

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  console.log("TEST", positionData);
  await client.hSet("unihedge", {
    pair: positionData.Pair,
  });

  let userSession = await client.hGetAll("unihedge");
  console.log(JSON.stringify(userSession, null, 2));
}

module.exports = {
  savePositionDataRedis,
  savePositionDataSQL,
};
