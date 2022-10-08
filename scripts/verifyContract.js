/**
 *  This script will calculate the constructor arguments for the `verify` function and call it.
 *  You can use this script to verify the contract on etherscan.io.
 */

require('@nomiclabs/hardhat-etherscan')
const hre = require('hardhat')

async function main() {

  await hre.run('verify:verify', {
    address: '0xbcf56495D08b453C518e14Db8d7Fb66B83565f28', // Deployed contract address
    constructorArguments: [],
    contract: "contracts/Patika.sol:Patika" // Path to the contract
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })