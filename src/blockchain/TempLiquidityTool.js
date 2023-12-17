const { FeeAmount, computePoolAddress } = require("@uniswap/v3-sdk");
const { ethers } = require("ethers");
const { ChainId, Token } = require("@uniswap/sdk-core");
const fs = require("fs");
const JSBI = require("jsbi");
const { TickMath } = require("@uniswap/v3-sdk");
const { createCanvas } = require("canvas");
const Chart = require("chart.js/auto");
const { spawn } = require("child_process");

const IUniswapV3PoolABI = JSON.parse(fs.readFileSync("abis/UNIPOOLABI.json"));
const etherProvider = new ethers.providers.JsonRpcProvider(
  process.env.ETHER_RPC_URL
);

const WETHOnMainnet = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDCOnMainnet = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));

const getPoolTest = async (chain) => {
  const TOKEN0 = new Token(ChainId.MAINNET, USDCOnMainnet, 6, "USDC", "USD//C");

  const TOKEN1 = new Token(
    ChainId.MAINNET,
    WETHOnMainnet,
    18,
    "WETH",
    "Wrapped Ether"
  );

  const CurrentConfig = {
    tokens: {
      token0: TOKEN0,
      token1: TOKEN1,
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
  const currLiquidity = await poolContract.liquidity();
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
    TickMath.MAX_TICK,
    "Current liquidity:",
    currLiquidity.toString()
  );

  const currTickRounded = Math.floor(currTick / tickSpacing) * tickSpacing;
  MIN_TICK = -50;
  MAX_TICK = 50;

  // change to tick liquidity for rounded tick
  var prevTickLiquidity = JSBI.BigInt(currLiquidity);
  // var liquidityNetAtTick = parseInt(currLiquidity);
  var liquidityAtTickMap = new Map();
  liquidityAtTickMap.set(currTickRounded, prevTickLiquidity);

  var tempTickRoundedAddress = currTickRounded;
  var liquidityAtTick, tempTickRoundedData;
  for (let i = 1; i < MAX_TICK; i++) {
    tempTickRoundedAddress += tickSpacing;
    tempTickRoundedData = await poolContract.ticks(tempTickRoundedAddress);
    liquidityAtTick = JSBI.add(
      prevTickLiquidity,
      JSBI.BigInt(tempTickRoundedData.liquidityNet)
    );
    liquidityAtTickMap.set(tempTickRoundedAddress, liquidityAtTick);
    prevTickLiquidity = liquidityAtTick;
  }
  tempTickRoundedAddress = currTickRounded;
  prevTickLiquidity = JSBI.BigInt(currLiquidity);
  for (let i = -1; i >= MIN_TICK; i--) {
    tempTickRoundedData = await poolContract.ticks(tempTickRoundedAddress);
    liquidityAtTick = JSBI.subtract(
      prevTickLiquidity,
      JSBI.BigInt(tempTickRoundedData.liquidityNet)
    );
    tempTickRoundedAddress -= tickSpacing;
    liquidityAtTickMap.set(tempTickRoundedAddress, liquidityAtTick);
    prevTickLiquidity = liquidityAtTick;
  }

  // for the bar graph, map price=>liquidity
  var liquidityAtPrice = new Map();
  // Extract and sort the keys
  const sortedKeys = [...liquidityAtTickMap.keys()].sort();
  for (const key of sortedKeys) {
    var sqrtRatioAtTickX96 = TickMath.getSqrtRatioAtTick(
      parseInt(key),
      tickSpacing
    );

    const buyOneOfToken0 =
      (sqrtRatioAtTickX96 / Q96) ** 2 /
      (
        10 **
        (CurrentConfig.tokens.token1.decimals -
          CurrentConfig.tokens.token0.decimals)
      ).toFixed(CurrentConfig.tokens.token1.decimals);
    const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(
      CurrentConfig.tokens.token0.decimals
    );

    liquidityAtTick = liquidityAtTickMap.get(key);
    tokenAmountsAtTickRange = await getTokenAmounts(
      liquidityAtTick,
      sqrtRatioAtTickX96,
      currTickRounded,
      currTickRounded + tickSpacing,
      CurrentConfig.tokens.token0.decimals,
      CurrentConfig.tokens.token1.decimals
    );

    console.log(
      "Tick",
      key,
      ":",
      liquidityAtTick,
      "\nPrice of ",
      TOKEN0.symbol,
      "in ",
      TOKEN1.symbol,
      "terms:",
      buyOneOfToken0,
      "Price of ",
      TOKEN1.symbol,
      "in ",
      TOKEN0.symbol,
      "terms:",
      buyOneOfToken1,
      "\nLiquidity in Token0:",
      tokenAmountsAtTickRange[0],
      "Liquidity in Token1:",
      tokenAmountsAtTickRange[1]
    );
    const tolerance = 1e-6;
    if (tokenAmountsAtTickRange[0] < tolerance)
      liquidityUSDC = tokenAmountsAtTickRange[1] / buyOneOfToken0;
    else liquidityUSDC = tokenAmountsAtTickRange[0];

    liquidityAtPrice.set(buyOneOfToken1, liquidityUSDC);
  }

  if (process.env.NODE_ENV != "ci-test") {
    // Convert the Map to an array of key-value pairs
    const sortedEntries = [...liquidityAtPrice.entries()];

    // Sort the array by keys (assuming keys are numeric)
    sortedEntries.sort((a, b) => a[0] - b[0]);

    // Extract the sorted keys and values into separate arrays
    const labels = sortedEntries.map((entry) => entry[0]);
    const data = sortedEntries.map((entry) => entry[1]);

    // Create a canvas
    const canvas = createCanvas(400, 200);
    const ctx = canvas.getContext("2d");

    // Configuration for the bar graph
    const config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Liquidity at Price",
            data: data,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Price",
            },
          },
          y: {
            title: {
              display: true,
              text: "Liquidity",
            },
          },
        },
      },
    };

    // Create a chart instance
    const chart = new Chart(ctx, config);

    const stream = chart.canvas.createPNGStream();
    const out = fs.createWriteStream("chart.png");
    stream.pipe(out);
    out.on("finish", () => {
      // Open the PNG file with the default viewer
      const viewer = spawn("open", ["chart.png"]);
      viewer.on("close", (code) => {
        if (code === 0) {
          console.log("PNG file opened successfully.");
        } else {
          console.error("Error opening PNG file.");
        }
      });
    });
  }
};

const getTokenAmounts = async (
  liquidity,
  sqrtPriceX96,
  tickLow,
  tickHigh,
  token0Decimal,
  token1Decimal
) => {
  let sqrtRatioA = Math.sqrt(1.0001 ** tickLow).toFixed(18);
  let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh).toFixed(18);
  let currentTick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);
  console.log(
    "\nTicks current,low,high:",
    currentTick,
    ",",
    tickLow,
    ",",
    tickHigh,
    ",",
    "liq at tick",
    liquidity.toString()
  );
  // let sqrtPrice = sqrtPriceX96 / Q96;
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
    // amount0wei = Math.floor(
    //   liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
    // );
    amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
  }

  let amount0Human = (amount0wei / 10 ** token0Decimal).toFixed(token0Decimal);
  let amount1Human = (amount1wei / 10 ** token1Decimal).toFixed(token1Decimal);

  return [amount0Human, amount1Human];
};

module.exports = { getPoolTest };
