require("dotenv").config();
const { JSBI } = require("@uniswap/sdk");
const { ethers } = require("ethers");
const fs = require("fs");
const logger = require("./logger.js");
const InputDataDecoder = require("ethereum-input-data-decoder");

const ZERO = JSBI.BigInt(0);
const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
const Q128 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128));
const Q256 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(256));
const MIN_TICK = -887272;
const MAX_TICK = 887272;
const ETHEREUM_CHAIN_ID = 1;
function getTickAtSqrtRatio(sqrtPriceX96) {
  let tick = Math.floor(Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001));
  return tick;
}
// ERC20 json abi file
let ERC20Abi = fs.readFileSync("abis/ERC20.json");
const ERC20 = JSON.parse(ERC20Abi);

// V3 pool abi json file
let pool = fs.readFileSync("abis/UNIPOOLABI.json");
const IUniswapV3PoolABI = JSON.parse(pool);

// V3 factory abi json
let facto = fs.readFileSync("abis/UNIFACTORY.json");
const IUniswapV3FactoryABI = JSON.parse(facto);

// V3 NFT manager abi
let NFT = fs.readFileSync("abis/UniV3NFT.json");
const IUniswapV3NFTmanagerABI = JSON.parse(NFT);

let quoterAbi = fs.readFileSync("abis/QUOTER.json");
const IUniswapQuoterABI = JSON.parse(quoterAbi);

// if (process.env.ARB_RPC_URL === undefined) {
//   logger.error(
//     "Please set ARB_RPC_URL in your environment variables and try again"
//   );
//   process.exit(1);
// }

const arbitProvider = new ethers.providers.JsonRpcProvider(
  process.env.ARB_RPC_URL
);

const etherProvider = new ethers.providers.JsonRpcProvider(
  process.env.ETHER_RPC_URL
);
let provider;

// V3 standard addresses
if (
  process.env.FACTORY_ADDRESS === undefined ||
  process.env.NFTMANAGER_ADDRESS === undefined
) {
  logger.error(
    "Please set FACTORY_ADDRESS and NFTMANAGER_ADDRESS environment variables and try again"
  );
  process.exit(1);
}
const factory = process.env.FACTORY_ADDRESS;
const NFTmanager = process.env.NFTMANAGER_ADDRESS;
const quoter = process.env.QUOTER_CONTRACT_ADDRESS;

async function getData(position) {
  provider =
    position.chainId === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;

  var FactoryContract = new ethers.Contract(
    factory,
    IUniswapV3FactoryABI,
    provider
  );

  var NFTContract = new ethers.Contract(
    NFTmanager,
    IUniswapV3NFTmanagerABI,
    provider
  );

  var pos = await NFTContract.positions(position.id);
  var token0contract = new ethers.Contract(pos.token0, ERC20, provider);
  var token1contract = new ethers.Contract(pos.token1, ERC20, provider);
  var Decimal0 = await token0contract.decimals();
  var Decimal1 = await token1contract.decimals();

  var token0sym = await token0contract.symbol();
  var token1sym = await token1contract.symbol();

  var V3pool = await FactoryContract.getPool(pos.token0, pos.token1, pos.fee);

  var poolContract = new ethers.Contract(V3pool, IUniswapV3PoolABI, provider);

  var slot0 = await poolContract.slot0();

  var tickLow = await poolContract.ticks(pos.tickLower.toString());
  var tickHi = await poolContract.ticks(pos.tickUpper.toString());

  var feeGrowthGlobal0 = await poolContract.feeGrowthGlobal0X128();
  var feeGrowthGlobal1 = await poolContract.feeGrowthGlobal1X128();

  var pairName = token0sym + "/" + token1sym;

  var PositionInfo = {
    Pair: pairName,
    Decimal0: Decimal0,
    Decimal1: Decimal1,
    tickCurrent: slot0.tick,
    tickLow: pos.tickLower,
    tickHigh: pos.tickUpper,
    liquidity: pos.liquidity.toString(),
    feeGrowth0Low: tickLow.feeGrowthOutside0X128.toString(),
    feeGrowth0Hi: tickHi.feeGrowthOutside0X128.toString(),
    feeGrowth1Low: tickLow.feeGrowthOutside1X128.toString(),
    feeGrowth1Hi: tickHi.feeGrowthOutside1X128.toString(),
    feeGrowthInside0LastX128: pos.feeGrowthInside0LastX128.toString(),
    feeGrowthInside1LastX128: pos.feeGrowthInside1LastX128.toString(),
    feeGrowthGlobal0X128: feeGrowthGlobal0.toString(),
    feeGrowthGlobal1X128: feeGrowthGlobal1.toString(),
    sqrtPriceX96: slot0.sqrtPriceX96.toString(),
  };

  const [token0, token1, fee] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
  ]);

  // getQuote(token0, token1, fee, "100000", slot0.sqrtPriceX96.toString());
  getQuote(token0, token1, fee, "100000", 0);

  return PositionInfo;
}

