const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger.js");

const prisma = new PrismaClient();

async function loadPosition(position) {
  try {
    let pos = await prisma.Position.findUnique({
      where: {
        id: position.id,
      },
    });
    if (!pos) {
      throw new Error();
    }
    return pos;
  } catch (e) {
    throw new Error("position not found");
  }
}

const loadAllPositions = async () => {
  return await prisma.Position.findMany();
};
module.exports = {
  loadPosition,
  loadAllPositions,
};
