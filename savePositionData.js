const { createClient } = require("redis");
const { PrismaClient } = require("@prisma/client");

async function savePositionDataSQL(positionData, poolId) {
  const prisma = new PrismaClient();

  const poolInfo = await prisma.poolInfo.create({
    data: {
      poolId: poolId,
      feesToken0: parseInt(positionData.feesToken0),
      feesToken1: parseInt(positionData.feesToken1),
      priceToken0: parseInt(positionData.priceToken0),
      priceToken1: parseInt(positionData.priceToken1),
      pair: positionData.pair,
      liquidity: parseInt(positionData.liquidity),
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
