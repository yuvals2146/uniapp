const alertsTypes = {
  OUT_OF_BOUNDS: 0,
  OLD_POSITION: 1,
  PNL: 2,
  IMP_LOSS: 3,
};

const alertsTypeNames = {
  0: "out of bounds",
  1: "old position",
  2: "high profit",
  3: "impermanent loss",
};

module.exports = { alertsTypes, alertsTypeNames };
