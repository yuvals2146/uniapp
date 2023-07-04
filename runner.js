const { getPostionData,getPoolexchangeRate } = require("./getPostionData.js");
const {
  savePositionDataRedis,
  savePositionDataSQL,
} = require("./savePositionData.js");
const { queryTheGraph } = require("./queryTheGraph.js");


async function main() {
  const poolId = 689765;
  const etherUsdExchangeRate = await getPoolexchangeRate(process.env.ETHER_USDC_POOL_ADDRESS);
  const ArbitUsdExchangeRate = await getPoolexchangeRate(process.env.ARB_USDC_POOL_ADDRESS);
  
  const postionDataFromContract = await getPostionData(poolId);

  await savePositionDataSQL(postionDataFromContract,etherUsdExchangeRate,ArbitUsdExchangeRate, poolId);

  //const postionDataFromTheGraph = await queryTheGraph(poolId);

}

main();
