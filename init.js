const { loadAllPositions } = require("./loadPositionData.js");
const { notify } = require("./notifer.js");
const logger = require("./logger.js");
const { userSaveNewPosition } = require("./savePositionData.js");

const init = async () => {
  //await saveOrValidateInitPositionInfo(position);
  const positions = (await loadAllPositions()).map((position) => {
    if (position.hasHistoricalData) return;
    return {
      id: position.id,
      chain: position.chainId,
    };
  });

  if (positions.length === 0) {
    logger.error("No positions found in DB");
    process.exit(0);
  }

  logger.info(`run ${positions.length} positions`, positions);
  logger.info("init", "done");

  await notify(
    `unihedge Bot is up and running for ${positions.length} positions`,
    "🤖🦄 Startup 🤖🦄"
  );
  return positions;
};

// userSaveNewPosition(
//   { id: 795484, chain: 42161 },
//   "0x3f040e3300be131dbe7ce228f21f26ddc28271c53b4a2ae590142669fce45b0e"
// );

module.exports = { init };
