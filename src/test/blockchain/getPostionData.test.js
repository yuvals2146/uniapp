const {
  getPostionData,
  getCurrentBlockNumber,
  retriveInitalPositionData,
  getPoolExchangeRate,
} = require("../../blockchain/getPostionData");
const {
  mockEtherPositionOne,
  mockEthereumPositionOneInitialData,
  mockArbitPositionOne,
  mockArbitPositionOneInitialData,
  mockArbitPositionThree,
} = require("../mocks.js");
const { chainsNames } = require("../../utils/chains");

describe("getPostionData", () => {
  test("should get position data for valid ethereum position", async () => {
    const resultData = await getPostionData(mockEtherPositionOne);
    expect(resultData).toHaveProperty("feesToken0");
    expect(resultData).toHaveProperty("feesToken1");
    expect(resultData).toHaveProperty("priceToken0");
    expect(resultData.pair).toEqual("USDC/WETH");
    expect(resultData).toHaveProperty("liquidityToken0");
    expect(resultData).toHaveProperty("liquidityToken1");
    expect(resultData).toHaveProperty("tickLeft");
    expect(resultData).toHaveProperty("tickRight");
    expect(resultData).toHaveProperty("tickCurr");
  });

  test("should get position data for valid arbitrum position", async () => {
    const resultData = await getPostionData({
      id: 795484,
      chain: chainsNames.arbitrum,
    });
    expect(resultData).toHaveProperty("feesToken0");
    expect(resultData).toHaveProperty("feesToken1");
    expect(resultData).toHaveProperty("priceToken0");
    expect(resultData.pair).toEqual("WETH/ARB");
    expect(resultData).toHaveProperty("liquidityToken0");
    expect(resultData).toHaveProperty("liquidityToken1");
    expect(resultData).toHaveProperty("tickLeft");
    expect(resultData).toHaveProperty("tickRight");
    expect(resultData).toHaveProperty("tickCurr");
  });

  test("should not get position data for non valid position chain", async () => {
    expect(async () => {
      await getPostionData({ id: 482139, dog: 1 });
    }).rejects.toThrow("not valid chain id undefined");

    expect(async () => {
      await getPostionData({ id: 482139, chain: "ethereum" });
    }).rejects.toThrow("not valid chain id ethereum");
  });

  test("should not get position data for non valid position id", async () => {
    expect(async () => {
      await getPostionData({ cat: 482139, chain: 1 });
    }).rejects.toThrow("not valid position id or not exist");

    expect(async () => {
      await getPostionData({ id: "three", chain: 1 });
    }).rejects.toThrow("not valid position id or not exist");

    expect(async () => {
      await getPostionData({ id: -12, chain: 1 });
    }).rejects.toThrow("not valid position id or not exist");
  });

  test("should not get position data for not exist chain", async () => {
    expect(async () => {
      await getPostionData({ id: 1234, chain: 3 });
    }).rejects.toThrow("not valid chain id 3");
  });

  test("should not get position data for not exist token", async () => {
    expect(async () => {
      await getPostionData({ id: 10000000000, chain: 1 });
    }).rejects.toThrow(
      /could not get data for position 10000000000 on chain ethereum/
    );
  });
});

describe("getPoolExchangeRate", () => {
  //test("should get Exchange rate from ethereum for a valid token", async () => {
  //expect(await getPoolExchangeRate(VALID_POSITION, 0)).toEqual(20);

  // });
  test("should get Exchange rate from arbitrum for a valid token", async () => {
    const result = await getPoolExchangeRate(mockArbitPositionThree, 1);
    expect(result).toBeGreaterThan(0);
  });

  test("should not get Exchange rate from ethereum for a invalid token", async () => {
    expect(async () => {
      await getPoolExchangeRate(mockEtherPositionOne, 0);
    }).rejects.toThrow("cannot get pool exchange rate for token USDC or USD");
  });

  // test("should not get Exchange rate from arbitrum for a invalid token", async () => {
  //   expect(
  //     async () => await getPoolExchangeRate(mockArbitPositionOne, 1)
  //   ).rejects.toThrow("cannot get pool exchange rate for token USDC or USD");
  // });

  test("should not get Exchange rate from invalid index", async () => {
    expect(async () => {
      await getPoolExchangeRate(mockEtherPositionOne, 2);
    }).rejects.toThrow("index must be 0 or 1");
  });
});

