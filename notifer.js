const { Client } = require("whatsapp-web.js");
const push = require("pushover-notifications");
const qrcode = require("qrcode-terminal");
const {
  poolAboveTreshold,
  poolBelowTrashhold,
  USDCIsBelowTreshold,
} = require("./alertsTemplates.js");
require("dotenv").config();
const logger = require("./logger.js");

const client = new Client();
let pushover;
let notifierIsReady = false;

const initNotifer = async () => {
  if (
    process.env.PUSHOVER_USER === undefined ||
    process.env.PUSHOVER_TOKEN === undefined
  ) {
    logger.error("Pushover user or token not defined");
    process.exit(1);
  }

  try {
    pushover = new push({
      user: process.env.PUSHOVER_USER,
      token: process.env.PUSHOVER_TOKEN,
    });

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.initialize();
  } catch (err) {
    console.log(err);
  }
};

    client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      console.log("Client is ready!");
      notifierIsReady = true;
    });

    client.initialize();
  } catch (err) {
    console.log(err);
  }
};

const isNotifierReady = () => {
  return notifierIsReady;
};

const pushoverNotify = async (text, title) => {
  var msg = {
    message: text, // required
    title: title,
    sound: "magic",
    device: "devicename",
    priority: 1,
  };

  pushover.send(msg, function (err, result) {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log(result);
  });
};

const whatsappNotify = async (text, title) => {
  msg = title + "\n" + text;
  client.sendMessage(process.env.WHATSAPP_ALERT_GROUP, msg);
};

const botAddNewPosition = async (position) => {
  whatsappNotify("*adding position*", "what is the position number?");
};

client.on("message", (message) => {
  console.log(message);
  if (message.body.includes("add new position")) {
    botAddNewPosition(message);
  }
});


const notifiy = async (text, title) => {
  pushoverNotify(text, title);
  whatsappNotify(text, title);
};

initNotifer();

module.exports = {
  notifiy,
  initNotifer,
  isNotifierReady,
  pushoverNotify,
};
