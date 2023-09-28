require("dotenv").config({ path: `${__dirname}/../../.env.test` }); //initialize dotenv
const { PrismaClient } = require("@prisma/client");
const { alertsTypes } = require("../../src/utils/alertsTypes.js");
const prisma = new PrismaClient();
const logger = require("../../src/utils/logger.js");

const addPositionIntoDB = async (position) => {
  await prisma.Position.create({
    data: {
      id: parseInt(position.id),
      chainId: parseInt(position.chain),
      createdAt: new Date(position.createdAt),
      initValueToken0: parseFloat(position.initValueToken0),
      token0Symbol: position.token0Symbol,
      initValueToken1: parseFloat(position.initValueToken1),
      token1Symbol: position.token1Symbol,
      initToken0USDRate: parseFloat(position.initToken0USDRate),
      initToken1USDRate: parseFloat(position.initToken1USDRate),
      initPriceT0T1: parseFloat(
        position.initToken0USDRate / position.initToken1USDRate
      ),
    },
  });
};

const removePositionFromDB = async (position) => {
  let pos = await prisma.Position.findUnique({
    where: {
      positionKey: {
        id: parseInt(position.id),
        chainId: parseInt(position.chain),
      },
    },
  });

  if (!pos) return;

  try {
    await prisma.Position.delete({
      where: {
        positionKey: {
          id: position.id,
          chainId: position.chain,
        },
      },
    });
  } catch (e) {
    logger.error(e);
  }
};

const loadAllPositionInfoFromDB = async () => {
  return await prisma.positionInfo.findMany();
};

const setAllAlertsForTest = async (
  position,
  outOfBoundsStatus,
  OldPositionStatus,
  pNLStatus,
  iMPLossStatus
) => {
  await prisma.Position.update({
    where: {
      positionKey: {
        id: position.id,
        chainId: position.chain,
      },
    },
    data: {
      OutOfBounds: outOfBoundsStatus,
      OutOfBoundsLastTriggered: null,
      OldPosition: OldPositionStatus,
      OldPositionLastTriggered: null,
      PNL: pNLStatus,
      PNLLastTriggered: null,
      IMPLoss: iMPLossStatus,
      IMPLossLastTriggered: null,
    },
  });
};
const setAlertActiveForTest = async (position, alertType, shouldNotify) => {
  let yesterday = new Date().setDate(new Date().getDate() - 1);
  let tommorow = new Date().setDate(new Date().getDate() + 1);
  const lastTriggered = shouldNotify ? yesterday : tommorow;
  await prisma.Position.update({
    where: {
      positionKey: {
        id: position.id,
        chainId: position.chain,
      },
    },
    data: {
      OutOfBounds: alertType === alertsTypes.OUT_OF_BOUNDS ? true : false,
      OutOfBoundsLastTriggered: new Date(lastTriggered),
      OldPosition: alertType === alertsTypes.OLD_POSITION ? true : false,
      OldPositionLastTriggered: new Date(lastTriggered),
      PNL: alertType === alertsTypes.PNL ? true : false,
      PNLLastTriggered: new Date(lastTriggered),
      IMPLoss: alertType === alertsTypes.IMP_LOSS ? true : false,
      IMPLossLastTriggered: new Date(lastTriggered),
    },
  });
};

module.exports = {
  addPositionIntoDB,
  removePositionFromDB,
  loadAllPositionInfoFromDB,
  setAlertActiveForTest,
  setAllAlertsForTest,
};
