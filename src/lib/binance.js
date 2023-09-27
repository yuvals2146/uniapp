const axios = require("axios");
const logger = require("../utils/logger.js");
// Binance API base URL
const baseURL = "https://api.binance.us/api/v3";

// Function to fetch historical price data
async function fetchHistoricalPriceData(token0, token1, startTime) {
  const endpoint = "/klines";

  if (
    !tokenToUSDTSymblos[token0] ||
    (!tokenToUSDTSymblos[token1] && token1 !== "USDT")
  ) {
    throw new Error(`pair of ${token0} and ${token1} not supported`);
  }

  if (startTime < 0 || startTime > Date.now()) {
    throw new Error(`startTime ${startTime} is not valid`);
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
    logger.error(`Error fetching historical data for Token0: ${token0}`);
    logger.error(err.message);
    throw new Error(
      `Error fetching historical data for Token0: ${token0} with query ${queryUSDTPriceToken0}`
    );
  }

  try {
    token1PriceResponse =
      token1 !== "USDT"
        ? await axios.get(`${baseURL}${endpoint}?${queryUSDTPriceToken1}`)
        : null;
  } catch (err) {
    logger.error(`Error fetching historical data for Token1: ${token1}`);
    throw new Error(
      `Error fetching historical data for Token1: ${token1} with query ${queryUSDTPriceToken1}`
    );
  }

  const initToken1USDRate = symbolToken1 ? token1PriceResponse.data[0][1] : 1;
  const initToken0USDRate = token0PriceResponse.data[0][1];

  const responseTimeIsValid = isValidTime(
    startTime,
    token0PriceResponse.data[0][0],
    token1PriceResponse.data[0][0]
  );
  if (!responseTimeIsValid) {
    throw new Error(
      `response time is not valid, startTime: ${startTime}, token0TimeResponse: ${token0PriceResponse.data[0][0]}, token1TimeResponse: ${token1PriceResponse.data[0][0]}`
    );
  }
  return [initToken0USDRate, initToken1USDRate];
}

const isValidTime = (requstedTime, token0TimeResponse, token1TimeResponse) => {
  const token0TimeDelta = Math.abs(requstedTime - token0TimeResponse);
  const token1TimeDelta = Math.abs(requstedTime - token1TimeResponse);
  const maxDelta = 300000; // 5 min

  return token0TimeDelta < maxDelta && token1TimeDelta < maxDelta;
};

const FixTokenSymbols = (token0, token1) => {
  if (token1 === "USDT") {
    return [`${token0}${token1}`, null];
  } else {
    return [`${token0}USDT`, `${token1}USDT`];
  }
};

// need to be change it!!!
const tokenToUSDTSymblos = {
  USDC: "USDCUSDT",
  ARB: "ARBUSDT",
  ETH: "ETHUSDT",
  BTC: "BTCUSDT",
};

module.exports = {
  fetchHistoricalPriceData,
};
