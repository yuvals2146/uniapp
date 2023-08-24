const chains = {
  1: {
    name: "etherum",
    RPC: process.env.ETHER_RPC_URL,
    subGraph: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  },
  42161: {
    name: "arbitrum",
    RPC: process.env.ARB_RPC_URL,
    subGraph:
      "https://gateway-arbitrum.network.thegraph.com/api/bb1d7db189c33229a9e60e21afc93eff/subgraphs/id/HUZDsRpEVP2AvzDCyzDHtdc64dyDxx8FQjzsmqSg4H3B",
  },
};

module.exports = {
  chains,
};
