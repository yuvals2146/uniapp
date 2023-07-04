const { getPostionData } = require("./getPostionData.js");
const {
  savePositionDataRedis,
  savePositionDataSQL,
} = require("./savePositionData.js");
const { queryTheGraph } = require("./queryTheGraph.js");

async function main() {
  const poolId = 482139;
  const postionDataFromContract = await getPostionData(poolId);

  //await savePositionDataSQL(postionData, poolId);

  const postionDataFromTheGraph = await queryTheGraph(poolId);

  console.log("postionDataFromContract: ", postionDataFromContract);
  console.log("postionDataFromTheGraph: ", postionDataFromTheGraph);
}

main();
