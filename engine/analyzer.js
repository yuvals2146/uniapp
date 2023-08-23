const { getPostionData, getTickAtSqrtRatio } = require("../getPostionData.js");
const { loadPositionInit } = require("../loadPositionData.js");
const { notify } = require("../notifer.js");
const logger = require("../logger.js");

// constants
const MILLISECONDS_PER_DAY = 8.64e7;

const OUT_OF_BOUNDS_ALERT = 0;
const OLD_POSITION_ALERT = 1;
const PNL_ALERT = 2;
const IMP_LOSS_ALERT = 3;

let alertsTypeAndTime = {};

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
    updateAlertStatus(positionId, OUT_OF_BOUNDS_ALERT)
  ) {
    logger.info("Position Out of Limits", positionData.tickCurr);
    await notify(
      `Position Out of Limits: ${positionData.tickCurr}`,
      "🚨 Reposition 🚨"
    );
  }

  // check position lifetime
  const positionInitData = await loadPositionInit(positionId);
  const positionAge = Date.now() - positionInitData.createdAt;
  const posAgeDays = parseInt(positionAge / 8.64e7);
  if (posAgeDays > 10 && updateAlertStatus(positionId, OLD_POSITION_ALERT)) {
    logger.info("Position > 10 days old", posAgeDays);
    await notify(
      `Position Over 10 days Old: ${posAgeDays}`,
      "⏰ Reposition? ⏰"
    );
  }

  // check position P&L (if enough profitable notify - suggest exit)
  const totalLiquidityToken0 =
    parseFloat(positionData.liquidityToken0) +
    parseFloat(positionData.feesToken0);
  const totalLiquidityToken1 =
    parseFloat(positionData.liquidityToken1) +
    parseFloat(positionData.feesToken1);
  const amountToken0USD = totalLiquidityToken0 * token0USDRate;
  const amountToken1USD = totalLiquidityToken1 * token1USDRate;
  const initAmountToken0USD =
    positionInitData.initValueToken0 * positionInitData.initToken0USDRate;
  const initAmountToken1USD =
    positionInitData.initValueToken1 * positionInitData.initToken1USDRate;
  const totalPositionValueUSD = amountToken0USD + amountToken1USD;
  const initPositionValueUSD = initAmountToken0USD + initAmountToken1USD;
  const profitLossRatio =
    ((totalPositionValueUSD - initPositionValueUSD) / totalPositionValueUSD) *
    100;
  if (
    profitLossRatio.toFixed(2) >= 20 &&
    updateAlertStatus(positionId, PNL_ALERT)
  ) {
    logger.info("Position in high USD profit:", profitLossRatio.toFixed(2));
    await notify(
      `Position in high USD profit: ${profitLossRatio.toFixed(2)}%`,
      "💵 Cash out 💵"
    );
  }

  // check position IL
  const totalHoldValueUSD =
    positionInitData.initValueToken0 * token0USDRate +
    positionInitData.initValueToken1 * token1USDRate;
  const ilRate =
    ((totalPositionValueUSD - totalHoldValueUSD) / totalPositionValueUSD) * 100;
  if (
    totalPositionValueUSD < totalHoldValueUSD &&
    updateAlertStatus(positionId, IMP_LOSS_ALERT)
  ) {
    logger.info(
      "Total position value less than holding initial assets value:",
      totalPositionValueUSD,
      totalHoldValueUSD,
      ilRate.toFixed(2)
    );
    await notify(
      `Position is currently in impermanent loss: ${ilRate.toFixed(2)}%`,
      "🚨 Exit position! 🚨"
    );
  }

  // check pair characteristics

  // check liquidity in surroudings
}

const updateAlertStatus = (postionId, alertType) => {
  const now = new Date();
  const last_alert_time =
    alertsTypeAndTime[postionId]?.[alertType] || new Date(0);

  if (now - last_alert_time < process.env.REPEAT_ALERT_INTERVAL) {
    return false;
  } else {
    alertsTypeAndTime[postionId] = {
      ...alertsTypeAndTime[postionId],
      [alertType]: now,
    };
  }
  return true;
};

module.exports = {
  analyzeDataPoint,
};
