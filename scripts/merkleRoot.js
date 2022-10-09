const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const ethers = require('ethers');
const whitelist = require('./whitelist.js')

  // calculate merkle root from the whitelist array.
  const leafNodes = whitelist.map((addr) => ethers.utils.solidityKeccak256(addr))
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
  const root = merkleTree.getHexRoot()

  console.log('Merkle Hash:', root)