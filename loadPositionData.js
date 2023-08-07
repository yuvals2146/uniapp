const { PrismaClient } = require("@prisma/client");

async function loadPositionInit(positionId) {
  const prisma = new PrismaClient();
  let position = await prisma.Position.findUnique({
    where: {
      id: positionId,
    },
  });
  return position;
}

module.exports = {
  loadPositionInit,
};
