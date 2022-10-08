const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../scripts/whitelist.js')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
import { config } from '../dapp.config'

// get the contract instance
const contract = require('../artifacts/contracts/Patika.sol/Patika.json')
// get the contract abi and address
const nftContract = new web3.eth.Contract(contract.abi, config.contractAddress)

// calculate merkle root from the whitelist array
const leafNodes = whitelist.map((addr) => keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const root = merkleTree.getRoot()

// get the total minted supply
export const getTotalMinted = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

// get max supply
export const getMaxSupply = async () => {
  const maxSupply = await nftContract.methods.MAX_SUPPLY().call()
  return maxSupply
}

// get is paused status
export const isPausedState = async () => {
  const paused = await nftContract.methods.paused().call()
  return paused
}

// get is public sale  status
export const isPublicSaleState = async () => {
  const publicSale = await nftContract.methods.publicSale().call()
  return publicSale
}

// get is pre sale  status (only for whitelisted users)
export const isPreSaleState = async () => {
  const preSale = await nftContract.methods.allowListSale().call()
  return preSale
}

// get price
export const getPrice = async () => {
  const price = await nftContract.methods.price().call()
  return price
}

// pre sale mint
export const allowListMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) { // check if wallet is connected
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  // get the proof for the address
  const leaf = keccak256(window.ethereum.selectedAddress)
  const proof = merkleTree.getHexProof(leaf)

  // Verify Merkle Proof
  // verifyProof(proof, leaf, root)
  const isValid = merkleTree.verify(proof, leaf, root)

  if (!isValid) {
    return {
      success: false,
      status: 'You are not on the whitelist'
    }
  }

  // get transaction count of the sender address to make the next valid nonce for the transaction
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * mintAmount), 'ether')
    ).toString(16), // hex
    data: nftContract.methods
      .allowListMint(proof)
      .encodeABI(),
    nonce: nonce.toString(16)
  }

  // send the transaction
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    // wait for the transaction to be mined
    return {
      success: true,
      status: (
        <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank">
          <p>View transaction on Etherscan: </p>
          <p>{`https://goerli.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: 'Please try again: ' + error.message
    }
  }
}

// public sale mint
export const publicMint = async (mintAmount) => {
  if (!window.ethereum.selectedAddress) { // check if wallet is connected
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )

  // Set up our Ethereum transaction
  const tx = {
    to: config.contractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * mintAmount), 'ether')
    ).toString(16), // hex
    data: nftContract.methods.publicMint(mintAmount).encodeABI(),
    nonce: nonce.toString(16)
  }

  // send the transaction
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    // wait for the transaction to be mined
    return {
      success: true,
      status: (
        <a href={`https://goerli.etherscan.io/tx/${txHash}`} target="_blank">
          <p>View transaction on Etherscan: </p>
          <p>{`https://goerli.etherscan.io/tx/${txHash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status:
        `Please try again: ` + error.message
    }
  }
}
