const { getPostionData, getTickAtSqrtRatio } = require("../getPostionData.js");
const { loadPositionInit } = require("../loadPositionData.js");
const { notify } = require("../notifer.js");
const logger = require("../logger.js");

const NONE = 0;
const OUT_OF_BOUNDS = 1;
const IMP_LOSS = 2;

const lastAlertForPosition = [];
let alertTypeAndTime = {
  alertType: NONE,
  time: undefined,
};

async function analyzeDataPoint(
  positionData,
  token0USDRate,
  token1USDRate,
  positionId
  //  blockNumber
) {
  // check position boundaries
  if (
    (positionData.tickCurr >= positionData.tickRight ||
      positionData.tickCurr <= positionData.tickLeft) &&
    updateAlertStatus(positionId, OUT_OF_BOUNDS)
  ) {
    logger.info("Position Out of Limits", positionData.tickCurr);
    await notify(
      `Position Out of Limits: ${positionData.tickCurr}`,
      "🚨 Reposition 🚨"
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

const updateAlertStatus = (postionId, alertType) => {
  const typeAndTime = lastAlertForPosition[postionId];
  if (
    typeAndTime?.alertType == alertType &&
    Date.now() - typeAndTime.time < process.env.REPEAT_ALERT_INTERVAL
  ) {
    return false;
  } else {
    alertTypeAndTime = { alertType, time: Date.now() };
    lastAlertForPosition[postionId] = alertTypeAndTime;
  }
  return true;
};

module.exports = {
  analyzeDataPoint,
};