function toBigNumber(numstr) {
  let bi = numstr;
  if (typeof sqrtRatio !== "bigint") {
    bi = JSBI.BigInt(numstr);
  }
  return bi;
}

function subIn256(x, y) {
  const difference = JSBI.subtract(x, y);

  if (JSBI.lessThan(difference, ZERO)) {
    return JSBI.add(Q256, difference);
  } else {
    return difference;
  }
}

async function getFees(
  feeGrowthGlobal0,
  feeGrowthGlobal1,
  feeGrowth0Low,
  feeGrowth0Hi,
  feeGrowthInside0,
  feeGrowth1Low,
  feeGrowth1Hi,
  feeGrowthInside1,
  liquidity,
  decimals0,
  decimals1,
  tickLower,
  tickUpper,
  tickCurrent
) {
  let feeGrowthGlobal_0 = toBigNumber(feeGrowthGlobal0);
  let feeGrowthGlobal_1 = toBigNumber(feeGrowthGlobal1);

  let tickLowerFeeGrowthOutside_0 = toBigNumber(feeGrowth0Low);
  let tickLowerFeeGrowthOutside_1 = toBigNumber(feeGrowth1Low);

  let tickUpperFeeGrowthOutside_0 = toBigNumber(feeGrowth0Hi);
  let tickUpperFeeGrowthOutside_1 = toBigNumber(feeGrowth1Hi);

  let tickLowerFeeGrowthBelow_0 = ZERO;
  let tickLowerFeeGrowthBelow_1 = ZERO;
  let tickUpperFeeGrowthAbove_0 = ZERO;
  let tickUpperFeeGrowthAbove_1 = ZERO;

  if (tickCurrent >= tickUpper) {
    tickUpperFeeGrowthAbove_0 = subIn256(
      feeGrowthGlobal_0,
      tickUpperFeeGrowthOutside_0
    );
    tickUpperFeeGrowthAbove_1 = subIn256(
      feeGrowthGlobal_1,
      tickUpperFeeGrowthOutside_1
    );
  } else {
    tickUpperFeeGrowthAbove_0 = tickUpperFeeGrowthOutside_0;
    tickUpperFeeGrowthAbove_1 = tickUpperFeeGrowthOutside_1;
  }

  if (tickCurrent >= tickLower) {
    tickLowerFeeGrowthBelow_0 = tickLowerFeeGrowthOutside_0;
    tickLowerFeeGrowthBelow_1 = tickLowerFeeGrowthOutside_1;
  } else {
    tickLowerFeeGrowthBelow_0 = subIn256(
      feeGrowthGlobal_0,
      tickLowerFeeGrowthOutside_0
    );
    tickLowerFeeGrowthBelow_1 = subIn256(
      feeGrowthGlobal_1,
      tickLowerFeeGrowthOutside_1
    );
  }

  let fr_t1_0 = subIn256(
    subIn256(feeGrowthGlobal_0, tickLowerFeeGrowthBelow_0),
    tickUpperFeeGrowthAbove_0
  );
  let fr_t1_1 = subIn256(
    subIn256(feeGrowthGlobal_1, tickLowerFeeGrowthBelow_1),
    tickUpperFeeGrowthAbove_1
  );

  let feeGrowthInsideLast_0 = toBigNumber(feeGrowthInside0);
  let feeGrowthInsideLast_1 = toBigNumber(feeGrowthInside1);

  let uncollectedFees_0 =
    (liquidity * subIn256(fr_t1_0, feeGrowthInsideLast_0)) / Q128;
  let uncollectedFees_1 =
    (liquidity * subIn256(fr_t1_1, feeGrowthInsideLast_1)) / Q128;

  let uncollectedFeesAdjusted_0 = (
    uncollectedFees_0 / toBigNumber(10 ** decimals0)
  ).toFixed(decimals0);
  let uncollectedFeesAdjusted_1 = (
    uncollectedFees_1 / toBigNumber(10 ** decimals1)
  ).toFixed(decimals1);

  const fees = {
    feesToken0: uncollectedFeesAdjusted_0,
    feesToken1: uncollectedFeesAdjusted_1,
  };

  return fees;
}

