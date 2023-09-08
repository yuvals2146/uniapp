const { loadPosition } = require("../db/loadPositionDataDB.js");
const { notify } = require("../utils/notifer.js");
const logger = require("../utils/logger.js");

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
  position
  //  blockNumber
) {
  // check position boundaries
  if (
    (positionData.tickCurr >= positionData.tickRight ||
      positionData.tickCurr <= positionData.tickLeft) &&
    updateAlertStatus(position, OUT_OF_BOUNDS_ALERT)
  ) {
    logger.info(
      "Position",
      position,
      " is out of limits",
      "Left:",
      positionData.tickLeft,
      "Right:",
      positionData.tickRight,
      "Current:",
      positionData.tickCurr
    );
    await notify(
      `Position ${position.id}, ${position.chain} is out of limits: Left: ${positionData.tickLeft}, Right: ${positionData.tickRight}, Curr: ${positionData.tickCurr}`,
      "🚨 Reposition 🚨"
    );
  }

  // check position lifetime
  const positionInitData = await loadPosition(position);
  const positionAge = Date.now() - positionInitData.createdAt;
  const posAgeDays = parseInt(positionAge / 8.64e7);
  if (posAgeDays > 10 && updateAlertStatus(position, OLD_POSITION_ALERT)) {
    logger.info(
      "Position:",
      position.id,
      "on chain:",
      position.chain,
      " > 10 days old",
      posAgeDays
    );
    await notify(
      `Position ${position.id} on chain ${position.chain} > 10 days old: ${posAgeDays}`,
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
    updateAlertStatus(position, PNL_ALERT)
  ) {
    logger.info(
      "Position",
      position.id,
      "on chaoin",
      position.chain,
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
    await notify(
      `Position ${position.id} on chain ${
        position.chain
      } in high USD profit: ${profitLossRatio.toFixed(2)}%`,
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
    updateAlertStatus(position, IMP_LOSS_ALERT)
  ) {
    logger.info(
      "Position:",
      position.id,
      "on chain:",
      position.chain,
      " is at impermanent loss:",
      totalPositionValueUSD,
      totalHoldValueUSD,
      ilRate.toFixed(2)
    );
    await notify(
      `Position ${position.id} on chain ${
        position.chain
      } is currently at impermanent loss: ${ilRate.toFixed(2)}%`,
      "🚨 Exit position! 🚨"
    );
  }

  // check pair characteristics

  // check liquidity in surroudings
}

const updateAlertStatus = (postion, alertType) => {
  const now = new Date();
  const last_alert_time =
    alertsTypeAndTime[postion]?.[alertType] || new Date(0);

  if (now - last_alert_time < process.env.REPEAT_ALERT_INTERVAL) {
    return false;
  } else {
    alertsTypeAndTime[postion] = {
      ...alertsTypeAndTime[postion],
      [alertType]: now,
    };
  }
  return true;
};

module.exports = {
  analyzeDataPoint,
};
