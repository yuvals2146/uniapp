const { getPoolexchangeRate } = require("./getPostionData.js");
const { savePositionDataSQL } = require("./savePositionData.js");
const { getCurrentBlockNumber } = require("./getPostionData.js");
const { getPostionData } = require("./getPostionData.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const { chains } = require("./chains.js");
const ETHEREUM_CHAIN_ID = 1;

const getNewDataAndAnalyzed = async (position) => {
  try {
    const Token0USDRate = await getPoolexchangeRate(
      position.chain === ETHEREUM_CHAIN_ID
        ? process.env.ETH_TOKEN0_USDC_POOL_ADDRESS
        : process.env.ARB_TOKEN0_USDC_POOL_ADDRESS,
      position.chain
    );
    const Token1USDRate = await getPoolexchangeRate(
      position.chain === ETHEREUM_CHAIN_ID
        ? process.env.ETH_TOKEN1_USDC_POOL_ADDRESS
        : process.env.ARB_TOKEN1_USDC_POOL_ADDRESS,
      position.chain
    );
    const postionDataFromContract = await getPostionData(position);
    const currentBlockNumber = await getCurrentBlockNumber(position.chain);

    savePositionDataSQL(
      postionDataFromContract,
      Token0USDRate,
      Token1USDRate,
      parseInt(position.id),
      currentBlockNumber
    );

    analyzeDataPoint(
      postionDataFromContract,
      Token0USDRate,
      Token1USDRate,
      parseInt(position.id)
    );
  } catch (err) {
    throw new Error(
      `could not get data and analyze psoition ${position.id} 
      on chain ${chains[position.chain].name}
      reason: ${err.message}`
    );
  }
};

module.exports = {
  getNewDataAndAnalyzed,
};
