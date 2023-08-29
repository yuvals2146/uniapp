const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function loadPositionInit(positionId) {
  let position = await prisma.Position.findUnique({
    where: {
      id: positionId,
    },
  });
  return position;
}

const loadAllPositions = async () => {
  return await prisma.Position.findMany();
};
module.exports = {
  loadPositionInit,
  loadAllPositions,
};
