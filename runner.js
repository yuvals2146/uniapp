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

const init = async () => {
  saveOrValidateInitPositionInfo(parseInt(process.env.POSITION_ID));
  logger.info("init", "done");
  await notify(
    `unihedge Bot is up and running for position ${process.env.POSITION_ID}`,
    "🤖🦄 Startup 🤖🦄"
  );
};

init();

async function data_routine() {
  const positionId = process.env.POSITION_ID;
  const Token0USDRate = await getPoolexchangeRate(
    process.env.TOKEN0_USDC_POOL_ADDRESS
  );
  const Token1USDRate = await getPoolexchangeRate(
    process.env.TOKEN1_USDC_POOL_ADDRESS
  );

  const postionDataFromContract = await getPostionData(positionId);
  const currentBlockNumber = await getCurrentBlockNumber();
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
  //const postionDataFromTheGraph = await queryTheGraph(poolId);
  //await checkForAlerts(postionDataFromContract,etherUsdExchangeRate,ArbitUsdExchangeRate, poolId);
}

(function loop() {
  setTimeout(() => {
    data_routine();

    loop();
  }, process.env.INTERVAL);
})();
