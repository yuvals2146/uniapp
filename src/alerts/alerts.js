const { alertsTypes } = require("../utils/alertsTypes.js");

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
  return {
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
};

module.exports = {
  checkIfActiveAlert,
};
