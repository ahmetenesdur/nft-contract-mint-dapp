/**
 *  This script will calculate the constructor arguments for BoredApe.sol and deploy it.
 *  After deploying, you can access the contract on etherscan.io with the deployed contract address.
 */

const hre = require('hardhat')

async function main() {

  // Deploy the contract
  const Contract = await hre.ethers.getContractFactory('Patika') // Path to the contract
  const contracT = await Contract.deploy()

  await contracT.deployed()

  console.log('Contract deployed to:', contracT.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })