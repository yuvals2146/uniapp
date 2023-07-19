require("dotenv").config();
const chalk = require("chalk");
let logzioLogger = require("logzio-nodejs");

const initLogger = async () => {
  // logzioLogger = logzioLogger.createLogger({
  //     token: process.env.LOGZIO_TOKEN,
  //     protocol: 'https',
  //     host: process.env.LOGZIO_HOST,
  //     port: '8071',
  //     type: 'changeToProperType'
  // });
};

const debug = async (title, data) => {
  const date = new Date().toISOString();
  console.log(
    date,
    ":",
    chalk.greenBright(`[DEBUG]`),
    chalk.bold(title),
    ":",
    data
  );
};

const info = async (title = "", data) => {
  const date = new Date().toISOString();
  console.log(date, ":", chalk.blue(`[INFO]`), chalk.bold(title), ":", data);
  //logzioLogger.log({logLevel: 'INFO', data});
};

const note = async (title = "", data) => {
  const date = new Date().toISOString();
  console.log(date, ":", chalk.white(`[NOTE]`), chalk.bold(title), ":", data);
  //logzioLogger.log({logLevel: 'INFO', data});
};

const warning = async (data) => {
  const date = new Date().toISOString();
  console.log(date, ":", chalk.yellow(`[WARNING]`), data);
  //logzioLogger.log({logLevel: 'WARNING', data});
};

const error = async (data) => {
  const date = new Date().toISOString();
  console.log(date, ":", chalk.red(`[ERROR]`), data);
  //logzioLogger.log({logLevel: 'ERROR', data});
};

module.exports = {
  debug,
  initLogger,
  info,
  note,
  warning,
  error,
};
