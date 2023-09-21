const chains = {
  1: {
    name: "ethereum",
    RPC: process.env.ETHER_RPC_URL,
    subGraph: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  },
  42161: {
    name: "arbitrum",
    RPC: process.env.ARB_RPC_URL,
  },
};

chainsNames = {
  ethereum: 1,
  arbitrum: 42161,
};

module.exports = {
  chains,
  chainsNames,
};