async function getPostionData(position) {
  var PositionInfo = await getData(position);

  const fees = await getFees(
    PositionInfo.feeGrowthGlobal0X128,
    PositionInfo.feeGrowthGlobal1X128,
    PositionInfo.feeGrowth0Low,
    PositionInfo.feeGrowth0Hi,
    PositionInfo.feeGrowthInside0LastX128,
    PositionInfo.feeGrowth1Low,
    PositionInfo.feeGrowth1Hi,
    PositionInfo.feeGrowthInside1LastX128,
    PositionInfo.liquidity,
    PositionInfo.Decimal0,
    PositionInfo.Decimal1,
    PositionInfo.tickLow,
    PositionInfo.tickHigh,
    PositionInfo.tickCurrent,
    PositionInfo.sqrtPriceX96
  );
  const pairRates = await calcPairRate(PositionInfo);
  [liquidityToken0, liquidityToken1] = await getTokenAmounts(
    PositionInfo.liquidity,
    PositionInfo.sqrtPriceX96,
    PositionInfo.tickLow,
    PositionInfo.tickHigh,
    PositionInfo.Decimal0,
    PositionInfo.Decimal1
  );
  const data = {
    feesToken0: fees.feesToken0,
    feesToken1: fees.feesToken1,
    priceToken0: pairRates.buyOneOfToken0,
    pair: PositionInfo.Pair,
    liquidityToken0: liquidityToken0,
    liquidityToken1: liquidityToken1,
    tickLeft: PositionInfo.tickLow,
    tickRight: PositionInfo.tickHigh,
    tickCurr: PositionInfo.tickCurrent,
  };

  return data;
}

async function calcPairRate(PositionInfo) {
  let sqrtPriceX96 = PositionInfo.sqrtPriceX96;
  let Decimal0 = PositionInfo.Decimal0;
  let Decimal1 = PositionInfo.Decimal1;

  const buyOneOfToken0 =
    (sqrtPriceX96 / 2 ** 96) ** 2 /
    (10 ** Decimal1 / 10 ** Decimal0).toFixed(Decimal1);

  const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(Decimal0);
  const buyOneOfToken0Wei = Math.floor(
    buyOneOfToken0 * 10 ** Decimal1
  ).toLocaleString("fullwide", { useGrouping: false });
  const buyOneOfToken1Wei = Math.floor(
    buyOneOfToken1 * 10 ** Decimal0
  ).toLocaleString("fullwide", { useGrouping: false });
  const pairRates = {
    buyOneOfToken0: buyOneOfToken0Wei,
    buyOneOfToken1: buyOneOfToken1Wei,
  };
  return pairRates;
}

const getQuote = async (token0, token1, fee, amountIn, sqrtPriceLimitX96) => {
  const quoterContract = new ethers.Contract(
    quoter,
    IUniswapQuoterABI,
    provider
  );

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    token0,
    token1,
    fee,
    amountIn,
    sqrtPriceLimitX96
  );
};

const getPoolexchangeRate = async (poolAddress, chain) => {
  provider =
    chain === ETHEREUM_CHAIN_ID ? await etherProvider : await arbitProvider;
  try {
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      provider
    );
    const PositionInfo = await poolContract.slot0();
    const sqrtPriceX96 = PositionInfo.sqrtPriceX96;
    const price = (sqrtPriceX96 / 2 ** 96) ** 2 * 10 ** 12;
    return price;
  } catch (err) {
    const providerName =
      provider?._network.name === "homestead"
        ? "ethereum"
        : provider._network.name;

    throw new Error(
      `error with retrive pool exchange rate for pool ${poolAddress} on provider ${providerName}`
    );
  }
};

