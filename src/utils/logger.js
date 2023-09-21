const chalk = require("chalk");

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

const info = async (title = "", ...data) => {
  if (process.env.ENV === "test" || process.env.ENV === "ci-test") return;
  const date = new Date().toISOString();
  console.log(date, ":", chalk.blue(`[INFO]`), chalk.bold(title), ":", data);
};

const note = async (title = "", data) => {
  if (process.env.ENV === "test" || process.env.ENV === "ci-test") return;
  const date = new Date().toISOString();
  console.log(date, ":", chalk.white(`[NOTE]`), chalk.bold(title), ":", data);
};

const warning = async (data) => {
  if (process.env.ENV === "test" || process.env.ENV === "ci-test") return;
  const date = new Date().toISOString();
  console.log(date, ":", chalk.yellow(`[WARNING]`), data);
};

const error = async (data) => {
  if (process.env.ENV === "test" || process.env.ENV === "ci-test") return;
  const date = new Date().toISOString();
  console.log(date, ":", chalk.red(`[ERROR]`), data);
};

module.exports = {
  debug,
  info,
  note,
  warning,
  error,
};
