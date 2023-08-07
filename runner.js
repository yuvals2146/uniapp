const {
  getPostionData,
  getPoolexchangeRate,
  getCurrentBlockNumber,
} = require("./getPostionData.js");
const {
  saveOrValidateInitPositionInfo,
  savePositionDataSQL,
} = require("./savePositionData.js");
const { notifiy } = require("./notifer.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const logger = require("./logger.js");

// validate_positions_db

const init = async () => {
  saveOrValidateInitPositionInfo(parseInt(process.env.POSITION_ID));
  logger.info("init", "done");
  await notifiy(
    `unihedge Bot is up and running for position ${process.env.POSITION_ID}`,
    "🤖🦄 Startup 🤖🦄"
  );
};

init();

async function data_routine() {
  const positionId = process.env.POSITION_ID;
  const etherUsdExchangeRate = await getPoolexchangeRate(
    process.env.TOKEN0_USDC_POOL_ADDRESS
  );
  const ArbitUsdExchangeRate = await getPoolexchangeRate(
    process.env.TOKEN1_USDC_POOL_ADDRESS
  );

  const postionDataFromContract = await getPostionData(positionId);
  const currentBlockNumber = await getCurrentBlockNumber();
  analyzeDataPoint(postionDataFromContract);
  await savePositionDataSQL(
    postionDataFromContract,
    etherUsdExchangeRate,
    ArbitUsdExchangeRate,
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
