const {
  getPostionData,
  getPoolExchangeRate,
  getCurrentBlockNumber,
} = require("./blockchain/getPostionData.js");
const { savePositionData } = require("./db/savePositionDataDB.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const { chains } = require("./utils/chains.js");
const ETHEREUM_CHAIN_ID = 1;

const getNewDataAndAnalyzed = async (position) => {
  try {
    const positionDataFromContract = await getPostionData(position);

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

    const currentBlockNumber = await getCurrentBlockNumber(position.chain);

    savePositionData(
      positionDataFromContract,
      Token0USDCRate,
      Token1USDCRate,
      parseInt(position.id),
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
        chains[position.chain].name
      }. Reason: ${err.message}`
    );
  }
};

module.exports = {
  getNewDataAndAnalyzed,
};
