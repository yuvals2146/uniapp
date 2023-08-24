const {
  getPostionData,
  getPoolexchangeRate,
  getCurrentBlockNumber,
} = require("./getPostionData.js");
const {
  saveOrValidateInitPositionInfo,
  savePositionDataSQL,
} = require("./savePositionData.js");
const { notify } = require("./notifer.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const logger = require("./logger.js");

// validate_positions_db
const position = {
  id: process.env.POSITION_ID,
  chain: process.env.CHAIN_ID,
};

const init = async () => {
  await saveOrValidateInitPositionInfo(position);
  logger.info("init", "done");
  await notify(
    `unihedge Bot is up and running for position ${position.id} on chain ${position.chain}`,
    "🤖🦄 Startup 🤖🦄"
  );
};

init();

async function data_routine() {
  const positionId = process.env.POSITION_ID;
  const Token0USDRate = await getPoolexchangeRate(
    process.env.TOKEN0_USDC_POOL_ADDRESS
  );
  console.log("Token0USDRate", Token0USDRate);
  
  const Token1USDRate = await getPoolexchangeRate(
    process.env.TOKEN1_USDC_POOL_ADDRESS
  );
  console.log("Token1USDRate", Token1USDRate);

  const postionDataFromContract = await getPostionData(positionId);
  console.log("postionDataFromContract", postionDataFromContract);
  const currentBlockNumber = await getCurrentBlockNumber();
  console.log("currentBlockNumber", currentBlockNumber);
  analyzeDataPoint(
    postionDataFromContract,
    Token0USDRate,
    Token1USDRate,
    parseInt(positionId)
  );
  await savePositionDataSQL(
    postionDataFromContract,
    Token0USDRate,
    Token1USDRate,
    parseInt(positionId),
    currentBlockNumber
  );
}

(function loop() {
  setTimeout(() => {
    data_routine();

    loop();
  }, process.env.INTERVAL);
})();
