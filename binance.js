const axios = require("axios");

// Binance API base URL
const baseURL = "https://api.binance.com/api/v3";

// Function to fetch historical price data
async function fetchHistoricalPriceData(token0, token1, startTime) {
  const endpoint = "/klines";

  // return null if tokens are not supported
  if (
    !tokenToUSDTSymblos[token0] ||
    (!tokenToUSDTSymblos[token1] && token1 !== "USDT")
  ) {
    return null;
  }
  const [symbolToken0, symbolToken1] = FixTokenSymbols(token0, token1);
  const queryUSDTPriceToken0 = `symbol=${symbolToken0}&interval=1m&startTime=${startTime}&limit=1`;
  const queryUSDTPriceToken1 = `symbol=${symbolToken1}&interval=1m&startTime=${startTime}&limit=1`;
  let token0PriceResponse, token1PriceResponse;

  try {
    token0PriceResponse = await axios.get(
      `${baseURL}${endpoint}?${queryUSDTPriceToken0}`
    );
  } catch (err) {
    logger.log(`Error fetching historical data for Token0: ${token0}`);
    return null;
  }
  try {
    token1PriceResponse =
      token1 !== "USDT"
        ? await axios.get(`${baseURL}${endpoint}?${queryUSDTPriceToken1}`)
        : null;
  } catch (err) {
    logger.error(`Error fetching historical data for Token1: ${token1}`);
    return null;
  }
  const initToken1USDRate = symbolToken1 ? token1PriceResponse.data[0][1] : 1;
  const initToken0USDRate = token0PriceResponse.data[0][1];
  const initPriceT0T1 = initToken0USDRate / initToken1USDRate;
  const historicalData = {
    //   openPrice: response.data[0][1],
    //   closePrice: response.data[0][4],
    //   highestPrice: response.data[0][2],
    //   lowestPrice: response.data[0][3],
    //   volume: response.data[0][5],
    //   closeTime: response.data[0][6],
    //   quoteAssetVolume: response.data[0][7],
    //   numberOfTrades: response.data[0][8],
    //   takerBuyBaseAssetVolume: response.data[0][9],
    //   takerBuyQuoteAssetVolume: response.data[0][10],
    //   Ignore: response.data[0][11],
    initToken0USDRate,
    initToken1USDRate,
    initPriceT0T1,
  };
  return historicalData;
}

const FixTokenSymbols = (token0, token1) => {
  if (token1 === "USDT") {
    return [`${token0}${token1}`, null];
  } else {
    return [`${token0}USDT`, `${token1}USDT`];
  }
};
// need to be change it!!!
const tokenToUSDTSymblos = {
  ARB: "ARBUSDT",
  ETH: "ETHUSDT",
  BTC: "BTCUSDT",
  GMX: "GMXUSDT",
  PENDLE: "GMXUSDT",
};

module.exports = {
  fetchHistoricalPriceData,
};
