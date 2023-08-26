const axios = require("axios");
uniswapURL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const queryTheGraph = async (poolId) => {
  try {
    const result = await axios.post(uniswapURL, {
      // add block: {number:17584316}
      query: `
      {
        position(id:${poolId}) {
          id
          collectedFeesToken0
          collectedFeesToken1
          pool {
            token0Price
            token1Price
            sqrtPrice
          }
          
          liquidity
          token0 {
            id
            symbol
          }
          token1
          {
            id
            symbol
          }
        }
      }          
      `,
    });
    const res = {
      feesToken0: result.data.data.position.collectedFeesToken0,
      feesToken1: result.data.data.position.collectedFeesToken1,
      priceToken0: result.data.data.position.pool.token0Price,
      priceToken1: result.data.data.position.pool.token1Price,
      pair:
        result.data.data.position.token0.symbol +
        "/" +
        result.data.data.position.token1.symbol,
      liquidity: result.data.data.position.liquidity,
    };
    return res;
  } catch (err) {
    logger.error("error in graph", err);
  }
};

module.exports = {
  queryTheGraph,
};
