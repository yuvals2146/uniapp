// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ETHER %%%%%%%%%%%%%%%%%%%%%%%%%%%%
// ether position 1:

const { chainsNames } = require("../utils/chains");

const mockEtherPositionOne = {
  id: 482139,
  chain: 1,
};

const mockEtherPositionWithDataOne = {
  id: 482139,
  chain: 1,
  createdAt: 1680613919000,
  initValueToken0: 0.000000000965856802,
  token0Symbol: "USDC",
  initValueToken1: 1.999999998264815215,
  token1Symbol: "ETH",
  initToken0USDRate: process.env.ENV === "ci-test" ? 1 : 0.9995,
  initToken1USDRate: process.env.ENV === "ci-test" ? 2 : 1872.32,
};

const mockEthereumPositionOneInitialData = {
  token0address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  token0symbol: "USDC",
  token1symbol: "ETH",
  token1address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  fee: 500,
  tickUpper: 201560,
  amount0Desired: "0.000000000965856802",
  initValueToken0: 965.8568019999999,
  amount1Desired: "1.999999998264815215",
  initValueToken1: 1.999999998264815215,
  amount0Min: "0.000000000887550067",
  amount1Min: "1.958114099215592832",
  recipient: "0x735Fe3BB02D5961f064Ae5B6E0d89eE2ed73136b",
  blockNumber: 16975737,
  blockTimestemp: 1680613919000,
  initToken0USDRate: process.env.ENV === "ci-test" ? 1 : "0.99950000",
  initToken1USDRate: process.env.ENV === "ci-test" ? 2 : "1872.32000000",
};

const mockEtherPositionInfoDataOne = {
  positionData: {
    pair: "USDC/WETH",
    liquidityToken0: "0.000000000965856802",
    liquidityToken1: "1.999999998264815215",
    feesToken0: "0.000000000078306735",
    feesToken1: "0.041885900784407648",
    priceToken0: "0.99950000",
  },
  etherUsdExchangeRate: 1,
  ArbitUsdExchangeRate: 1,
  positionId: 482139,
  positionChain: 1,
  blockNumber: 16975737,
};
// ether position 2:
const mockEtherPositionTwo = {
  id: 2,
  chain: 1,
};

const mockEtherPositionWithDataTwo = {
  id: 1,
  chainId: 1,
  createdAt: new Date(1234),
  initValueToken0: 0,
  token0Symbol: "ETH",
  initValueToken1: 0,
  token1Symbol: "USDT",
  initToken0USDRate: 0,
  initToken1USDRate: 0,
};

const mockEtherPositionInfoDataTwo = {
  positionData: {
    pair: "USDC/WETH",
    liquidityToken0: "0.000000000965856802",
    liquidityToken1: "1.999999998264815215",
    feesToken0: "0.000000000078306735",
    feesToken1: "0.041885900784407648",
    priceToken0: "0.99950000",
  },
  etherUsdExchangeRate: 1,
  ArbitUsdExchangeRate: 1,
  positionId: 2,
  positionChain: 1,
  blockNumber: 16975737,
};

// ether position 3:

const mockEtherPositionThree = {
  id: 12,
  chain: 1,
};

const mockEtherPositionWithDataThree = {
  id: 1,
  chainId: 1,
  createdAt: new Date(1234),
  initValueToken0: 0,
  token0Symbol: "ETH",
  initValueToken1: 0,
  token1Symbol: "USDT",
  initToken0USDRate: process.env.ENV === "ci-test" ? 1 : 0,
  initToken1USDRate: process.env.ENV === "ci-test" ? 2 : 0,
};

// ether position 4:

const mockEtherPositionFour = {
  id: 3,
  chain: 1,
};

const mockEtherPositionWithDataFour = {
  id: 1,
  chainId: 1,
  createdAt: new Date(1234),
  initValueToken0: 0,
  token0Symbol: "ETH",
  initValueToken1: 0,
  token1Symbol: "USDT",
  initToken0USDRate: process.env.ENV === "ci-test" ? 1 : 0,
  initToken1USDRate: process.env.ENV === "ci-test" ? 2 : 0,
};

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%% ARBIT %%%%%%%%%%%%%%%%%%%%%%%%%%%%

// arbit position 1:
const mockArbitPositionOne = {
  id: 795484,
  chain: chainsNames.arbitrum,
  txHash: "0x3f040e3300be131dbe7ce228f21f26ddc28271c53b4a2ae590142669fce45b0e",
};

const mockArbitPositionWithDataOne = {
  id: 795484,
  chain: 42161,
  createdAt: 1693071326000,
  initValueToken0: 0.329534836654748873,
  token0Symbol: "ETH",
  initValueToken1: 566.671305985847971808,
  token1Symbol: "ARB",
  initToken0USDRate: process.env.ENV === "ci-test" ? 1 : 1645.12,
  initToken1USDRate: process.env.ENV === "ci-test" ? 2 : 0.9415,
};

const mockArbitPositionOneInitialData = {
  token0address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  token0symbol: "ETH",
  token1symbol: "ARB",
  token1address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  fee: 500,
  tickUpper: 75430,
  amount0Desired: "0.329534836654748873",
  initValueToken0: 0.329534836654748873,
  amount1Desired: "566.671305985847971808",
  initValueToken1: 566.671305985847971808,
  amount0Min: "0.307832909350950479",
  amount1Min: "528.573542037187932972",
  recipient: "0xFC3df89F8AF7D957B2283D0306B091a90ab1A648",
  blockNumber: 125225248,
  blockTimestemp: 1693071326000,
  initToken0USDRate: process.env.ENV === "ci-test" ? 1 : "1645.12000000",
  initToken1USDRate: process.env.ENV === "ci-test" ? 2 : "0.94150000",
};

// arbit position 2:

const mockArbitPositionTwo = {
  id: 2,
  chain: 42161,
};

// arbit position 3:

const mockArbitPositionThree = {
  id: 795484,
  chain: 42161,
};

// arbit position 4:

const mockArbitPositionFour = {
  id: 3,
  chain: 42161,
};

const mockInvalidPositionId = {
  id: 0,
  chain: 1,
};
const mockInvalidPositionChain = {
  id: 482139,
  chain: 5,
};

module.exports = {
  mockEtherPositionOne,
  mockEthereumPositionOneInitialData,
  mockEtherPositionWithDataOne,
  mockEtherPositionInfoDataOne,

  mockEtherPositionTwo,
  mockEtherPositionWithDataTwo,
  mockEtherPositionInfoDataTwo,

  mockEtherPositionThree,
  mockEtherPositionWithDataThree,

  mockEtherPositionFour,
  mockEtherPositionWithDataFour,

  mockArbitPositionOne,
  mockArbitPositionWithDataOne,
  mockArbitPositionOneInitialData,

  mockArbitPositionTwo,
  mockArbitPositionThree,
  mockArbitPositionFour,

  mockInvalidPositionId,
  mockInvalidPositionChain,
};
