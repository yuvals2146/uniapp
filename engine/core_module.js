async function analyzeDataPoint(
  positionData,
  etherUsdExchangeRate,
  ArbitUsdExchangeRate,
  blockNumber
) {
  console.log(positionData.tickLow, "\n");
  //   poolId: poolId,
  //   pair: positionData.pair,
  //   liquidityToken0: parseFloat(positionData.liquidityToken0),
  //   liquidityToken1: parseFloat(positionData.liquidityToken1),
  //   feesToken0: parseFloat(positionData.feesToken0),
  //   feesToken1: parseFloat(positionData.feesToken1),
  //   priceToken0: positionData.priceToken0 / 1e18,
  //   etherUsdExchangeRate: etherUsdExchangeRate,
  //   ArbitUsdExchangeRate: ArbitUsdExchangeRate,
  //   blockNumber: blockNumber
}

module.exports = {
  analyzeDataPoint,
};
