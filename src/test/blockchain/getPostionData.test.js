const {
  getPostionData,
  getCurrentBlockNumber,
  retriveInitalPositionData,
} = require("../../blockchain/getPostionData");
const {
  mockEthereumPositionOneItitialData,
  mockArbitPositionOneItitialData,
} = require("../mocks.js");
const { chains, chainsNames } = require("../../utils/chains");
// async function getData(position) {...} return PositionInfo;

const mockPosition = {
  positionData: {
    pair: "",
    liquidityToken0: "",
    liquidityToken1: "",
    feesToken0: "",
    feesToken1: "",
    priceToken0: "",
    initData: {
      blockTimestemp: "",
      initValueToken0: "",
      token0symbol: "",
      initValueToken1: "",
      token1symbol: "",
    },
    //????? auto generated need to validate!
  },
  etherUsdExchangeRate: 1,
  ArbitUsdExchangeRate: 1,
  positionId: 1,
  blockNumber: 2,
};
const mockPositionChain = 1;
describe("getPostionData", () => {
  test("should get position data for valid etherum position", async () => {
    const resultData = await getPostionData({
      id: 482139,
      chain: chainsNames.etherum,
    });
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

// ON HOLD UNTIL DANY FINISH THIS PART
//const getPoolExchangeRate = async (poolAddress, chain) => {...} return exchangeRate;
// describe("getPoolExchangeRate", () => {
//   test("should get Exchange rate from arbitrum for a valid token0?? pool address and chain", async () => {
//     //     getPoolExchangeRate(validPoolsAddress.arb0, cha);
//     expect(1).toEqual(1);
//   });
// });
// ON HOLD UNTIL DANY FINISH THIS PART

//const getCurrentBlockNumber = async (chain) => {...} return blockNumber;
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

// const retriveInitalPositionData = async (position) => {...} return PositionInfo;

describe("retriveInitalPositionData", () => {
  test("should retrive Inital Position Data for valid etherum position without tx hash", async () => {
    const resultData = await retriveInitalPositionData({
      id: 482139,
      chain: chainsNames.etherum,
    });
    expect(resultData).toEqual(mockEthereumPositionOneItitialData);
  });

  test("should retrive Inital Position Data for valid etherum position with tx hash", async () => {
    const txHash =
      "0x4c2056c796abd55edbfb65e25687a80f2f357b2726928cb33f61c4511f01373b";
    const resultData = await retriveInitalPositionData(
      {
        id: 482139,
        chain: chainsNames.etherum,
      },
      txHash
    );
    expect(resultData).toEqual(mockEthereumPositionOneItitialData);
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

    expect(resultData).toEqual(mockArbitPositionOneItitialData);
  });

  test("should not retrive Inital Position Data for non valid etherum position", async () => {
    expect(() =>
      retriveInitalPositionData({
        id: 10000000,
        chain: chainsNames.etherum,
      })
    ).rejects.toThrow(
      "No inital data found for position 10000000 reason theGraph - could not get mint TX for position 10000000 on chain etherum"
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
      "No inital data found for position 795484 reason no init data found"
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
    "No inital data found for position 795484 reason theGraph - could not get mint TX for position 795484 on chain arbitrum"
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
    "No inital data found for position 795484 reason no init data found"
  );
});
