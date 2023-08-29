const { PrismaClient } = require("@prisma/client");
const logger = require("./logger.js");
const { queryTheGraphForMintTransactHash } = require("./queryTheGraph.js");
const { loadPositionInitDataByTxHash } = require("./getPostionData.js");
const { fetchHistoricalPriceData } = require("./binance.js");
const { notify } = require("./notifer.js");
const { chains } = require("./chains.js");

const prisma = new PrismaClient();

const saveNewPositionInDB = async (position, initData) => {
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
async function savePositionDataSQL(
  positionData,
  etherUsdExchangeRate,
  ArbitUsdExchangeRate,
  positionId,
  blockNumber
) {
  let pid = await prisma.Position.findUnique({
    where: {
      id: positionId,
    },
  });

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
}

const retriveInitalAndHistoricalData = async (position, txHash = null) => {
  // load position from mint txHash
  let initData;
  try {
    const tx = txHash
      ? txHash
      : await queryTheGraphForMintTransactHash(position);
    initData = await loadPositionInitDataByTxHash(tx, position);

    if (!initData) throw new Error("no init data found");
    const [initToken0USDRate, initToken1USDRate] =
      await fetchHistoricalPriceData(
        initData.token0symbol,
        initData.token1symbol,
        initData.blockTimestemp
      );
    initData.initToken0USDRate = initToken0USDRate;
    initData.initToken1USDRate = initToken1USDRate;
  } catch (e) {
    if (!initData.initToken0USDRate || !initData.initToken1USDRate) {
      logger.error(e.message);
      logger.error("No historical data found for position", position.id);
      notify(
        "🪙🕰️ Action Needed 🕰️🪙",
        `No historical data found for position ${position.id} on chain ${
          chains[position.chain].name
        } please do it manually`
      );
    } else {
      logger.error(e.message);
      logger.error("No init data found for position", position.id);
      notify(
        "🪙🕰️ Action Needed 🕰️🪙",
        `No initial data found for position ${position.id} on chain ${
          chains[position.chain].name
        } please do it manually`
      );
    }
  }

  return initData;
};

const userSaveHistoricalDataToPosition = async (
  position,
  initToken0USDRate,
  initToken1USDRate
) => {
  let pos = await prisma.Position.findUnique({
    where: {
      id: position.id,
    },
  });
  if (!pos) {
    logger.note(`Position id Not Exist`, position.id);
    notify(
      "🔴🆔Error with fetch position ID 🆔🔴",
      `are you sure you alredy saved this position? please duble check positionID: ${position.id} and chainID: ${chain.id}`
    );
    return;
  }

  await prisma.Position.update({
    where: {
      id: position.id,
    },
    data: {
      initToken0USDRate,
      initToken1USDRate,
      initPriceT0T1: initToken0USDRate / initToken1USDRate,
    },
  });
};

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
    const initData = await retriveInitalAndHistoricalData(position, txHash);
    saveNewPositionInDB(position, initData);
  } catch (err) {
    logger.error("error in userSaveNewPosition", err);
  }
};
module.exports = {
  savePositionDataSQL,
  userSaveHistoricalDataToPosition,
  userSaveNewPosition,
};
