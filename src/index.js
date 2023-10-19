const logger = require("./utils/logger.js");
const { getNewDataAndAnalyze } = require("./analyzeRoutine.js");
const { init } = require("./init.js");
const { loadAllPositions } = require("./db/loadPositionDataDB.js");

const beforeStart = async () => {
  await init();
};

let positions;

const getPositions = async () => {
  return (await loadAllPositions()).filter(
    (position) => position.ActivePosition === true
  );
};

beforeStart();

(async function eventLoop() {
  positions = await getPositions();
  setTimeout(() => {
    positions.forEach(async (position) => {
      try {
        await getNewDataAndAnalyze(position);
      } catch (err) {
        logger.error(err);
      }
    });

    eventLoop();
  }, process.env.INTERVAL);
})();

//serverless.js
