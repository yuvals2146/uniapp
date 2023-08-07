const { createClient } = require("redis");
const { PrismaClient } = require("@prisma/client");
const logger = require("./logger.js");

async function saveOrValidateInitPositionInfo(positionId) {
  const prisma = new PrismaClient();
  let position = await prisma.Position.findUnique({
    where: {
      id: positionId,
    },
  });
  if (position) {
    logger.note("Found position ID", positionId);
    return;
  }
  // if not add it
  logger.info("Saving initial position data to SQL", positionId);
  const Position = await prisma.Position.create({
    data: {
      id: positionId,
    },
  });
}

async function savePositionDataSQL(
  positionData,
  etherUsdExchangeRate,
  ArbitUsdExchangeRate,
  positionId,
  blockNumber
) {
  const prisma = new PrismaClient();
  let pid = await prisma.Position.findUnique({
    where: {
      id: positionId,
    },
  });
  logger.info("Saving position data to SQL", positionData);
  const PositionInfo = await prisma.PositionInfo.create({
    data: {
      positionId: {
        connect: { id: pid.id },
      },
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

module.exports = {
  saveOrValidateInitPositionInfo,
  savePositionDataSQL,
};
