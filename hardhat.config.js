require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: 'goerli',
  networks: {
    hardhat: {},
    goerli: {
      url: `${process.env.NEXT_PUBLIC_ALCHEMY_API}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`]
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 40000
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`
  }
}