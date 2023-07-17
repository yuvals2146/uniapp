const { createClient } = require("redis");
const { PrismaClient } = require("@prisma/client");
const logger = require("./logger.js");

async function savePositionDataSQL(
  positionData,
  etherUsdExchangeRate,
  ArbitUsdExchangeRate,
  poolId,
  blockNumber
) {
  const prisma = new PrismaClient();
  logger.info("Saving position data to SQL", positionData);
  const PositionInfo = await prisma.PositionInfo.create({
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

  logger.info("Created PositionInfo: ", PositionInfo);
}

async function savePositionDataRedis(positionData) {
  const client = createClient();

  client.on("error", (err) => logger.error("Redis Client Error", err));

  await client.connect();

  logger.info("TEST", positionData);
  await client.hSet("unihedge", {
    pair: positionData.Pair,
  });

  let userSession = await client.hGetAll("unihedge");
  logger.log('Dany change my name :)',JSON.stringify(userSession, null, 2));
}

module.exports = {
  savePositionDataRedis,
  savePositionDataSQL,
};
