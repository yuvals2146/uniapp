const { loadAllPositions } = require("./db/loadPositionDataDB.js");
const logger = require("./utils/logger.js");
const { userSaveNewPosition } = require("./db/savePositionDataDB.js");

const init = async () => {
  // await addNewPositionTemp();

  const positions = await loadAllPositions();
  activePositions = positions
    .filter((position) => position.ActivePosition === true)
    .map((position) => {
      return {
        id: position.id,
        chain: position.chainId,
      };
    });
  inActivePositions = positions
    .filter((position) => position.ActivePosition === false)
    .map((position) => {
      return {
        id: position.id,
        chain: position.chainId,
      };
    });

  if (positions.length === 0 || activePositions.length === 0) {
    logger.error("No positions found in DB");
  }

  logger.info(
    `Found ${activePositions.length} active positions`,
    activePositions
  );
  if (inActivePositions.length != 0) {
    logger.info(
      `Found ${inActivePositions.length} inactive positions`,
      inActivePositions
    );
  }
  logger.info("init", "done");

  // return positions;
};

const addNewPositionTemp = async () => {
  array = [
    [
      { id: 795484, chain: 42161 },
      "0x3f040e3300be131dbe7ce228f21f26ddc28271c53b4a2ae590142669fce45b0e",
    ],
    [{ id: 482139, chain: 1 }],
  ];

  array.forEach(async (pos) => {
    try {
      await userSaveNewPosition(pos[0], pos[1]);
    } catch (e) {
      logger.error(e.message);
    }
  });
};

module.exports = { init, addNewPositionTemp };
