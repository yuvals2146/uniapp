const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function loadPositionInit(positionKey) {
  let position = await prisma.Position.findUnique({
    where: {
      id: positionKey.id,
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
