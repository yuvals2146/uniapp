

const poolAboveTreshold = (value, treshold,poolId) => `the value ${value} is above the treshold ${treshold} for pool ${poolId}`
const poolBelowTreshold = (value, treshold,poolId) => `the value ${value} is below the treshold ${treshold} for pool ${poolId}`
const USDCIsBelowTreshold = (treshold) => `the USDC token is above the treshold ${treshold}`

module.exports = {
    poolAboveTreshold,
    poolBelowTreshold,
    USDCIsBelowTreshold
}