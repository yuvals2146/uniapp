const { Client, GatewayIntentBits } = require("discord.js");
const {
  updatePositionActiveAlertTriggeredTime,
} = require("../db/savePositionDataDB");
const { loadAllPositions } = require("../db/loadPositionDataDB");
const logger = require("../utils/logger");
const { alertsTypeNames } = require("../utils/alertsTypes");
const {
  getAllActivePositions,
  addPosition,
  removePosition,
  checkIfActiveAlert,
  muteOrUnmuteAlert,
} = require("./discordBotHelpers");

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
        "I can help you with the following commands: \n- `GetAllActivePositions` \n- `AddPosition` \n- `RemovePosition` \n- `MuteAlerts` \n- `UnmuteAlerts`"
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

    case "MuteAlerts":
      response = await muteOrUnmuteAlert(args, true);
      msg.reply(response);
      break;

    case "UnmuteAlerts":
      response = await muteOrUnmuteAlert(args, false);
      msg.reply(response);
      break;

    default:
      msg.reply(
        "I don't understand this command, try to use `help` to find posible commands"
      );
      break;
  }
});

const notify = async (position, alert) => {
  try {
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    channel.send(`@everyone
      🚨  POSITION \`${position.id}\` **${alert}** 🚨`);
  } catch (e) {
    console.log(e);
  }
};

const checkIfActiveAlertAndNotfyIfNeeded = async (position) => {
  const activeAlerts = await checkIfActiveAlert(position);

  if (position.IsAlertMuted) {
    return;
  }
  Object.keys(activeAlerts).forEach(async (alertType) => {
    if (activeAlerts[alertType]) {
      await notify(position, alertsTypeNames[alertType]);
      await updatePositionActiveAlertTriggeredTime(
        position.id,
        parseInt(alertType)
      );
    }
  });
};

(async function checkForAlerts() {
  setTimeout(async () => {
    await loadAllPositions().then((positions) => {
      positions.forEach(async (position) => {
        await checkIfActiveAlertAndNotfyIfNeeded(position);
      });
    }),
      checkForAlerts();
  }, process.env.ALERTS_CHECK_INTERVAL);
})();

//make sure this line is the last line

client.login(process.env.DISCORD_CLIENT_TOKEN); //login bot using token
