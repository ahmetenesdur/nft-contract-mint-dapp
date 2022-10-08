import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseModule from '@web3-onboard/coinbase'

import blocknativeLogo from '../icon'
import blocknativeIcon from '../icon'

const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL

const injected = injectedModule()
const walletConnect = walletConnectModule()
const coinbaseWallet = coinbaseModule()

const initOnboard = init({
  wallets: [walletConnect, coinbaseWallet, injected],
  chains: [
    // {
    //   id: '0x1',
    //   token: 'ETH',
    //   label: 'Ethereum Mainnet',
    //   rpcUrl: RPC_URL
    // },
    {
      id: '0x5',
      token: 'gETH',
      label: 'Görli Testnet',
      rpcUrl: RPC_URL,
    }
    // {
    //   id: '0x89',
    //   token: 'MATIC',
    //   label: 'Matic Mainnet',
    //   rpcUrl: RPC_URL
    // }
  ],
  appMetadata: {
    name: 'Patika',
    icon: blocknativeIcon,
    logo: blocknativeLogo,
    description: 'Welcome to Patika',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
    ],
  },
})

export { initOnboard }
