# Akbank Web3 Practicum Final Case
## NFT Minting dApp

This project is a decentralized application that allows users to mint NFTs. The project is built using the following technologies:

React, NextJS, TailwindCSS, Solidity, Hardhat, web3.js, Alchemy API, IPFS, Etherscan, and Metamask.

To see the project in action, visit the following link:

[![vercel](https://img.shields.io/badge/vercel-230?style=for-the-badge&logo=vercel&logoColor=white)](https://nft-contract-mint-app.vercel.app/)

## Quick start

Clone the repo:

```bash
git clone https://github.com/ahmetenesdur/nft-contract-mint-app.git
```

Navigate to the project directory:

```bash
cd nft-contract-mint-app
```

Install the dependencies:

```bash
npm install
# or
yarn install
```


Start the development server:

```bash
npm run dev
# or
yarn dev
```

## User Guide

Change the .env variables. Update the `dapp.config.js` file according to your needs.

.env file:
```bash
NEXT_PUBLIC_ALCHEMY_API=
NEXT_PUBLIC_BLOCKNATIVE_API=
METAMASK_PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

If you want to make changes to the Patika smart contract, you can find Patika.sol in the `/contracts` folder. Remove `/artifacts` folder. After making the changes, recompile your smart contract using the `npx hardhat compile` command.

You need to update the `scripts/whitelist.js` file with your whitelisted user accounts and deploy and verify your smart contract on the blockchain. For this, you can find the _deploy_ & _verify_ scripts in the `/scripts` folder. You can run these scripts using the commands `npx hardhat run scripts/deployContract.js` and `npx hardhat run scripts/verifyContract.js`.

If you want to use a different network, change the Alchemy API. Make sure you configure it in the `hardhat.config.js` file. You can find the Configuration [here](https://hardhat.org/config/#networks-configuration).

```bash
  networks: {
    hardhat: {},
    goerli: {
      url: `${process.env.NEXT_PUBLIC_ALCHEMY_API}`,
      accounts: [`0x${process.env.METAMASK_PRIVATE_KEY}`]
    }
  },
```

Update the `/utils/interact.js` file to use the relevant functions from your updated contract. Replace the contract address in this file and the imported ABI with your distributed contract. You can find the ABI in the `/artifacts/contracts/Patika.sol/Patika.json` file.

## Screenshots

![dApp Screenshot](https://i.imgur.com/NhMEBCW.png)
![dApp Screenshot](https://i.imgur.com/ge6KDs8.png)