require("dotenv").config();
const { JSBI } = require("@uniswap/sdk");
const { ethers } = require("ethers");
const fs = require("fs");
const logger = require("../utils/logger.js");
const InputDataDecoder = require("ethereum-input-data-decoder");
const { fetchHistoricalPriceData } = require("../lib/binance.js");
const {
  queryTheGraphForMintTransactHash,
} = require("../utils/queryTheGraph.js");
const { chains } = require("../utils/chains.js");

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

async function getPositionJson(positionId, provider) {
  var NFTContract = new ethers.Contract(
    NFTmanager,
    IUniswapV3NFTmanagerABI,
    provider
  );

  var pos = await NFTContract.positions(positionId);
  return pos;
}

async function getData(position) {
  const provider =
    position.chainId === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;

  var FactoryContract = new ethers.Contract(
    factory,
    IUniswapV3FactoryABI,
    provider
  );

  const pos = await getPositionJson(position.id, provider);

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
  getQuote(token0, token1, fee, "100000", 0, position.chainId);

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

const positionKeyValidate = (position) => {
  // input validation
  if (!chains[position.chainId])
    throw new Error(`not valid chain id ${position.chainId}`);
  if (!position.id || position.id < 0 || typeof position.id !== "number")
    throw new Error("not valid position id or not exist");
};

async function getPositionData(position) {
  try {
    positionKeyValidate(position);
  } catch (err) {
    throw new Error(err.message);
  }
  try {
    var positionInfo = await getData(position);
  } catch (err) {
    throw new Error(
      `could not get data for position ${position.id} on chain ${
        chains[position.chainId].name
      } \n reason: ${err.message}`
    );
  }

  const fees = await getFees(
    positionInfo.feeGrowthGlobal0X128,
    positionInfo.feeGrowthGlobal1X128,
    positionInfo.feeGrowth0Low,
    positionInfo.feeGrowth0Hi,
    positionInfo.feeGrowthInside0LastX128,
    positionInfo.feeGrowth1Low,
    positionInfo.feeGrowth1Hi,
    positionInfo.feeGrowthInside1LastX128,
    positionInfo.liquidity,
    positionInfo.Decimal0,
    positionInfo.Decimal1,
    positionInfo.tickLow,
    positionInfo.tickHigh,
    positionInfo.tickCurrent,
    positionInfo.sqrtPriceX96
  );

  const pairRates = await calcPairRate(positionInfo);
  [liquidityToken0, liquidityToken1] = await getTokenAmounts(
    positionInfo.liquidity,
    positionInfo.sqrtPriceX96,
    positionInfo.tickLow,
    positionInfo.tickHigh,
    positionInfo.Decimal0,
    positionInfo.Decimal1
  );
  const data = {
    feesToken0: fees.feesToken0,
    feesToken1: fees.feesToken1,
    priceToken0: pairRates.buyOneOfToken0,
    pair: positionInfo.Pair,
    liquidityToken0: liquidityToken0,
    liquidityToken1: liquidityToken1,
    tickLeft: positionInfo.tickLow,
    tickRight: positionInfo.tickHigh,
    tickCurr: positionInfo.tickCurrent,
    sqrtPriceX96: positionInfo.sqrtPriceX96,
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

const getQuote = async (
  token0,
  token1,
  fee,
  amountIn,
  sqrtPriceLimitX96,
  chain
) => {
  const provider = chain === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;
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

const getPoolExchangeRate = async (position, index) => {
  const provider =
    position.chainId === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;
  if (index !== 0 && index !== 1) throw new Error("index must be 0 or 1");
  const contractAddrUSDC =
    position.chainId === ETHEREUM_CHAIN_ID
      ? process.env.USDC_TOKEN_TRACKER_ADDRESS_ETH
      : process.env.USDC_TOKEN_TRACKER_ADDRESS_ARB;

  var FactoryContract = new ethers.Contract(
    factory,
    IUniswapV3FactoryABI,
    provider
  );

  const pos = await getPositionJson(position.id, provider);
  const fromTokenContract = index === 0 ? pos.token0 : pos.token1;
  if (fromTokenContract === contractAddrUSDC)
    throw new Error("cannot get pool exchange rate for token USDC or USDT");

  let poolAddress = await FactoryContract.getPool(
    fromTokenContract,
    contractAddrUSDC,
    pos.fee
  );
  try {
    const poolContract = new ethers.Contract(
      poolAddress,
      IUniswapV3PoolABI,
      provider
    );
    const PositionInfo = await poolContract.slot0();

    const sqrtPriceX96 = PositionInfo.sqrtPriceX96;

    const price = (sqrtPriceX96 / 2 ** 96) ** 2;
    const poolToken0ContractAddr = await poolContract.token0();
    return poolToken0ContractAddr === contractAddrUSDC
      ? (1 / price) * 10 ** 12
      : price * 10 ** 12;
  } catch (err) {
    const providerName =
      provider?._network.name === "homestead"
        ? "ethereum"
        : provider._network.name;
    throw new Error(
      `Error while retrieving pool exchange rate for pool ${poolAddress} on provider ${providerName}`
    );
  }
};

const getCurrentBlockNumber = async (chain) => {
  if (!chains[chain]) throw new Error(`not valid chain id ${chain}`);
  const provider = chain === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;

  try {
    return await provider.getBlockNumber();
  } catch (err) {
    throw new Error(
      `error with retrive current block number for chain ${chain}`
    );
  }
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
  const provider =
    position.chain === ETHEREUM_CHAIN_ID ? etherProvider : arbitProvider;

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
    const [token0symbol, token1symbol] = fixTokensSymbol(
      token0Name,
      token1Name
    );

    const multiplier0 =
      token0symbol === "USDC" || token0symbol === "USDT" ? 10 ** 12 : 1;
    const multiplier1 =
      token1symbol === "USDC" || token1symbol === "USDT" ? 10 ** 12 : 1;

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
        ethers.utils.formatEther(resultArgs.inputs[0][5]) * multiplier0,
      amount1Desired: ethers.utils.formatUnits(resultArgs.inputs[0][6]),
      initValueToken1:
        ethers.utils.formatUnits(resultArgs.inputs[0][6]) * multiplier1,
      amount0Min: ethers.utils.formatEther(resultArgs.inputs[0][7]),
      amount1Min: ethers.utils.formatEther(resultArgs.inputs[0][8]),
      recipient: resultArgs.inputs[0][9],
      blockNumber: block.blockNumber,
      blockTimestemp,
    };

    return initData;
  } catch (err) {
    logger.error(
      `error with retrive data to TX 0x...${txhash.slice(-6, -1)} for token ${
        position.id
      } on ${chains[position.chain].name}`
    );
  }
};

const fixTokensSymbol = (token0symbol, token1symbol) => {
  let token0symbolFixed, token1symbolFixed; // = USDT

  token0symbolFixed =
    token0symbol.charAt(0) === "W" ? token0symbol.slice(1) : token0symbol;
  token1symbolFixed =
    token1symbol.charAt(0) === "W" ? token1symbol.slice(1) : token1symbol;

  return [token0symbolFixed, token1symbolFixed];
};

// new position - get data online
const retrieveInitalPositionData = async (position, txHash = null) => {
  // load position from mint txHash
  let initData;
  let tx;
  try {
    tx = txHash ? txHash : await queryTheGraphForMintTransactHash(position);

    initData = await loadPositionInitDataByTxHash(tx, position);
    if (!initData) throw new Error("no init data found");
    const [initToken0USDRate, initToken1USDRate] =
      await fetchHistoricalPriceData(
        initData.token0symbol,
        initData.token1symbol,
        initData.blockTimestemp
      );
    initData.initToken0USDRate = initToken0USDRate;
    initData.initToken1USDRate = initToken1USDRate;
  } catch (e) {
    if (!initData) {
      if (tx)
        throw new Error(
          `No tx hash found for position ${position.id} on chain ${
            chains[position.chain].name
          }`
        );
      else {
        throw new Error(
          `No inital data found for position ${position.id} on chain ${
            chains[position.chain].name
          }`
        );
      }
    } else {
      throw new Error(
        `could not get historical initial data found for position ${
          position.id
        } on chain ${chains[position.chain].name} reason: ${e.message}`
      );
    }
  }
  return initData;
};

module.exports = {
  getPositionData,
  getPoolExchangeRate,
  getCurrentBlockNumber,
  loadPositionInitDataByTxHash,
  retrieveInitalPositionData,
};
