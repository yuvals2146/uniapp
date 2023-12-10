const { chains, chainsNames } = require("../utils/chains");
const { loadAllPositions, loadPosition } = require("../db/loadPositionDataDB");
const {
  userSaveNewPosition,
  deletePosition,
  muteOrUnmutePositionAlert,
  updatePositionActive,
} = require("../db/savePositionDataDB");
const { checkIfActiveAlert } = require("../alerts/alerts");
const formatChainName = (chain) => {
  chainLowCase = chain.toLowerCase();
  if (chainLowCase === "1") return "ethereum";
  if (chainLowCase === "42161") return "arbitrum";
  if (chainLowCase === "eth" || chainLowCase === "ETH") return "ethereum";
  if (chainLowCase === "arb" || chainLowCase === "ARB") return "arbitrum";
  return chainLowCase;
};

const getAllPositions = async (args) => {
  selectedChain = args[0];
  let res = "Positions: \n";

  if (
    selectedChain &&
    selectedChain !== "ethereum" &&
    selectedChain !== "arbitrum"
  )
    return "Chain id not supported, must be ethereum or arbitrum";

  const resPositions = await loadAllPositions();
  if (resPositions.length === 0) return "No positions found";
  await resPositions.forEach((pos) => {
    if (args[0] === "ethereum" && pos.chainId !== 1) return;
    if (args[0] === "arbitrum" && pos.chainId !== 42161) return;

    res += `- id: \`${pos.id}\`, chain: \`${
      chains[pos.chainId].name
    }\`, Active: \`${pos.ActivePosition}\` \n`;
  });

  return res;
};

const getActiveAlerts = async (args) => {
  if (args.length < 2) return "Please supply position id and chain id";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);
  let position;
  try {
    position = await loadPosition({
      id: parseInt(positionId),
      chainId: chainsNames[positionChainName],
    });
  } catch (e) {
    return `Failed to load position ${positionId} on ${positionChainName}, ${e.message}`;
  }

  if (!position.ActivePosition)
    return `Position ${positionId} on ${positionChainName} is inactive (liquidity removed)`;

  const activeAlerts = `Active alerts for position ${positionId} on ${positionChainName}:\n- OutOfBounds: ${
    position.OutOfBounds ? "🚨" : "✅"
  }\n- OldPosition: ${position.OldPosition ? "🚨" : "✅"}\n- PNL: ${
    position.PNL ? "🚨" : "✅"
  }\n- IMPLoss: ${position.IMPLoss ? "🚨" : "✅"}`;
  return activeAlerts;
};

const addPosition = async (args) => {
  if (args.length < 2)
    return "Please supply position id and chain id, for arbitrum positions please supply initial transaction id as well.";

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
      {
        id: parseInt(positionId),
        chainId: positionChainName === "ethereum" ? 1 : 42161,
      },
      txHash
    );
  } catch (e) {
    return e.message;
  }
  return `Position ${positionId} on chain ${positionChainName} was added successfully`;
};

const setPositionActive = async (args, active) => {
  if (args.length != 2) return "Please supply position id and chain id";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);
  try {
    await updatePositionActive(
      {
        id: parseInt(positionId),
        chainId: positionChainName === "ethereum" ? 1 : 42161,
      },
      active
    );
    return `Position ${positionId} on ${positionChainName} set to active=${active}.`;
  } catch (e) {
    return `Failed to set active attribute for position ${positionId} on ${positionChainName}, error=${e.message}`;
  }
};

const removePosition = async (args) => {
  if (args.length < 2)
    return "Please supply position id and chain id (or name).";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);
  try {
    await deletePosition({
      id: parseInt(positionId),
      chainId: positionChainName === "ethereum" ? 1 : 42161,
    });
    return `Position ${positionId} on ${positionChainName} removed successfully`;
  } catch (e) {
    return `Failed to remove position ${positionId} on ${positionChainName}, check logs for more details. error=${e.message}`;
  }
};

const muteOrUnmuteAlert = async (args, mute) => {
  if (args.length < 2)
    return "Please supply position id and chain id (or name).";

  const [chain, positionId] = args;
  const positionChainName = formatChainName(chain);

  try {
    await muteOrUnmutePositionAlert(
      { id: parseInt(positionId), chainId: chainsNames[positionChainName] },
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
  getAllPositions,
  getActiveAlerts,
  addPosition,
  removePosition,
  checkIfActiveAlert,
  muteOrUnmuteAlert,
  setPositionActive,
};
