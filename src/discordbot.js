const { Client, GatewayIntentBits } = require("discord.js");
const {
  userSaveNewPosition,
  deletePosition,
} = require("./db/savePositionDataDB");
const { loadAllPositions } = require("./db/loadPositionDataDB");
const { chains } = require("./utils/chains");
const logger = require("./utils/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

client.on("ready", () => {
  logger.info("DiscordClient", `Logged in as ${client?.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
  // You can view the msg object here with console.log(msg)

  if (
    msg.content === "" ||
    (msg.author.bot && msg.author.id !== process.env.DISCORD_TEST_CLIENT_ID)
  )
    return;

  const message = String(
    msg.content.split(`<@${process.env.DISCORD_CLIENT_ID}>`)[1]
  ).trimStart();
  const command = message.split(" ")[0];
  const args = message.split(" ").slice(1);
  let response;
  // if (await !isUserExist(msg.author)) {
  //   msg.reply("User does not exist, plase join first");
  //   return;
  // }
  switch (command) {
    case "help":
      msg.reply(
        "I can help you with the following commands: \n- `GetAllActivePositions` \n- `AddPosition` \n- `RemovePosition`"
      );
      break;
    case "GetAllActivePositions":
      response = await getAllActivePositions(args);
      msg.reply(response);
      break;

    case "AddPosition":
      response = await addPosition(args);
      msg.reply(response);
      break;

    case "RemovePosition":
      response = await removePosition(args);
      msg.reply(response);
      break;

    default:
      msg.reply(
        "I don't understand this command, try to use `help` to find posible commands"
      );
      break;
  }
});

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

const addPosition = async (args) => {
  if (args.length < 2)
    return "Need to supply at least position id and chain id";

  const [positionChainName, positionId, txHash] = args;

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

  const [positionChainName, positionId] = args;

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

// const isUserExist = (author) => {
//   return true;
//   // if (users[author.id]) return true;
//   // console.log("will return false for some reason");
//   // return false;
// };

// const addNewUser = async (msg) => {
// //  const channel;
// }

// const notifyUser = async (msg) => {
//   const channel = await client.channels.fetch("1148883506643083276");
//   channel.send(msg);
// };

//make sure this line is the last line
client.login(process.env.DISCORD_CLIENT_TOKEN); //login bot using token
