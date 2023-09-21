const { FeeAmount, computePoolAddress } = require("@uniswap/v3-sdk");
const { ethers, BigNumber } = require("ethers");
const { SupportedChainId, Token } = require("@uniswap/sdk-core");
const fs = require("fs");
const JSBI = require("jsbi");
const { TickMath } = require("@uniswap/v3-sdk");

const IUniswapV3PoolABI = JSON.parse(fs.readFileSync("abis/UNIPOOLABI.json"));
const etherProvider = new ethers.providers.JsonRpcProvider(
  process.env.ETHER_RPC_URL
);

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

const getPoolTest = async (chain) => {
  const WETH_TOKEN = new Token(
    SupportedChainId.MAINNET,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    18,
    "WETH",
    "Wrapped Ether"
  );

  const USDC_TOKEN = new Token(
    SupportedChainId.MAINNET,
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    6,
    "USDC",
    "USD//C"
  );

  const CurrentConfig = {
    tokens: {
      token0: USDC_TOKEN,
      token1: WETH_TOKEN,
      poolFee: FeeAmount.LOW,
    },
  };

  const currentPoolAddress = computePoolAddress({
    factoryAddress: process.env.FACTORY_ADDRESS,
    tokenA: CurrentConfig.tokens.token0,
    tokenB: CurrentConfig.tokens.token1,
    fee: CurrentConfig.tokens.poolFee,
  });

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI,
    etherProvider
  );
  const slot0 = await poolContract.slot0();

  const tickSpacing = await poolContract.tickSpacing();
  currTick = slot0[1];

  console.log(
    "\n\nLittle Test: USDC-WETH pool on Ethereum is at Address:",
    currentPoolAddress,
    "Current tick:",
    currTick,
    "Tick min:",
    TickMath.MIN_TICK,
    "Tick max:",
    TickMath.MAX_TICK
  );

  currTickRounded = Math.floor(currTick / tickSpacing) * tickSpacing;
  currTickRounded = currTickRounded - tickSpacing;
  currTick = currTick - tickSpacing;

  for (let i = 0; i < 3; i++) {
    tick = await poolContract.ticks(currTickRounded);
    sqrtRatioAtTickX96 = TickMath.getSqrtRatioAtTick(currTick, tickSpacing);
    const sqrtRatioX96BN = slot0[0];
    const sqrtRatioX96BI =
      currTick === slot0[1]
        ? JSBI.BigInt(sqrtRatioX96BN.toString())
        : sqrtRatioAtTickX96;
    const buyOneOfToken0 =
      (sqrtRatioX96BI / Q96) ** 2 /
      (
        10 ** CurrentConfig.tokens.token1.decimals /
        10 ** CurrentConfig.tokens.token0.decimals
      ).toFixed(CurrentConfig.tokens.token1.decimals);
    const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(
      CurrentConfig.tokens.token0.decimals
    );
    const buyOneOfToken0Wei = Math.floor(
      buyOneOfToken0 * 10 ** CurrentConfig.tokens.token1.decimals
    ).toLocaleString("fullwide", { useGrouping: false });
    const buyOneOfToken1Wei = Math.floor(
      buyOneOfToken1 * 10 ** CurrentConfig.tokens.token0.decimals
    ).toLocaleString("fullwide", { useGrouping: false });

    tokenAmountsAtTickRange = await getTokenAmounts(
      tick.liquidityNet,
      sqrtRatioX96BI,
      currTickRounded,
      currTickRounded + tickSpacing,
      (i - 1) * tickSpacing,
      CurrentConfig.tokens.token0.decimals,
      CurrentConfig.tokens.token1.decimals
    );

    console.log(
      "\nIteration:",
      i,
      "Current tick:",
      currTick,
      "Current tick rounded:",
      currTickRounded,
      "sqrtRatioX96 at tick:",
      sqrtRatioAtTickX96.toString(),
      "sqrtRatioX96 at slot0:",
      sqrtRatioX96BI.toString(),
      "\nPrice of Token0 in Token1 terms",
      buyOneOfToken0,
      "Price of Token1 in Token0 terms",
      buyOneOfToken1,
      "\nLiquidity:",
      BigInt(tick.liquidityGross).toString(),
      "Liquidity in Token0:",
      tokenAmountsAtTickRange[0],
      "Liquidity in Token1:",
      tokenAmountsAtTickRange[1]
    );
    currTick += tickSpacing;
    currTickRounded += tickSpacing;
  }
};

const getTokenAmounts = async (
  liquidity,
  sqrtPriceX96,
  tickLow,
  tickHigh,
  delta,
  token0Decimal,
  token1Decimal
) => {
  let sqrtRatioA = Math.sqrt(1.0001 ** tickLow).toFixed(18);
  let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh).toFixed(18);
  let currentTick = TickMath.getTickAtSqrtRatio(sqrtPriceX96) + delta;
  console.log(
    "\n\ngetTokenAmounts:",
    currentTick,
    tickLow,
    tickHigh,
    "liq at tick",
    TickMath.getTickAtSqrtRatio(sqrtPriceX96),
    "delta:",
    delta
  );
  let sqrtPrice = sqrtPriceX96 / Q96;
  let amount0wei = 0;
  let amount1wei = 0;
  if (currentTick < tickLow) {
    amount0wei = Math.floor(
      liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
    );
  }
  if (currentTick >= tickHigh) {
    amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
  }
  if (currentTick >= tickLow && currentTick < tickHigh) {
    amount0wei = Math.floor(
      liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
    );
    amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
  }

  let amount0Human = (amount0wei / 10 ** token0Decimal).toFixed(token0Decimal);
  let amount1Human = (amount1wei / 10 ** token1Decimal).toFixed(token1Decimal);

  // console.log("Amount Token0 wei: " + amount0wei);
  // console.log("Amount Token1 wei: " + amount1wei);
  // console.log("Amount Token0 : " + amount0Human);
  // console.log("Amount Token1 : " + amount1Human);
  return [amount0Human, amount1Human];
};

module.exports = { getPoolTest };
