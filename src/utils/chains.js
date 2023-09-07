const chains = {
  1: {
    name: "etherum",
    RPC: process.env.ETHER_RPC_URL,
    subGraph: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  },
  42161: {
    name: "arbitrum",
    RPC: process.env.ARB_RPC_URL,
  },
};

chainsNames = {
  etherum: 1,
  arbitrum: 42161,
};

module.exports = {
  chains,
  chainsNames,
};
