const { fetchHistoricalPriceData } = require("../../binance");

const { chains } = require("../../chains");
//async function fetchHistoricalPriceData(token0, token1, startTime) {
const validPairs = [
  ["ARB", "BTC", "GMX", "PENDLE"], // ETH
  ["ETH", "BTC", "GMX", "PENDLE"], // ARB
  ["ARB", "ETH", "GMX", "PENDLE"], // BTC
  ["ARB", "BTC", "ETH", "PENDLE"], // GMX
  ["ARB", "BTC", "GMX", "ETH"], // PENDLE
];
const validTokens = ["ETH", "ARB", "BTC", "GMX", "PENDLE"];

describe("Fetch historical Data from Binance API", () => {
  test("should fetch data for all valid pairs and time", async () => {
    for (let i = 0; i < validTokens.length; i++) {
      for (let j = 0; j < validPairs[i].length; j++) {
        const res = await fetchHistoricalPriceData(
          validTokens[i],
          validPairs[i][j],
          1693056174000
        );
        expect(res).toHaveProperty("initToken0USDRate");
        expect(res).toHaveProperty("initToken1USDRate");
        expect(res).toHaveProperty("initPriceT0T1");
      }
    }
  });

  test("should not fetch data for non valid pair", async () => {
    expect(async () => {
      await fetchHistoricalPriceData("BAD", "ETH", 1629784800000);
    }).rejects.toThrow("pair of BAD and ETH not supported");
  });

  test("should not fetch data for non valid time", async () => {
    expect(async () => {
      await fetchHistoricalPriceData("ARB", "ETH", 1000000);
    }).rejects.toThrow(
      "response time is not valid, startTime: 1000000, token0TimeResponse: 1679583600000, token1TimeResponse: 1502942400000"
    );

    expect(async () => {
      await fetchHistoricalPriceData("ARB", "ETH", -1);
    }).rejects.toThrow("startTime -1 is not valid");
  });
});
