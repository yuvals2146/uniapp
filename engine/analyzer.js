const { getPostionData, getTickAtSqrtRatio } = require("../getPostionData.js");
const { notify } = require("../notifer.js");
const { logger } = require("../logger.js");

async function analyzeDataPoint(
  positionData
  //  etherUsdExchangeRate,
  //  ArbitUsdExchangeRate,
  //  blockNumber
) {
  console.log(
    "analyze",
    positionData.tickLeft,
    ",",
    positionData.tickRight,
    ",",
    positionData.tickCurr,
    "\n"
  );

  // check position boundaries
  if (
    positionData.currPrice >= positionData.tickRight ||
    positionData.currPrice <= positionData.tickLeft
  ) {
    logger.info("Position Out of Limits", positionData.currPrice);
    await notify(
      `Position Out of Limits: ${positionData.currPrice}`,
      "*Title*"
    );
  }

  // check position lifetime

  // check position P&L (if enough profitable notify - suggest exit)

  // check position IL

  // check pair characteristics

  // check liquidity in surroudings
}

module.exports = {
  analyzeDataPoint,
};
