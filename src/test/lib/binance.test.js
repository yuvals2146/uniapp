const { fetchHistoricalPriceData } = require("../../lib/binance.js");

const { chains } = require("../../utils/chains");
//async function fetchHistoricalPriceData(token0, token1, startTime) {
const validPairs = [
  ["ARB", "BTC"], // ETH
  ["ETH", "BTC"], // ARB
  ["ARB", "ETH"], // BTC
];
const validTokens = ["ETH", "ARB", "BTC"];

describe("fetchHistoricalPriceData", () => {
  test("should fetch data for all valid pairs and time", async () => {
    for (let i = 0; i < validTokens.length; i++) {
      for (let j = 0; j < validPairs[i].length; j++) {
        const [resInitToken0USDRate, resInitToken1USDRate] =
          await fetchHistoricalPriceData(
            validTokens[i],
            validPairs[i][j],
            1693056174000
          );

        expect(resInitToken0USDRate).not.toBeUndefined();
        expect(resInitToken1USDRate).not.toBeUndefined();
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
    }).rejects.toThrow(/response time is not valid, startTime: 1000000/);

    expect(async () => {
      await fetchHistoricalPriceData("ARB", "ETH", -1);
    }).rejects.toThrow("startTime -1 is not valid");
  });
});
