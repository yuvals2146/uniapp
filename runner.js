const {
  getPostionData,
  getPoolexchangeRate,
  getCurrentBlockNumber,
} = require("./getPostionData.js");
const {
  saveOrValidateInitPositionInfo,
  savePositionDataSQL,
  saveNewPosition,
} = require("./savePositionData.js");
const { loadAllPositions } = require("./loadPositionData.js");
const { notify } = require("./notifer.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const logger = require("./logger.js");
const { ETHER } = require("@uniswap/sdk");

// validate_positions_db

let positionsMap = [];
const ETHEREUM_CHAIN_ID = 1;

const init = async () => {
  //await saveOrValidateInitPositionInfo(position);
  positionsMap = (await loadAllPositions()).map((p) => {
    if (p.hasHistoricalData) return;
    return {
      id: p.id,
      chain: p.chainId,
    };
  });
  if (positionsMap.length === 0) {
    logger.error("No positions found in DB");
    process.exit(0);
  }
  logger.info("run positions", positionsMap);
  logger.info("init", "done");

  await notify(
    `unihedge Bot is up and running for ${positionsMap.length} positions`,
    "🤖🦄 Startup 🤖🦄"
  );
};

init();

async function data_routine() {
  positionsMap.forEach((position) => {
    logger.info("save and anaylize position:", position);
    getNewDataAndAnalyzed(position);
  });
}

const getNewDataAndAnalyzed = async (position) => {
  const Token0USDRate = await getPoolexchangeRate(
    position.id === ETHEREUM_CHAIN_ID
      ? process.env.ETH_TOKEN0_USDC_POOL_ADDRESS
      : process.env.ARB_TOKEN0_USDC_POOL_ADDRESS
  );

  const Token1USDRate = await getPoolexchangeRate(
    position.id === ETHEREUM_CHAIN_ID
      ? process.env.ETH_TOKEN1_USDC_POOL_ADDRESS
      : process.env.ARB_TOKEN1_USDC_POOL_ADDRESS
  );

  const postionDataFromContract = await getPostionData(position);
  const currentBlockNumber = await getCurrentBlockNumber();
  analyzeDataPoint(
    postionDataFromContract,
    Token0USDRate,
    Token1USDRate,
    parseInt(position.id)
  );
  await savePositionDataSQL(
    postionDataFromContract,
    Token0USDRate,
    Token1USDRate,
    parseInt(position.id),
    currentBlockNumber
  );
};

if (process.env.SKIP_EVENT_LOOP) {
  (function eventLoop() {
    setTimeout(() => {
      data_routine();

      eventLoop();
    }, process.env.INTERVAL);
  })();
}

// serverless.js
