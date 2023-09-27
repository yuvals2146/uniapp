const inBounds = (recived, expected, delta) => {
  if (Math.abs(recived - expected) > delta) {
    return false;
  }
  return true;
};

const calculateDelta = (recived, expected) => {
  return Math.abs(recived - expected);
};

module.exports = {
  inBounds,
  calculateDelta,
};
