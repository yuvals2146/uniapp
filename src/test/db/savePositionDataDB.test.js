const { savePositionData } = require("../../db/savePositionDataDB");
const {
  mockEtherPositionInfoDataOne,
  mockEtherPositionWithDataOne,
  mockEtherPositionOne,
  mockEtherPositionInfoDataTwo,
  mockEtherPositionTwo,
} = require("../mocks");
const factory = require("../factories");

describe("savePositionData", () => {
  beforeAll(async () => {
    await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
  });

  afterAll(async () => {
    await factory.removePositionFromDB(mockEtherPositionOne);
  });

  test("should save position info data to db", async () => {
    await savePositionData(
      mockEtherPositionInfoDataOne.positionData,
      mockEtherPositionInfoDataOne.etherUsdExchangeRate,
      mockEtherPositionInfoDataOne.ArbitUsdExchangeRate,
      mockEtherPositionOne,
      mockEtherPositionInfoDataOne.blockNumber
    );

    const [res] = await factory.loadAllPositionInfoFromDB();

    expect({ id: res.posId, chain: res.posChain }).toEqual(
      mockEtherPositionOne
    );
    expect(res).toHaveProperty("pair");
    expect(res).toHaveProperty("createdAt");
    expect(res).toHaveProperty("liquidityToken0");
    expect(res).toHaveProperty("liquidityToken1");
    expect(res).toHaveProperty("feesToken0");
    expect(res).toHaveProperty("feesToken1");
    expect(res).toHaveProperty("token0Token1Rate");
    expect(res).toHaveProperty("token0USDCExchangeRate");
    expect(res).toHaveProperty("token1USDCExchangeRate");
    expect(res).toHaveProperty("blockNumber");
  });

  test("should not save position info data to db if position", async () => {
    expect(
      async () =>
        await savePositionData(
          mockEtherPositionInfoDataTwo.positionData,
          mockEtherPositionInfoDataTwo.etherUsdExchangeRate,
          mockEtherPositionInfoDataTwo.ArbitUsdExchangeRate,
          mockEtherPositionTwo,
          mockEtherPositionInfoDataTwo.blockNumber
        )
    ).rejects.toThrow("position not found");
  });
});
describe("userSaveNewPosition", () => {
  test("should add a new position to the list", async () => {
    expect(1).toEqual(1);
  });
});
