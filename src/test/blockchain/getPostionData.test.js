const {
  getPostionData,
  getCurrentBlockNumber,
  retriveInitalPositionData,
  getPoolExchangeRate,
} = require("../../blockchain/getPostionData");
const {
  mockEtherPositionOne,
  mockEthereumPositionOneItitialData,
  mockArbitPositionOne,
  mockArbitPositionOneItitialData,
  mockArbitPositionThree,
} = require("../mocks.js");
const { chainsNames } = require("../../utils/chains");

describe("getPostionData", () => {
  test("should get position data for valid etherum position", async () => {
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
      /could not get data for position 10000000000 on chain etherum/
    );
  });
});

describe("getPoolExchangeRate", () => {
  //test("should get Exchange rate from ethereum for a valid token", async () => {
  //expect(await getPoolExchangeRate(VALID_POSITION, 0)).toEqual(20);

  // });
  test("should get Exchange rate from arbitrum for a valid token", async () => {
    expect(
      await getPoolExchangeRate(mockArbitPositionThree, 1)
    ).toBeGreaterThan(0);
  });

  test("should not get Exchange rate from ethereum for a invalid token", async () => {
    expect(
      async () => await getPoolExchangeRate(mockEtherPositionOne, 0)
    ).rejects.toThrow("cannot get pool exchange rate for token USDC or USD");
  });

  // test("should not get Exchange rate from arbitrum for a invalid token", async () => {
  //   expect(
  //     async () => await getPoolExchangeRate(mockArbitPositionOne, 1)
  //   ).rejects.toThrow("cannot get pool exchange rate for token USDC or USD");
  // });

  test("should not get Exchange rate from invalid index", async () => {
    expect(
      async () => await getPoolExchangeRate(mockEtherPositionOne, 2)
    ).rejects.toThrow("index must be 0 or 1");
  });
});

