const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger.js");

const prisma = new PrismaClient();

async function loadPosition(positionKey) {
  try {
    let pos = await prisma.Position.findUnique({
      where: {
        positionKey: {
          id: positionKey.id,
          chainId: positionKey.chainId,
        },
      },
    });

    if (!pos) {
      throw new Error();
    }
    return pos;
  } catch (e) {
    throw new Error(
      `position not found ${positionKey.id}, ${positionKey.chainId}`
    );
  }
}

const loadAllPositions = async () => {
  return await prisma.Position.findMany();
};

module.exports = {
  loadPosition,
  loadAllPositions,
};
