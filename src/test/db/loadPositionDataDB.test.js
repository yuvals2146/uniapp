const factory = require("../factories");
const {
  mockEtherPositionOne,
  mockEtherPositionWithDataOne,
  mockArbitPositionOne,
  mockArbitPositionWithDataOne,
  mockUnvalidPositionId,
} = require("../mocks");

const {
  loadPosition,
  loadAllPositions,
} = require("../../db/loadPositionDataDB.js");

describe("loadPositionInit", () => {
  beforeAll(async () => {
    await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
    await factory.addPositionIntoDB(mockArbitPositionWithDataOne);
  });

  afterAll(async () => {
    await factory.removePositionFromDB(mockEtherPositionOne);
    await factory.removePositionFromDB(mockArbitPositionOne);
  });

  test("should load valid ethereum position for db", async () => {
    const result = await loadPosition(mockEtherPositionOne);

    expect(result.chain).toEqual(mockEtherPositionWithDataOne.chainId);

    expect(result.id).toEqual(mockEtherPositionWithDataOne.id);

    expect(result.createdAt).toEqual(
      new Date(mockEtherPositionWithDataOne.createdAt)
    );

    expect(result.initPriceT0T1).toEqual(
      mockEtherPositionWithDataOne.initToken0USDRate /
        mockEtherPositionWithDataOne.initToken1USDRate
    );
  
    expect(result.initToken0USDRate).toEqual(
      mockEtherPositionWithDataOne.initToken0USDRate
    );

    expect(result.initToken1USDRate).toEqual(
      mockEtherPositionWithDataOne.initToken1USDRate
    );

    expect(result.initValueToken0).toEqual(
      mockEtherPositionWithDataOne.initValueToken0
    );

    expect(
      Math.abs(
        mockEtherPositionWithDataOne.initValueToken1 - result.initValueToken1
      )
    ).toBeLessThan(0.00000001);

    expect(result.token0Symbol).toEqual(
      mockEtherPositionWithDataOne.token0Symbol
    );

    expect(result.token1Symbol).toEqual(
      mockEtherPositionWithDataOne.token1Symbol
    );
  });

  test("should load valid arbitrum form db", async () => {
    const result = await loadPosition(mockArbitPositionOne);

    expect(result.chain).toEqual(mockArbitPositionWithDataOne.chainId);

    expect(result.id).toEqual(mockArbitPositionWithDataOne.id);

    expect(result.createdAt).toEqual(
      new Date(mockArbitPositionWithDataOne.createdAt)
    );

    expect(
      Math.abs(
        mockArbitPositionWithDataOne.initToken0USDRate /
          mockArbitPositionWithDataOne.initToken1USDRate -
          result.initPriceT0T1
      )
    ).toBeLessThan(0.00000001);

    expect(result.initToken0USDRate).toEqual(
      mockArbitPositionWithDataOne.initToken0USDRate
    );

    expect(result.initToken1USDRate).toEqual(
      mockArbitPositionWithDataOne.initToken1USDRate
    );

    expect(
      Math.abs(
        mockArbitPositionWithDataOne.initValueToken0 - result.initValueToken0
      )
    ).toBeLessThan(0.00000001);

    expect(
      Math.abs(
        mockArbitPositionWithDataOne.initValueToken1 - result.initValueToken1
      )
    ).toBeLessThan(0.00000001);

    expect(result.token0Symbol).toEqual(
      mockArbitPositionWithDataOne.token0Symbol
    );

    expect(result.token1Symbol).toEqual(
      mockArbitPositionWithDataOne.token1Symbol
    );
  });

  test("should not load invalid position id form db", async () => {
    expect(() => loadPosition(mockUnvalidPositionId)).rejects.toThrow(
      "position not found"
    );
  });

  //   test("should not load invalid position chain form db", async () => {
  //     const result = await loadPosition(mockUnvalidPositionChain);

  //     // expect(result).toEqual(mockEtherPositionWithDataOne);
  //   });
});

describe("loadAllPositions", () => {
  beforeAll(async () => {
    await factory.addPositionIntoDB(mockEtherPositionWithDataOne);
    await factory.addPositionIntoDB(mockArbitPositionWithDataOne);
  });

  afterAll(async () => {
    await factory.removePositionFromDB(mockEtherPositionOne);
    await factory.removePositionFromDB(mockArbitPositionOne);
  });

  test("should load all positions from db", async () => {
    const [firstPosition, secoundPosition] = await loadAllPositions();

    expect(firstPosition.chain).toEqual(mockEtherPositionWithDataOne.chainId);

    expect(firstPosition.id).toEqual(mockEtherPositionWithDataOne.id);

    expect(firstPosition.createdAt).toEqual(
      new Date(mockEtherPositionWithDataOne.createdAt)
    );

    expect(firstPosition.initPriceT0T1).toEqual(
      mockEtherPositionWithDataOne.initToken0USDRate /
        mockEtherPositionWithDataOne.initToken1USDRate
    );
    expect(firstPosition.initToken0USDRate).toEqual(
      mockEtherPositionWithDataOne.initToken0USDRate
    );
    expect(firstPosition.initToken1USDRate).toEqual(
      mockEtherPositionWithDataOne.initToken1USDRate
    );
    expect(firstPosition.initValueToken0).toEqual(
      mockEtherPositionWithDataOne.initValueToken0
    );
    expect(
      Math.abs(
        mockEtherPositionWithDataOne.initValueToken1 -
          firstPosition.initValueToken1
      )
    ).toBeLessThan(0.00000001);

    expect(firstPosition.token0Symbol).toEqual(
      mockEtherPositionWithDataOne.token0Symbol
    );

    expect(firstPosition.token1Symbol).toEqual(
      mockEtherPositionWithDataOne.token1Symbol
    );

    // check arbit position

    expect(secoundPosition.chain).toEqual(mockArbitPositionWithDataOne.chainId);

    expect(secoundPosition.id).toEqual(mockArbitPositionWithDataOne.id);

    expect(secoundPosition.createdAt).toEqual(
      new Date(mockArbitPositionWithDataOne.createdAt)
    );

    expect(
      Math.abs(
        mockArbitPositionWithDataOne.initToken0USDRate /
          mockArbitPositionWithDataOne.initToken1USDRate -
          secoundPosition.initPriceT0T1
      )
    ).toBeLessThan(0.00000001);

    expect(secoundPosition.initToken0USDRate).toEqual(
      mockArbitPositionWithDataOne.initToken0USDRate
    );

    expect(secoundPosition.initToken1USDRate).toEqual(
      mockArbitPositionWithDataOne.initToken1USDRate
    );

    expect(
      Math.abs(
        mockArbitPositionWithDataOne.initValueToken0 -
          secoundPosition.initValueToken0
      )
    ).toBeLessThan(0.00000001);

    expect(
      Math.abs(
        mockArbitPositionWithDataOne.initValueToken1 -
          secoundPosition.initValueToken1
      )
    ).toBeLessThan(0.00000001);

    expect(secoundPosition.token0Symbol).toEqual(
      mockArbitPositionWithDataOne.token0Symbol
    );

    expect(secoundPosition.token1Symbol).toEqual(
      mockArbitPositionWithDataOne.token1Symbol
    );
  });
});