describe("getCurrentBlockNumber", () => {
  test("Should get current block for etherum", async () => {
    const resultBlock = await getCurrentBlockNumber(chainsNames.etherum);
    // 18025927 etherum block on the first test run
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
  test("should retrive Inital Position Data for valid etherum position without tx hash", async () => {
    const resultData = await retriveInitalPositionData(mockEtherPositionOne);
    expect(resultData.token0address).toEqual(
      mockEthereumPositionOneItitialData.token0address
    );
    expect(resultData.token0symbol).toEqual(
      mockEthereumPositionOneItitialData.token0symbol
    );
    expect(resultData.token1address).toEqual(
      mockEthereumPositionOneItitialData.token1address
    );
    expect(resultData.token1symbol).toEqual(
      mockEthereumPositionOneItitialData.token1symbol
    );
    expect(resultData.fee).toEqual(mockEthereumPositionOneItitialData.fee);

    expect(resultData.tickUpper).toEqual(
      mockEthereumPositionOneItitialData.tickUpper
    );
    expect(resultData.amount0Desired).toEqual(
      mockEthereumPositionOneItitialData.amount0Desired
    );
    expect(resultData.initValueToken0).toEqual(
      mockEthereumPositionOneItitialData.initValueToken0
    );
    expect(resultData.amount1Desired).toEqual(
      mockEthereumPositionOneItitialData.amount1Desired
    );
    expect(resultData.initValueToken1).toEqual(
      mockEthereumPositionOneItitialData.initValueToken1
    );
    expect(resultData.amount0Min).toEqual(
      mockEthereumPositionOneItitialData.amount0Min
    );
    expect(resultData.amount1Min).toEqual(
      mockEthereumPositionOneItitialData.amount1Min
    );
    expect(resultData.recipient).toEqual(
      mockEthereumPositionOneItitialData.recipient
    );
    expect(resultData.blockNumber).toEqual(
      mockEthereumPositionOneItitialData.blockNumber
    );
    expect(resultData.blockTimestemp).toEqual(
      mockEthereumPositionOneItitialData.blockTimestemp
    );
    expect(resultData.initToken0USDRate).toEqual(
      mockEthereumPositionOneItitialData.initToken0USDRate
    );
    expect(resultData.initToken1USDRate).toEqual(
      mockEthereumPositionOneItitialData.initToken1USDRate
    );
  });

  test("should retrive Inital Position Data for valid etherum position with tx hash", async () => {
    const txHash =
      "0x4c2056c796abd55edbfb65e25687a80f2f357b2726928cb33f61c4511f01373b";
    const resultData = await retriveInitalPositionData(
      mockEtherPositionOne,
      txHash
    );
    expect(resultData.token0address).toEqual(
      mockEthereumPositionOneItitialData.token0address
    );
    expect(resultData.token0symbol).toEqual(
      mockEthereumPositionOneItitialData.token0symbol
    );
    expect(resultData.token1address).toEqual(
      mockEthereumPositionOneItitialData.token1address
    );
    expect(resultData.token1symbol).toEqual(
      mockEthereumPositionOneItitialData.token1symbol
    );
    expect(resultData.fee).toEqual(mockEthereumPositionOneItitialData.fee);

    expect(resultData.tickUpper).toEqual(
      mockEthereumPositionOneItitialData.tickUpper
    );
    expect(resultData.amount0Desired).toEqual(
      mockEthereumPositionOneItitialData.amount0Desired
    );
    expect(resultData.initValueToken0).toEqual(
      mockEthereumPositionOneItitialData.initValueToken0
    );
    expect(resultData.amount1Desired).toEqual(
      mockEthereumPositionOneItitialData.amount1Desired
    );
    expect(resultData.initValueToken1).toEqual(
      mockEthereumPositionOneItitialData.initValueToken1
    );
    expect(resultData.amount0Min).toEqual(
      mockEthereumPositionOneItitialData.amount0Min
    );
    expect(resultData.amount1Min).toEqual(
      mockEthereumPositionOneItitialData.amount1Min
    );
    expect(resultData.recipient).toEqual(
      mockEthereumPositionOneItitialData.recipient
    );
    expect(resultData.blockNumber).toEqual(
      mockEthereumPositionOneItitialData.blockNumber
    );
    expect(resultData.blockTimestemp).toEqual(
      mockEthereumPositionOneItitialData.blockTimestemp
    );
    expect(resultData.initToken0USDRate).toEqual(
      mockEthereumPositionOneItitialData.initToken0USDRate
    );
    expect(resultData.initToken1USDRate).toEqual(
      mockEthereumPositionOneItitialData.initToken1USDRate
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
  //     console.log(resultData);
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
      mockArbitPositionOneItitialData.token0address
    );
    expect(resultData.token0symbol).toEqual(
      mockArbitPositionOneItitialData.token0symbol
    );
    expect(resultData.token1address).toEqual(
      mockArbitPositionOneItitialData.token1address
    );
    expect(resultData.token1symbol).toEqual(
      mockArbitPositionOneItitialData.token1symbol
    );
    expect(resultData.fee).toEqual(mockArbitPositionOneItitialData.fee);

    expect(resultData.tickUpper).toEqual(
      mockArbitPositionOneItitialData.tickUpper
    );
    expect(resultData.amount0Desired).toEqual(
      mockArbitPositionOneItitialData.amount0Desired
    );
    expect(resultData.initValueToken0).toEqual(
      mockArbitPositionOneItitialData.initValueToken0
    );
    expect(resultData.amount1Desired).toEqual(
      mockArbitPositionOneItitialData.amount1Desired
    );
    expect(resultData.initValueToken1).toEqual(
      mockArbitPositionOneItitialData.initValueToken1
    );
    expect(resultData.amount0Min).toEqual(
      mockArbitPositionOneItitialData.amount0Min
    );
    expect(resultData.amount1Min).toEqual(
      mockArbitPositionOneItitialData.amount1Min
    );
    expect(resultData.recipient).toEqual(
      mockArbitPositionOneItitialData.recipient
    );
    expect(resultData.blockNumber).toEqual(
      mockArbitPositionOneItitialData.blockNumber
    );
    expect(resultData.blockTimestemp).toEqual(
      mockArbitPositionOneItitialData.blockTimestemp
    );
    expect(resultData.initToken0USDRate).toEqual(
      mockArbitPositionOneItitialData.initToken0USDRate
    );
    expect(resultData.initToken1USDRate).toEqual(
      mockArbitPositionOneItitialData.initToken1USDRate
    );
  });

  test("should not retrive Inital Position Data for non valid etherum position", async () => {
    expect(() =>
      retriveInitalPositionData({
        id: 10000000,
        chain: chainsNames.etherum,
      })
    ).rejects.toThrow(
      "No inital data found for position 10000000 on chain etherum"
    );
  });

  test("should not retrive Inital Position Data for non valid etherum tx hash", async () => {
    expect(() =>
      retriveInitalPositionData(
        {
          id: 795484,
          chain: chainsNames.etherum,
        },
        "0x12345"
      )
    ).rejects.toThrow(
      "No inital data found for position 795484 on chain etherum"
    );
  });
});

test("should not retrive Inital Position Data for valid arbitrum without tx hash", async () => {
  expect(() =>
    retriveInitalPositionData({
      id: 795484,
      chain: chainsNames.arbitrum,
    })
  ).rejects.toThrow(
    "No inital data found for position 795484 on chain arbitrum"
  );
});

test("should not retrive Inital Position Data for non valid arbitrum tx hash", async () => {
  expect(() =>
    retriveInitalPositionData(
      {
        id: 795484,
        chain: chainsNames.arbitrum,
      },
      "0x12345"
    )
  ).rejects.toThrow(
    "No inital data found for position 795484 on chain arbitrum"
  );
});
