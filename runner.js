const {
  getPostionData,
  getPoolexchangeRate,
  getCurrentBlockNumber,
} = require("./getPostionData.js");
const {
  savePositionDataRedis,
  savePositionDataSQL,
} = require("./savePositionData.js");
const { queryTheGraph } = require("./queryTheGraph.js");
// const { notifiy, initNotifer } = require("./notifer.js");
const { checkForAlerts } = require("./alerts.js");
const { analyzeDataPoint } = require("./engine/core_module.js");

async function main() {
  // initNotifer();
  const poolId = 689765;
  const etherUsdExchangeRate = await getPoolexchangeRate(
    process.env.ETHER_USDC_POOL_ADDRESS
  );
  const ArbitUsdExchangeRate = await getPoolexchangeRate(
    process.env.ARB_USDC_POOL_ADDRESS
  );
  const postionDataFromContract = await getPostionData(poolId);
  const currentBlockNumber = await getCurrentBlockNumber();
  analyzeDataPoint(postionDataFromContract);
  // await savePositionDataSQL(postionDataFromContract,etherUsdExchangeRate,ArbitUsdExchangeRate, poolId,currentBlockNumber);
  //const postionDataFromTheGraph = await queryTheGraph(poolId);
  //await checkForAlerts(postionDataFromContract,etherUsdExchangeRate,ArbitUsdExchangeRate, poolId);
  //await notifiy();
}

(function loop() {
  setTimeout(() => {
    main();

    loop();
  }, process.env.INTERVAL);
})();
