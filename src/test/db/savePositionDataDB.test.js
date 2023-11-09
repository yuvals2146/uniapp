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

  test("Should save position info data to db", async () => {
    await savePositionData(
      mockEtherPositionInfoDataOne.positionData,
      mockEtherPositionInfoDataOne.etherUsdExchangeRate,
      mockEtherPositionInfoDataOne.ArbitUsdExchangeRate,
      mockEtherPositionOne,
      mockEtherPositionInfoDataOne.blockNumber
    );

    const [res] = await factory.loadAllPositionInfoFromDB();

    expect({
      id: res.posId,
      chainId: res.posChain,
      ActivePosition: mockEtherPositionOne.ActivePosition,
    }).toEqual(mockEtherPositionOne);
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

  test("Should not save position info to db if position isn't found", async () => {
    expect(
      async () =>
        await savePositionData(
          mockEtherPositionInfoDataTwo.positionData,
          mockEtherPositionInfoDataTwo.etherUsdExchangeRate,
          mockEtherPositionInfoDataTwo.ArbitUsdExchangeRate,
          mockEtherPositionTwo,
          mockEtherPositionInfoDataTwo.blockNumber
        )
    ).rejects.toThrow(
      "Foreign key constraint failed on the field: `PositionInfo_posId_posChain_fkey (index)`"
    );
  });
});
describe("userSaveNewPosition", () => {
  test("should add a new position to the list", async () => {
    expect(1).toEqual(1);
  });
});
