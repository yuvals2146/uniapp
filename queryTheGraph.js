const axios = require("axios");
const logger = require("./logger.js");
const { chains } = require("./chains.js");

const queryTheGraph = async (poolId) => {
  try {
    const result = await axios.post(arbitrumUniswapURL, {
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
    // result result.data.data.position keys:
    //  feesToken0,feesToken1, priceToken0, priceToken1, token0.symbol,token1.symbol, liquidity
  } catch (err) {
    logger.error("error in graph", err);
  }
};

const queryTheGraphForMintTransactHash = async (position) => {
  try {
    const result = await axios.post(chains[position.chain].subGraph, {
      query: `
      {
        position(id:${position.id}) {
          id
          transaction{
            mints(first: 5){
              id
            }
          }
        }
      }
      
    `,
    });

    const txHash =
      result.data.data.position.transaction.mints[0].id.split("#")[0];
    return txHash;
  } catch (err) {
    logger.error("error in graph", err);
    logger.error("error in graph - get mint TX", err);
  }
};

module.exports = {
  queryTheGraph,
  queryTheGraphForMintTransactHash,
};
