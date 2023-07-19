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
const { notifiy, initNotifer, pushoverNotify } = require("./notifer.js");
const { checkForAlerts } = require("./alerts.js");
const { analyzeDataPoint } = require("./engine/core_module.js");
const logger = require("./logger.js");

const init = async () => {
  //await initNotifer();
  await logger.initLogger();
  logger.debug("debug", "debug");
  logger.info("init done");
  logger.error("error!");
};

async function main() {
<<<<<<< HEAD
  const poolId = 689765;
=======
  await init();
  const positionId = process.env.POSITION_ID;
>>>>>>> 669a57740ab0bf3d1e1e09884dbf7c380eb54ed5
  const etherUsdExchangeRate = await getPoolexchangeRate(
    process.env.ETHER_USDC_POOL_ADDRESS
  );
  const ArbitUsdExchangeRate = await getPoolexchangeRate(
    process.env.ARB_USDC_POOL_ADDRESS
  );
<<<<<<< HEAD
  
  //const postionDataFromContract = await getPostionData(poolId);
  //const currentBlockNumber = await getCurrentBlockNumber();
  //analyzeDataPoint(postionDataFromContract);
=======
  const postionDataFromContract = await getPostionData(positionId);
  const currentBlockNumber = await getCurrentBlockNumber();
  analyzeDataPoint(postionDataFromContract);
>>>>>>> 669a57740ab0bf3d1e1e09884dbf7c380eb54ed5
  // await savePositionDataSQL(postionDataFromContract,etherUsdExchangeRate,ArbitUsdExchangeRate, poolId,currentBlockNumber);
  //const postionDataFromTheGraph = await queryTheGraph(poolId);
  //await checkForAlerts(postionDataFromContract,etherUsdExchangeRate,ArbitUsdExchangeRate, poolId);
  await notifiy(`price1: ${etherUsdExchangeRate} \n price2: ${ArbitUsdExchangeRate} \n poolId: ${poolId}`, 'a GOOD message');
}

(function loop() {
  setTimeout(() => {
    main();

    loop();
  }, process.env.INTERVAL);
})();
