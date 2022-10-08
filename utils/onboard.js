import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import walletConnectModule from '@web3-onboard/walletconnect'
import coinbaseWalletModule from '@web3-onboard/coinbase'

import blocknativeLogo from '../icon'
import blocknativeIcon from '../icon'

const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL

// wallet modules
const injected = injectedModule()
const walletConnect = walletConnectModule()
const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true })

const initOnboard = init({
  wallets: [injected, walletConnect, coinbaseWalletSdk], // wallet modules to use in the app
  chains: [ // chain ids to use in the app
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
  appMetadata: { // metadata for the app
    name: 'Patika',
    icon: blocknativeIcon,
    logo: blocknativeLogo,
    description: 'Welcome to Patika',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
})

export { initOnboard }
