const { getPostionData, getTickAtSqrtRatio } = require("../getPostionData.js");
const { loadPositionInit } = require("../loadPositionData.js");
const { notify } = require("../notifer.js");
const logger = require("../logger.js");

async function analyzeDataPoint(
  positionData,
  token0USDRate,
  token1USDRate,
  positionId
  //  blockNumber
) {
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
  total_liquidity_token0 =
    parseFloat(positionData.liquidityToken0) +
    parseFloat(positionData.feesToken0);
  total_liquidity_token1 =
    parseFloat(positionData.liquidityToken1) +
    parseFloat(positionData.feesToken1);
  amount_token0_usd = total_liquidity_token0 * token0USDRate;
  amount_token1_usd = total_liquidity_token1 * token1USDRate;
  total_position_value_usd = amount_token0_usd + amount_token1_usd;
  logger.info("Analyze Data:", positionId);
  position_init_data = await loadPositionInit(positionId);
  logger.info(
    "Analyze Data:",
    "total position value usd:",
    total_position_value_usd,
    position_init_data
  );

  // check position IL

  // check pair characteristics

  // check liquidity in surroudings
}

module.exports = {
  analyzeDataPoint,
};
