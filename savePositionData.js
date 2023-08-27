const { PrismaClient } = require("@prisma/client");
const logger = require("./logger.js");
const { queryTheGraphForMintTransactHash } = require("./queryTheGraph.js");
const { loadPositionInitDataByTxHash } = require("./getPostionData.js");
const { fetchHistoricalPriceData } = require("./binance.js");
const { notify } = require("./notifer.js");
const { chains } = require("./chains.js");

async function saveOrValidateInitPositionInfo(position) {
  const prisma = new PrismaClient();
  let pos = await prisma.Position.findUnique({
    where: {
      id: parseInt(position.id),
    },
  });
  if (pos) {
    return;
  }
  logger.info(`Adding position`, position);
  // if not add it:
  if (!chains[position.chain]?.name) {
    logger.error("Chain Not exist", position.chain);
    notify(
      "🔴🔗 Blockchain not supproted 🔗🔴",
      `please check your chain again: ${position.chain}`
    );
    return;
  }

  const [initData, historicalData] = await retriveInitalAndHistoricalData(
    position
  );
  if (!initData) {
    logger.error("No init data found for position", {
      position_id: position.id,
      blockchain: chains[position.chain].name,
    });
    notify(
      "🔴💾Position NOT Saved💾🔴",
      `No initial data found for position ${position.id} on chain ${
        chains[position.chain].name
      } plase check chain and Position ID or try again later`
    );
    return;
  }

  await prisma.Position.create({
    data: {
      id: parseInt(position.id),
      createdAt: new Date(initData.blockTimestemp),
      initValueToken0: parseFloat(initData.initValueToken0),
      token0Symbol: initData.token0symbol,
      initValueToken1: parseFloat(initData.initValueToken1),
      token1Symbol: initData.token1symbol,
      chainId: parseInt(position.chain),
      HasHistoricalData: historicalData ? true : false,
      initToken0USDRate: historicalData
        ? parseFloat(historicalData.initToken0USDRate)
        : null,
      initToken1USDRate: historicalData
        ? parseFloat(historicalData.initToken1USDRate)
        : null,
      initPriceT0T1: historicalData
        ? parseFloat(
            historicalData.initToken0USDRate / historicalData.initToken1USDRate
          )
        : null,
    },
  });
  logger.note("Saved initial position data to SQL", position.id);
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

const retriveInitalAndHistoricalData = async (position) => {
  // load position from mint txHash
  const tx = await queryTheGraphForMintTransactHash(position);
  const initData = await loadPositionInitDataByTxHash(tx, position);
  if (!initData) return [null, null];
  let historicalData;
  try {
    historicalData = await fetchHistoricalPriceData(
      initData.token0symbol,
      initData.token1symbol,
      initData.blockTimestemp
    );
  } catch (err) {
    logger.error("No historical data found for position", position.id);
    notify(
      "🪙🕰️ Action Needed 🕰️🪙",
      `No historical data found for position ${position.id} on chain ${
        chains[position.chain].name
      } for tokens ${initData.token0symbol} and ${
        initData.token1symbol
      } please do it manually`
    );
  }
  return [initData, historicalData];
};

const userSaveHistoricalDataToPosition = async (
  position,
  initToken0USDRate,
  initToken1USDRate
) => {
  const prisma = new PrismaClient();
  let pos = await prisma.Position.findUnique({
    where: {
      id: position.id,
    },
  });
  if (!position) {
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

const userSaveNewPosition = async (position, txHash) => {};
module.exports = {
  saveOrValidateInitPositionInfo,
  savePositionDataSQL,
  userSaveHistoricalDataToPosition,
  userSaveNewPosition,
};
