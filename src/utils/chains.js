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
  10: {
    name: "optimism",
    RPC: process.env.OP_RPC_URL,
    // subGraph: "https://thegraph.com/hosted-service/subgraph/messari/uniswap-v3-optimism",
  },
};

chainsNames = {
  ethereum: 1,
  arbitrum: 42161,
  optimism: 10,
};

module.exports = {
  chains,
  chainsNames,
};
