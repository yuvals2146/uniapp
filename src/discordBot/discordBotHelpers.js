const { alertsTypes } = require("../utils/alertsTypes");
const { chains } = require("../utils/chains");
const { loadAllPositions, loadPosition } = require("../db/loadPositionDataDB");
const {
  userSaveNewPosition,
  deletePosition,
  muteOrUnmutePositionAlert,
} = require("../db/savePositionDataDB");
const { format } = require("express/lib/response");

const formatChainName = (chain) => {
  if (chain === "1") return "ethereum";
  if (chain === "42161") return "arbitrum";
  if (chain === "eth" || chain === "ETH") return "ethereum";
  if (chain === "arb" || chain === "ARB") return "arbitrum";
  return chain.toLowerCase();
};

const getAllActivePositions = async (args) => {
  selectedChain = args[0];
  if (
    selectedChain &&
    selectedChain !== "ethereum" &&
    selectedChain !== "arbitrum"
  )
    return "Chain id not supported, must be ethereum or arbitrum";

  const resPositions = await loadAllPositions();
  if (resPositions.length === 0) return "No positions found";
  let res = "Positions: \n";
  await resPositions.forEach((pos) => {
    if (args[0] === "ethereum" && pos.chainId !== 1) return;
    if (args[0] === "arbitrum" && pos.chainId !== 42161) return;

    res += `- id: \`${pos.id}\` , chain: \`${chains[pos.chainId].name}\` \n`;
  });

  return res;
};

const getActiveAlerts = async (args) => {
  if (args.length < 2)
    return "Need to supply at least position id and chain id";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);
  let position;
  try {
    position = await loadPosition({
      id: positionId,
      chain: chainsNames[positionChainName],
    });
  } catch (e) {
    return `Failed to load position ${positionId} on ${positionChainName}, ${e.message}`;
  }

  const activeAlerts = `Active alerts for position ${positionId} on ${positionChainName}:\n- OutOfBounds: ${
    position.OutOfBounds ? "🚨" : "✅"
  }\n- OldPosition: ${position.OldPosition ? "🚨" : "✅"}\n- PNL: ${
    position.PNL ? "🚨" : "✅"
  }\n- IMPLoss: ${position.IMPLoss ? "🚨" : "✅"}`;
  return activeAlerts;
};

const addPosition = async (args) => {
  if (args.length < 2)
    return "Need to supply at least position id and chain id";

  const [chain, positionId, txHash] = args;
  const positionChainName = formatChainName(chain);

  if (positionChainName !== "ethereum" && positionChainName !== "arbitrum")
    return "Chain id not supported, must be ethereum or arbitrum";
  if (isNaN(positionId)) return "Position id must be a number";
  if (
    txHash !== undefined &&
    (txHash?.charAt(0) !== "0" ||
      txHash?.charAt(1) !== "x" ||
      txHash.length < 43)
  )
    return "TX hash is not valid";
  try {
    await userSaveNewPosition(
      { id: positionId, chain: positionChainName === "ethereum" ? 1 : 42161 },
      txHash
    );
  } catch (e) {
    return e.message;
  }
  return `Position ${positionId} on chain ${positionChainName} was added successfully`;
};

const removePosition = async (args) => {
  if (args.length < 2)
    return "Need to supply at least position id and chain id";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);
  try {
    await deletePosition({
      id: positionId,
      chain: positionChainName === "ethereum" ? 1 : 42161,
    });
    return `Position ${positionId} on ${positionChainName} removed successfully`;
  } catch (e) {
    return `Failed to remove position ${positionId} on ${positionChainName}, check logs for more details e=${e.message}`;
  }
};

const inTimeWindow = async (time) => {
  if (!time) return false;
  const now = new Date();
  const timeWindow = new Date(time);

  timeWindow.setMinutes(
    timeWindow.getMinutes() +
      parseInt(process.env.ALERTS_NOTIFY_INTERVAL_IN_MINUTES)
  );
  return now > timeWindow;
};

const checkIfActiveAlert = async (position) => {
  const activeAlerts = {
    [alertsTypes.OUT_OF_BOUNDS]:
      position.OutOfBounds &&
      (await inTimeWindow(position.OutOfBoundsLastTriggered)),
    [alertsTypes.OLD_POSITION]:
      position.OldPosition &&
      (await inTimeWindow(position.OldPositionLastTriggered)),
    [alertsTypes.PNL]:
      position.PNL && (await inTimeWindow(position.PNLLastTriggered)),
    [alertsTypes.IMP_LOSS]:
      position.IMPLoss && (await inTimeWindow(position.IMPLossLastTriggered)),
  };
  return activeAlerts;
};

const muteOrUnmuteAlert = async (args, mute) => {
  if (args.length < 2)
    return "Need to supply at least position id and chain id";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);

  try {
    await muteOrUnmutePositionAlert(
      { id: positionId, chain: chainsNames[positionChainName] },
      mute
    );

    return `Position ${positionId} on ${positionChainName} was ${
      mute ? "muted" : "unmuted"
    } successfully`;
  } catch (e) {
    return `Failed to ${
      mute ? "mute" : "unmute"
    } position ${positionId} on ${positionChainName}, ${e.message}`;
  }
};

module.exports = {
  getAllActivePositions,
  getActiveAlerts,
  addPosition,
  removePosition,
  checkIfActiveAlert,
  muteOrUnmuteAlert,
};
