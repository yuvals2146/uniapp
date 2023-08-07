const push = require("pushover-notifications");
require("dotenv").config();
const logger = require("./logger.js");

let pushover_yuval;
let pushover_dany;

const initNotifer = async () => {
  if (process.env.USE_NOTIFIER == 0) return;
  if (
    process.env.PUSHOVER_YUVAL === undefined ||
    process.env.PUSHOVER_DANY === undefined ||
    process.env.PUSHOVER_TOKEN === undefined
  ) {
    logger.error("Pushover user or token not defined");
    process.exit(1);
  }

  try {
    pushover_yuval = new push({
      user: process.env.PUSHOVER_YUVAL,
      token: process.env.PUSHOVER_TOKEN,
    });
    pushover_dany = new push({
      user: process.env.PUSHOVER_DANY,
      token: process.env.PUSHOVER_TOKEN,
    });
  } catch (err) {
    console.log(err);
  }
};

const pushoverNotify = async (text, title) => {
  var msg = {
    message: text, // required
    title: title,
    sound: "magic",
    device: "devicename",
    priority: 1,
  };

  pushover_yuval.send(msg, function (err, result) {
    if (err) {
      console.log(err);
      throw err;
    }
  });

  pushover_dany.send(msg, function (err, result) {
    if (err) {
      console.log(err);
      throw err;
    }
  });
};

const notifiy = async (text, title) => {
  if (process.env.USE_NOTIFIER == 0) return;
  pushoverNotify(text, title);
};

initNotifer();

module.exports = {
  notifiy,
  initNotifer,
};
