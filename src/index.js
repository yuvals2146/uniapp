const logger = require("./utils/logger.js");
const { getNewDataAndAnalyzed } = require("./analyzeRoutine.js");
const { init } = require("./init.js");
const { loadAllPositions } = require("./db/loadPositionDataDB.js");

let positions;

const beforeStart = async () => {
  positions = await init();
};

const getPostions = async () => {
  return (await loadAllPositions()).map((position) => {
    return {
      id: position.id,
      chain: position.chainId,
    };
  });
};

beforeStart();

(async function eventLoop() {
  positions = await getPostions();
  setTimeout(() => {
    positions.forEach(async (position) => {
      try {
        await getNewDataAndAnalyzed(position);
      } catch (err) {
        logger.error(err);
      }
    });

    eventLoop();
  }, process.env.INTERVAL);
})();

//serverless.js
