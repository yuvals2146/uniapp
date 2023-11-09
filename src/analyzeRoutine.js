const {
  getPositionData,
  getPoolExchangeRate,
  getCurrentBlockNumber,
} = require("./blockchain/getPositionData.js");
const {
  savePositionData,
  updatePositionActive,
  deletePosition,
} = require("./db/savePositionDataDB.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const { chains } = require("./utils/chains.js");
const logger = require("./utils/logger.js");

const getNewDataAndAnalyze = async (position) => {
  try {
    const positionDataFromContract = await getPositionData(position);

    if (position.ActivePosition === false) {
      // an inactive position will pass the filter and get here only
      // if it's over 90 days old and in that case it should be removed
      await deletePosition(position);
      logger.note(
        "PositionsManager",
        `Removed position ${position.id} on chain ${
          chains[position.chainId].name
        } after over 90 days of inactivity.`
      );
      return;
    } else if (
      positionDataFromContract.liquidityToken0 == parseFloat(0) &&
      positionDataFromContract.liquidityToken1 == parseFloat(0) &&
      positionDataFromContract.feesToken0 == parseFloat(0) &&
      positionDataFromContract.feesToken1 == parseFloat(0)
    ) {
      await updatePositionActive(position, false);
      return;
    }
    const [token0Symbol, token1Symbol] =
      positionDataFromContract.pair.split("/");

    const Token0USDCRate =
      token0Symbol === "USDC" || token0Symbol === "USDT"
        ? 1
        : await getPoolExchangeRate(position, 0);

    const Token1USDCRate =
      token1Symbol === "USDC" || token1Symbol === "USDT"
        ? 1
        : await getPoolExchangeRate(position, 1);

    const currentBlockNumber = await getCurrentBlockNumber(position.chainId);

    savePositionData(
      positionDataFromContract,
      Token0USDCRate,
      Token1USDCRate,
      position,
      currentBlockNumber
    );

    analyzeDataPoint(
      positionDataFromContract,
      Token0USDCRate,
      Token1USDCRate,
      position
    );
  } catch (err) {
    throw new Error(
      `Could not get data and analyze position ${position.id} on chain ${
        chains[position.chainId].name
      }. Reason: ${err.message}`
    );
  }
};

module.exports = {
  getNewDataAndAnalyze,
};