describe("getCurrentBlockNumber", () => {
  test("Should get current block for ethereum", async () => {
    const resultBlock = await getCurrentBlockNumber(chainsNames.ethereum);
    // 18025927 ethereum block on the first test run
    expect(resultBlock).toBeGreaterThan(18025927);
  });

  test("Should get current block for arbitrum block", async () => {
    const resultBlock = await getCurrentBlockNumber(chainsNames.arbitrum);
    // 126313406 arbit block on the first test run
    expect(resultBlock).toBeGreaterThan(126313406);
  });

  test("Should not get current block for no valid chain", async () => {
    expect(async () => {
      await getCurrentBlockNumber(3);
    }).rejects.toThrow("not valid chain id 3");
  });
});

describe("retriveInitalPositionData", () => {
  test("should retrive Inital Position Data for valid ethereum position without tx hash", async () => {
    const resultData = await retriveInitalPositionData(mockEtherPositionOne);
    expect(resultData.token0address).toEqual(
      mockEthereumPositionOneInitialData.token0address
    );
    expect(resultData.token0symbol).toEqual(
      mockEthereumPositionOneInitialData.token0symbol
    );
    expect(resultData.token1address).toEqual(
      mockEthereumPositionOneInitialData.token1address
    );
    expect(resultData.token1symbol).toEqual(
      mockEthereumPositionOneInitialData.token1symbol
    );
    expect(resultData.fee).toEqual(mockEthereumPositionOneInitialData.fee);

    expect(resultData.tickUpper).toEqual(
      mockEthereumPositionOneInitialData.tickUpper
    );
    expect(resultData.amount0Desired).toEqual(
      mockEthereumPositionOneInitialData.amount0Desired
    );
    expect(resultData.initValueToken0).toEqual(
      mockEthereumPositionOneInitialData.initValueToken0
    );
    expect(resultData.amount1Desired).toEqual(
      mockEthereumPositionOneInitialData.amount1Desired
    );
    expect(resultData.initValueToken1).toEqual(
      mockEthereumPositionOneInitialData.initValueToken1
    );
    expect(resultData.amount0Min).toEqual(
      mockEthereumPositionOneInitialData.amount0Min
    );
    expect(resultData.amount1Min).toEqual(
      mockEthereumPositionOneInitialData.amount1Min
    );
    expect(resultData.recipient).toEqual(
      mockEthereumPositionOneInitialData.recipient
    );
    expect(resultData.blockNumber).toEqual(
      mockEthereumPositionOneInitialData.blockNumber
    );
    expect(resultData.blockTimestemp).toEqual(
      mockEthereumPositionOneInitialData.blockTimestemp
    );
    expect(resultData.initToken0USDRate).toEqual(
      mockEthereumPositionOneInitialData.initToken0USDRate
    );
    expect(resultData.initToken1USDRate).toEqual(
      mockEthereumPositionOneInitialData.initToken1USDRate
    );
  });

  test("should retrive Inital Position Data for valid ethereum position with tx hash", async () => {
    const txHash =
      "0x4c2056c796abd55edbfb65e25687a80f2f357b2726928cb33f61c4511f01373b";
    const resultData = await retriveInitalPositionData(
      mockEtherPositionOne,
      txHash
    );
    expect(resultData.token0address).toEqual(
      mockEthereumPositionOneInitialData.token0address
    );
    expect(resultData.token0symbol).toEqual(
      mockEthereumPositionOneInitialData.token0symbol
    );
    expect(resultData.token1address).toEqual(
      mockEthereumPositionOneInitialData.token1address
    );
    expect(resultData.token1symbol).toEqual(
      mockEthereumPositionOneInitialData.token1symbol
    );
    expect(resultData.fee).toEqual(mockEthereumPositionOneInitialData.fee);

    expect(resultData.tickUpper).toEqual(
      mockEthereumPositionOneInitialData.tickUpper
    );
    expect(resultData.amount0Desired).toEqual(
      mockEthereumPositionOneInitialData.amount0Desired
    );
    expect(resultData.initValueToken0).toEqual(
      mockEthereumPositionOneInitialData.initValueToken0
    );
    expect(resultData.amount1Desired).toEqual(
      mockEthereumPositionOneInitialData.amount1Desired
    );
    expect(resultData.initValueToken1).toEqual(
      mockEthereumPositionOneInitialData.initValueToken1
    );
    expect(resultData.amount0Min).toEqual(
      mockEthereumPositionOneInitialData.amount0Min
    );
    expect(resultData.amount1Min).toEqual(
      mockEthereumPositionOneInitialData.amount1Min
    );
    expect(resultData.recipient).toEqual(
      mockEthereumPositionOneInitialData.recipient
    );
    expect(resultData.blockNumber).toEqual(
      mockEthereumPositionOneInitialData.blockNumber
    );
    expect(resultData.blockTimestemp).toEqual(
      mockEthereumPositionOneInitialData.blockTimestemp
    );
    expect(resultData.initToken0USDRate).toEqual(
      mockEthereumPositionOneInitialData.initToken0USDRate
    );
    expect(resultData.initToken1USDRate).toEqual(
      mockEthereumPositionOneInitialData.initToken1USDRate
    );
  });

  // no support for arbit subgraph for now
  //   test("should retrive Inital Position Data for valid arbitrum position without tx hash", async () => {
  //     const resultData = await retriveInitalPositionData(
  //       {
  //         id: 795484,
  //         chain: chainsNames.arbitrum,
  //       },
  //     );
  //     //expect(resultData).toEqual(expectedArbitrumResultData);
  //   });

  test("should retrive Inital Position Data for valid arbitrum position with tx hash", async () => {
    const txHash =
      "0x3f040e3300be131dbe7ce228f21f26ddc28271c53b4a2ae590142669fce45b0e"; //????
    const resultData = await retriveInitalPositionData(
      {
        id: 795484,
        chain: chainsNames.arbitrum,
      },
      txHash
    );

    expect(resultData.token0address).toEqual(
      mockArbitPositionOneInitialData.token0address
    );
    expect(resultData.token0symbol).toEqual(
      mockArbitPositionOneInitialData.token0symbol
    );
    expect(resultData.token1address).toEqual(
      mockArbitPositionOneInitialData.token1address
    );
    expect(resultData.token1symbol).toEqual(
      mockArbitPositionOneInitialData.token1symbol
    );
    expect(resultData.fee).toEqual(mockArbitPositionOneInitialData.fee);

    expect(resultData.tickUpper).toEqual(
      mockArbitPositionOneInitialData.tickUpper
    );
    expect(resultData.amount0Desired).toEqual(
      mockArbitPositionOneInitialData.amount0Desired
    );
    expect(resultData.initValueToken0).toEqual(
      mockArbitPositionOneInitialData.initValueToken0
    );
    expect(resultData.amount1Desired).toEqual(
      mockArbitPositionOneInitialData.amount1Desired
    );
    expect(resultData.initValueToken1).toEqual(
      mockArbitPositionOneInitialData.initValueToken1
    );
    expect(resultData.amount0Min).toEqual(
      mockArbitPositionOneInitialData.amount0Min
    );
    expect(resultData.amount1Min).toEqual(
      mockArbitPositionOneInitialData.amount1Min
    );
    expect(resultData.recipient).toEqual(
      mockArbitPositionOneInitialData.recipient
    );
    expect(resultData.blockNumber).toEqual(
      mockArbitPositionOneInitialData.blockNumber
    );
    expect(resultData.blockTimestemp).toEqual(
      mockArbitPositionOneInitialData.blockTimestemp
    );
    expect(resultData.initToken0USDRate).toEqual(
      mockArbitPositionOneInitialData.initToken0USDRate
    );
    expect(resultData.initToken1USDRate).toEqual(
      mockArbitPositionOneInitialData.initToken1USDRate
    );
  });

  test("should not retrive Inital Position Data for non valid ethereum position", async () => {
    expect(
      async () =>
        await retriveInitalPositionData({
          id: 10000000,
          chain: chainsNames.ethereum,
        })
    ).rejects.toThrow(
      "No inital data found for position 10000000 on chain ethereum"
    );
  });

  test("should not retrive Inital Position Data for non valid ethereum tx hash", async () => {
    expect(
      async () =>
        await retriveInitalPositionData(
          {
            id: 795484,
            chain: chainsNames.ethereum,
          },
          "0x12345"
        )
    ).rejects.toThrow("No tx hash found for position 795484 on chain ethereum");
  });
});

test("should not retrive Inital Position Data for valid arbitrum without tx hash", async () => {
  expect(
    async () =>
      await retriveInitalPositionData({
        id: 795484,
        chain: chainsNames.arbitrum,
      })
  ).rejects.toThrow(
    "No inital data found for position 795484 on chain arbitrum"
  );
});

test("should not retrive Inital Position Data for non valid arbitrum tx hash", async () => {
  expect(
    async () =>
      await retriveInitalPositionData(
        {
          id: 795484,
          chain: chainsNames.arbitrum,
        },
        "0x12345"
      )
  ).rejects.toThrow("No tx hash found for position 795484 on chain arbitrum");
});
