const {
  getPostionData,
  getPoolexchangeRate,
  getCurrentBlockNumber,
} = require("./getPostionData.js");
const {
  saveOrValidateInitPositionInfo,
  savePositionDataSQL,
} = require("./savePositionData.js");
const { queryTheGraph } = require("./queryTheGraph.js");
const {
  notifiy,
  initNotifer,
  pushoverNotify,
  isNotifierReady,
} = require("./notifer.js");
const { checkForAlerts } = require("./alerts.js");
const { analyzeDataPoint } = require("./engine/analyzer.js");
const logger = require("./logger.js");

// validate_positions_db

const init = async () => {
  //await initNotifer();
  await logger.initLogger();
  saveOrValidateInitPositionInfo(parseInt(process.env.POSITION_ID));
  // validate_positions_db();
  logger.info("init", "done");
};
init();

async function data_routine() {
  const positionId = process.env.POSITION_ID;
  const etherUsdExchangeRate = await getPoolexchangeRate(
    process.env.ETHER_USDC_POOL_ADDRESS
  );
  const ArbitUsdExchangeRate = await getPoolexchangeRate(
    process.env.ARB_USDC_POOL_ADDRESS
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
  // await notifiy(
  //   `price1: ${etherUsdExchangeRate} \n price2: ${ArbitUsdExchangeRate} \n poolId: ${positionId}`,
  //   "a GOOD message"
  // );
}

(function loop() {
  setTimeout(() => {
    if (isNotifierReady()) data_routine();

    loop();
  }, process.env.INTERVAL);
})();
