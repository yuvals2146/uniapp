const { Client, GatewayIntentBits } = require("discord.js");
const {
  updatePositionActiveAlertTriggeredTime,
} = require("../db/savePositionDataDB");
const { loadAllPositions } = require("../db/loadPositionDataDB");
const logger = require("../utils/logger");
const { alertsTypes, alertsTypeNames } = require("../utils/alertsTypes");
const {
  getAllPositions,
  getActiveAlerts,
  addPosition,
  removePosition,
  muteOrUnmuteAlert,
  setPositionActive,
} = require("./discordBotHelpers");

const { checkIfActiveAlert } = require("../alerts/alerts.js");

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
      await msg.reply(
        "I can help you with the following commands: \n- `GetAllPositions` \n- `GetActiveAlerts` \n- `AddPosition` \n- `ReactivatePosition` \n- `RemovePosition` \n- `DeactivatePosition` \n- `MuteAlerts` \n- `UnmuteAlerts`"
      );
      break;
    case "GetAllPositions":
      response = await getAllPositions(args);
      await msg.reply(response);
      break;

    case "GetActiveAlerts":
      response = await getActiveAlerts(args);
      await msg.reply(response);
      break;

    case "AddPosition":
      response = await addPosition(args);
      await msg.reply(response);
      break;

    case "ReactivatePosition":
      response = await setPositionActive(args, true);
      await msg.reply(response);
      break;

    case "RemovePosition":
      response = await removePosition(args);
      await msg.reply(response);
      break;

    case "DeactivatePosition":
      response = await setPositionActive(args, false);
      await msg.reply(response);
      break;

    case "MuteAlerts":
      response = await muteOrUnmuteAlert(args, true);
      await msg.reply(response);
      break;

    case "UnmuteAlerts":
      response = await muteOrUnmuteAlert(args, false);
      await msg.reply(response);
      break;

    default:
      await msg.reply(
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
    logger.error(e);
  }
};

const enumValuesAlertsTypes = Object.values(alertsTypes);

const checkIfActiveAlertAndNotfyIfNeeded = async (position) => {
  const activeAlerts = await checkIfActiveAlert(position);

  if (position.IsAlertMuted) {
    return;
  }
  for (var index in activeAlerts) {
    var activeAlert = activeAlerts[index];
    if (activeAlert) {
      await notify(position, alertsTypeNames[index]);
      await updatePositionActiveAlertTriggeredTime(
        position,
        enumValuesAlertsTypes[index]
      );
    }
  }
};

(async function checkForAlerts() {
  setTimeout(async () => {
    const positions = await loadAllPositions();
    for (const position of positions) {
      if (position.ActivePosition) {
        await checkIfActiveAlertAndNotfyIfNeeded(position);
      }
    }
    await checkForAlerts();
  }, process.env.ALERTS_CHECK_INTERVAL);
})();

//make sure this line is the last line
client.login(process.env.DISCORD_CLIENT_TOKEN); //login bot using token
