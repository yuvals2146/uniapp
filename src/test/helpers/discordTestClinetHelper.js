const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

let clientReady = false;
const getClientReady = () => clientReady;

client.on("ready", () => {
  clientReady = true;
});

const sendMsg = async (msg) => {
  const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);

  const returnedMsg = await channel.send(msg);
  return returnedMsg?.id;
};

const getReplayToMessage = async (msgId) => {
  const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  const messages = await channel.messages.fetch({ limit: 10 });
  let replayedMsg;
  messages.forEach(async (msg) => {
    if (msg?.reference?.messageId === msgId) {
      replayedMsg = msg.content;
      return;
    }
  });

  return replayedMsg;
};

const getAlertMessage = async () => {
  const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
  const messages = await channel.messages.fetch({ limit: 1 });

  return messages.first().content;
};

client.login(process.env.DISCORD_TEST_CLIENT_TOKEN); //login bot using token

module.exports = {
  getClientReady,
  sendMsg,
  getReplayToMessage,
  getAlertMessage,
};
