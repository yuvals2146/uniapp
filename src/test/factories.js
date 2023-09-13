require("dotenv").config({ path: `${__dirname}/../../.env.test` }); //initialize dotenv
const { PrismaClient } = require("@prisma/client");
const { alertsTypes } = require("../../src/utils/alertsTypes.js");
const prisma = new PrismaClient();

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
      id: parseInt(position.id),
    },
  });

  if (!pos) return;

  try {
    await prisma.Position.delete({
      where: {
        id: parseInt(position.id),
      },
    });
  } catch (e) {
    console.log(e);
  }
};

const loadAllPositionInfoFromDB = async () => {
  return await prisma.positionInfo.findMany();
};

const setAlertActiveForTest = async (position, alertType) => {
  let yesterday = new Date().setDate(new Date().getDate() - 1);

  await prisma.Position.update({
    where: {
      id: parseInt(position.id),
    },
    data: {
      OutOfBounds: alertType === alertsTypes.OUT_OF_BOUNDS ? true : false,
      OutOfBoundsLastTriggered: new Date(yesterday),
      OldPosition: alertType === alertsTypes.OLD_POSITION ? true : false,
      OldPositionLastTriggered: new Date(yesterday),
      PNL: alertType === alertsTypes.PNL ? true : false,
      PNLLastTriggered: new Date(yesterday),
      IMPLoss: alertType === alertsTypes.IMP_LOSS ? true : false,
      IMPLossLastTriggered: new Date(yesterday),
    },
  });
};

module.exports = {
  addPositionIntoDB,
  removePositionFromDB,
  loadAllPositionInfoFromDB,
  setAlertActiveForTest,
};
