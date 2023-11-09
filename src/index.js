const logger = require("./utils/logger.js");
const { getNewDataAndAnalyze } = require("./analyzeRoutine.js");
const { init } = require("./init.js");
const { loadAllPositions } = require("./db/loadPositionDataDB.js");

const beforeStart = async () => {
  await init();
};

let positions;

const getPositions = async () => {
  const positions = await loadAllPositions();
  const filtered_positions = positions.filter(
    (position) =>
      position.ActivePosition === true ||
      (position.ActivePosition === false &&
        (Date.now() - position.TimeLastActive.getTime()) / (1000 * 3600 * 24) >
          process.env.POSITION_INACTIVITY_TIME_DAYS)
  );
  return filtered_positions;
};

beforeStart();

(async function eventLoop() {
  positions = await getPositions();
  setTimeout(async () => {
    for (var index in positions) {
      const position = positions[index];
      try {
        await getNewDataAndAnalyze(position);
      } catch (err) {
        logger.error(err);
      }
    }
    eventLoop();
  }, process.env.INTERVAL);
})();

//serverless.js
