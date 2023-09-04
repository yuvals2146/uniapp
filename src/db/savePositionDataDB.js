const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger.js");
const {
  retriveInitalPositionData,
} = require("../blockchain/getPostionData.js");
const { chains } = require("../utils/chains.js");

const prisma = new PrismaClient();

const saveInitialPositionInfo = async (position, initData) => {
  await prisma.Position.create({
    data: {
      id: parseInt(position.id),
      chainId: parseInt(position.chain),
      createdAt: new Date(initData.blockTimestemp),
      initValueToken0: parseFloat(initData.initValueToken0),
      token0Symbol: initData.token0symbol,
      initValueToken1: parseFloat(initData.initValueToken1),
      token1Symbol: initData.token1symbol,
      initToken0USDRate: parseFloat(initData.initToken0USDRate),
      initToken1USDRate: parseFloat(initData.initToken1USDRate),
      initPriceT0T1: parseFloat(
        initData.initToken0USDRate / initData.initToken1USDRate
      ),
    },
  });
};

async function savePositionData(
  positionData,
  etherUsdExchangeRate,
  ArbitUsdExchangeRate,
  positionId,
  blockNumber
) {
  let position = await prisma.Position.findUnique({
    where: {
      id: positionId,
    },
  });

  if (!position) throw new Error("position not found");

  await prisma.PositionInfo.create({
    data: {
      positionId: {
        connect: { id: position.id },
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
}

const userSaveNewPosition = async (position, txHash) => {
  let pos = await prisma.Position.findUnique({
    where: {
      id: parseInt(position.id),
    },
  });
  if (pos) {
    logger.error("could not save postition, position already exist");
    return;
  }
  try {
    const initData = await retriveInitalPositionData(position, txHash);
    saveInitialPositionInfo(position, initData);
  } catch (err) {
    logger.error("error in userSaveNewPosition", err);
  }
};
module.exports = {
  savePositionData,
  userSaveNewPosition,
};