const getCurrentBlockNumber = async (chain) => {
  provider = chain === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;
  const blockNumber = await provider.getBlockNumber();
  return blockNumber;
};

async function getTokenAmounts(
  liquidity,
  sqrtPriceX96,
  tickLow,
  tickHigh,
  Decimal0,
  Decimal1
) {
  let sqrtRatioA = Math.sqrt(1.0001 ** tickLow);
  let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh);

  let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
  let sqrtPrice = sqrtPriceX96 / Q96;

  let amount0wei = 0;
  let amount1wei = 0;
  if (currentTick <= tickLow) {
    amount0wei = Math.floor(
      liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
    );
  } else if (currentTick > tickHigh) {
    amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
  } else if (currentTick >= tickLow && currentTick < tickHigh) {
    amount0wei = Math.floor(
      liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
    );
    amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
  }

  let amount0Human = Math.abs(amount0wei / 10 ** Decimal0).toFixed(Decimal0);
  let amount1Human = Math.abs(amount1wei / 10 ** Decimal1).toFixed(Decimal1);
  return [amount0Human, amount1Human];
}

// use for reading the input params of the transaction
const decoder = new InputDataDecoder("abis/UniV3NFT.json");

const loadPositionInitDataByTxHash = async (txhash, position) => {
  provider =
    position.chainId === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;
  try {
    const block = await provider.getTransaction(txhash);

    const blockTimestemp =
      (await provider.getBlock(block.blockNumber)).timestamp * 1000;
    const txDesc = await provider.getTransaction(txhash).then(async (tx) => {
      return await new ethers.utils.Interface(
        IUniswapV3NFTmanagerABI
      ).parseTransaction(tx);
    });
    const resultArgs = decoder.decodeData(txDesc.args[0][0]);
    const token0Name = await new ethers.Contract(
      resultArgs.inputs[0][0],
      ERC20,
      provider
    ).symbol();
    const token1Name = await new ethers.Contract(
      resultArgs.inputs[0][1],
      ERC20,
      provider
    ).symbol();
    const [token0symbol, token1symbol] = fixSymbolBinanceConvention(
      token0Name,
      token1Name
    );
    //inputs keys names: token0address,token1address,fee,tickLower,tickUpper,amount0Desired,amount1Desired,amount0Min,amount1Min,recipient
    const initData = {
      token0address: resultArgs.inputs[0][0],
      token0symbol,
      token1symbol,
      token1address: resultArgs.inputs[0][1],
      fee: resultArgs.inputs[0][2],
      //ONLY IN ARBIT sqrtPriceX96: ethers.utils.formatEther(resultArgs.inputs[3]),
      //tickLower: resultArgs.inputs[0][3],
      tickUpper: resultArgs.inputs[0][4],
      amount0Desired: ethers.utils.formatEther(resultArgs.inputs[0][5]),
      initValueToken0:
        ethers.utils.formatEther(resultArgs.inputs[0][5]) * 10 ** 6,
      amount1Desired: ethers.utils.formatUnits(resultArgs.inputs[0][6]),
      initValueToken1: ethers.utils.formatUnits(resultArgs.inputs[0][6]),
      amount0Min: ethers.utils.formatEther(resultArgs.inputs[0][7]),
      amount1Min: ethers.utils.formatEther(resultArgs.inputs[0][8]),
      recipient: resultArgs.inputs[0][9],
      blockNumber: block.blockNumber,
      blockTimestemp,
    };

    return initData;
  } catch (err) {
    logger.error("error with retrive data for TX", err);
    return;
  }
};

const fixSymbolBinanceConvention = (token0symbol, token1symbol) => {
  let token0symbolFixed, token1symbolFixed; // = USDT

  token0symbolFixed =
    token0symbol.charAt(0) === "W" ? token0symbol.slice(1) : token0symbol;
  token1symbolFixed =
    token1symbol.charAt(0) === "W" ? token1symbol.slice(1) : token1symbol;

  return [token0symbolFixed, token1symbolFixed];
};

module.exports = {
  getPostionData,
  getPoolexchangeRate,
  getCurrentBlockNumber,
  getTickAtSqrtRatio,
  loadPositionInitDataByTxHash,
};
