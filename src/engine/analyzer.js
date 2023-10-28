const { loadPosition } = require("../db/loadPositionDataDB.js");
const logger = require("../utils/logger.js");
const {
  updatePositionActiveAlert,
  updatePositionActiveAlertTriggeredTime,
} = require("../db/savePositionDataDB.js");
const { checkIfActiveAlert } = require("../alerts/alerts.js");
const { alertsTypes } = require("../utils/alertsTypes.js");
async function analyzeDataPoint(
  positionData,
  token0USDRate,
  token1USDRate,
  pos
  //  blockNumber
) {
  let position = await loadPosition({
    id: pos.id,
    chainId: pos.chainId,
  });

  // check position boundaries
  const outOfBoundsValue =
    positionData.tickCurr >= positionData.tickRight ||
    positionData.tickCurr <= positionData.tickLeft;

  if (
    outOfBoundsValue &&
    (await updateAlertStatus(position, alertsTypes.OUT_OF_BOUNDS))
  ) {
    logger.info(
      "Position:",
      position.id,
      "on chain:",
      position.chainId,
      " is out of limits",
      "Left:",
      positionData.tickLeft,
      "Right:",
      positionData.tickRight,
      "Current:",
      positionData.tickCurr
    );
  } else if (!outOfBoundsValue) {
    updateAlertStatus(position, alertsTypes.OUT_OF_BOUNDS, false);
  }

  // check position lifetime
  const positionAge = Date.now() - position.createdAt;
  const posAgeDays = parseInt(positionAge / 8.64e7);
  if (
    posAgeDays > 10 &&
    (await updateAlertStatus(position, alertsTypes.OLD_POSITION))
  ) {
    logger.info(
      "Position:",
      position.id,
      "on chain:",
      position.chainId,
      " > 10 days old",
      posAgeDays
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
    position.initValueToken0 * position.initToken0USDRate;
  const initAmountToken1USD =
    position.initValueToken1 * position.initToken1USDRate;
  const totalPositionValueUSD = amountToken0USD + amountToken1USD;
  const initPositionValueUSD = initAmountToken0USD + initAmountToken1USD;
  const profitLossRatio =
    ((totalPositionValueUSD - initPositionValueUSD) / totalPositionValueUSD) *
    100;

  if (
    profitLossRatio.toFixed(2) >= 20 &&
    (await updateAlertStatus(position, alertsTypes.PNL))
  ) {
    logger.info(
      "Position",
      position.id,
      "on chaoin",
      position.chainId,
      "is in high USD profit:",
      totalPositionValueUSD,
      initPositionValueUSD,
      profitLossRatio.toFixed(2),
      positionData,
      totalLiquidityToken0,
      totalLiquidityToken1,
      token0USDRate,
      token1USDRate,
      amountToken0USD,
      amountToken1USD
    );
  } else if (profitLossRatio.toFixed(2) < 20) {
    updateAlertStatus(position, alertsTypes.PNL, false);
  }

  // check position IL
  const totalHoldValueUSD =
    position.initValueToken0 * token0USDRate +
    position.initValueToken1 * token1USDRate;
  const ilRate =
    ((totalPositionValueUSD - totalHoldValueUSD) / totalPositionValueUSD) * 100;
  if (
    totalPositionValueUSD < totalHoldValueUSD &&
    (await updateAlertStatus(position, alertsTypes.IMP_LOSS))
  ) {
    logger.info(
      "Position:",
      position.id,
      "on chain:",
      position.chainId,
      " is at impermanent loss:",
      totalPositionValueUSD,
      totalHoldValueUSD,
      ilRate.toFixed(2),
      "%"
    );
  } else if (totalPositionValueUSD >= totalHoldValueUSD) {
    updateAlertStatus(position, alertsTypes.IMP_LOSS, false);
  }

  // check pair characteristics

  // check liquidity in surroudings
}

const updateAlertStatus = async (position, alertType, value = true) => {
  await updatePositionActiveAlert(position, alertType, value);

  if (value === false) return;

  // alert only if time interval since last alert is long enough
  const activeAlerts = await checkIfActiveAlert(position);
  const alert = await activeAlerts[alertType];

  if (alert) {
    await updatePositionActiveAlertTriggeredTime(position, alertType);
  }

  return alert;
};

module.exports = {
  analyzeDataPoint,
};
