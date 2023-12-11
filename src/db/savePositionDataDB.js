const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger.js");
const {
  retrieveInitalPositionData,
} = require("../blockchain/getPositionData.js");
const { chains } = require("../utils/chains.js");
const { alertsTypes } = require("../utils/alertsTypes.js");
const { loadPosition } = require("./loadPositionDataDB.js");
const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: ["query", "info", "warn"],
// });

const saveInitialPositionInfo = async (position, initData) => {
  await prisma.Position.create({
    data: {
      id: position.id,
      chainId: position.chainId,
      createdAt: new Date(initData.blockTimestemp),
      initValueToken0: parseFloat(initData.initValueToken0),
      token0Symbol: initData.token0symbol,
      initValueToken1: parseFloat(initData.initValueToken1),
      token1Symbol: initData.token1symbol,
      initToken0USDRate: parseFloat(initData.initToken0USDRate),
      initToken1USDRate: parseFloat(initData.initToken1USDRate),
      initPriceT0T1: parseFloat(
        initData.initToken0USDRate / initData.initToken1USDRate
      ),
    },
  });
};

async function savePositionData(
  positionData,
  etherUsdExchangeRate,
  ArbitUsdExchangeRate,
  position,
  blockNumber
) {
  await prisma.PositionInfo.create({
    data: {
      posId: position.id,
      posChain: position.chainId,
      pair: positionData.pair,
      liquidityToken0: parseFloat(positionData.liquidityToken0),
      liquidityToken1: parseFloat(positionData.liquidityToken1),
      feesToken0: parseFloat(positionData.feesToken0),
      feesToken1: parseFloat(positionData.feesToken1),
      token0Token1Rate: parseFloat(positionData.priceToken0),
      token0USDCExchangeRate: etherUsdExchangeRate,
      token1USDCExchangeRate: ArbitUsdExchangeRate,
      blockNumber: blockNumber,
    },
  });
}

const userSaveNewPosition = async (position, txHash) => {
  let pos = await prisma.Position.findUnique({
    where: {
      positionKey: {
        id: position.id,
        chainId: position.chainId,
      },
    },
  });

  if (pos) {
    logger.error("could not save postition, position already exist");
    throw new Error(
      `could not save postition ${position.id} on ${
        chains[position.chainId].name
      }, position already exist`
    );
  }
  try {
    const initData = await retrieveInitalPositionData(position, txHash);
    if (!initData) throw new Error("could not retrieve initial data");
    saveInitialPositionInfo(position, initData);
  } catch (err) {
    throw new Error(err.message);
  }
};

const deletePosition = async (position) => {
  try {
    await prisma.Position.delete({
      where: {
        positionKey: {
          id: position.id,
          chainId: position.chainId,
        },
      },
    });
  } catch (err) {
    throw new Error("could not delete position, reason: ", err.message);
  }
};

const updatePositionActive = async (position, active) => {
  if (active != position.isActive) {
    try {
      await prisma.Position.update({
        where: {
          positionKey: {
            id: position.id,
            chainId: position.chainId,
          },
        },
        data: {
          ActivePosition: active,
          TimeLastActive: active ? null : new Date(),
        },
      });
    } catch (err) {
      logger.error(err);
      throw new Error(
        "Could not change ActivePosition, to: ",
        active,
        ". Reason: ",
        err.message
      );
    }
  }
};

const muteOrUnmutePositionAlert = async (position, mute) => {
  const currentAlerts = await loadPosition(position);

  if (!currentAlerts) {
    throw new Error(`could not find Position ${position.id}`);
  }

  if (mute != currentAlerts.IsAlertMuted) {
    try {
      await prisma.Position.update({
        where: {
          positionKey: {
            id: position.id,
            chainId: position.chainId,
          },
        },
        data: {
          IsAlertMuted: mute,
        },
      });
    } catch (err) {
      logger.error(err);
      throw new Error("could not mute position, reason: ", err.message);
    }
  }
};

// changes alert status only if actually changed and returns true if changed
const updatePositionActiveAlert = async (position, alertType, isActive) => {
  const changed =
    alertType === alertsTypes.OUT_OF_BOUNDS
      ? isActive != position.OutOfBounds
      : alertType === alertsTypes.OLD_POSITION
      ? isActive != position.OldPosition
      : alertType === alertsTypes.PNL
      ? isActive != position.PNL
      : alertType === alertsTypes.IMP_LOSS
      ? isActive != position.IMPLoss
      : false;

  if (changed) {
    await prisma.Position.update({
      where: {
        positionKey: {
          id: position.id,
          chainId: position.chainId,
        },
      },
      data: {
        OutOfBounds:
          alertType === alertsTypes.OUT_OF_BOUNDS
            ? isActive
            : position.outOfBounds,
        OutOfBoundsLastTriggered:
          alertType === alertsTypes.OUT_OF_BOUNDS && isActive === true
            ? new Date()
            : position.OutOfBoundsLastTriggered,
        OldPosition:
          alertType === alertsTypes.OLD_POSITION
            ? isActive
            : position.oldPosition,
        OldPositionLastTriggered:
          alertType === alertsTypes.OLD_POSITION && isActive === true
            ? new Date()
            : position.oldPositionLastTriggered,
        PNL: alertType === alertsTypes.PNL ? isActive : position.PNL,
        PNLLastTriggered:
          alertType === alertsTypes.PNL && isActive === true
            ? new Date()
            : position.PNLLastTriggered,
        IMPLoss:
          alertType === alertsTypes.IMP_LOSS ? isActive : position.IMPLoss,
        IMPLossLastTriggered:
          alertType === alertsTypes.IMP_LOSS && isActive === true
            ? new Date()
            : position.IMPLossLastTriggered,
      },
    });
  }

  return changed;
};

async function updatePositionActiveAlertTriggeredTime(position, alertType) {
  lastTriggered = new Date();

  try {
    await prisma.Position.update({
      where: {
        positionKey: {
          id: position.id,
          chainId: position.chainId,
        },
      },
      data: {
        OutOfBoundsLastTriggered:
          alertType === alertsTypes.OUT_OF_BOUNDS
            ? lastTriggered
            : position.OutOfBoundsLastTriggered,

        OldPositionLastTriggered:
          alertType === alertsTypes.OLD_POSITION
            ? lastTriggered
            : position.OldPositionLastTriggered,

        PNLLastTriggered:
          alertType === alertsTypes.PNL
            ? lastTriggered
            : position.PNLLastTriggered,

        IMPLossLastTriggered:
          alertType === alertsTypes.IMP_LOSS
            ? lastTriggered
            : position.IMPLossLastTriggered,
      },
    });
  } catch (err) {
    logger.error(err);
    throw new Error(
      "could not update last triggered alert time, reason: ",
      err.message
    );
  }
}

module.exports = {
  savePositionData,
  userSaveNewPosition,
  deletePosition,
  muteOrUnmutePositionAlert,
  updatePositionActiveAlert,
  updatePositionActiveAlertTriggeredTime,
  updatePositionActive,
};
