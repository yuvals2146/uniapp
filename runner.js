const logger = require("./logger.js");
const { getNewDataAndAnalyzed } = require("./analyzeRoutine.js");
const { init } = require("./init.js");

let positions;

const beforeStart = async () => {
  positions = await init();
};

beforeStart();

(function eventLoop() {
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
