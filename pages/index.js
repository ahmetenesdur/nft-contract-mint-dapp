import Head from 'next/head';
import { useState, useEffect } from 'react'
import { initOnboard } from '../utils/onboard'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { config } from '../dapp.config'
import {
  getTotalMinted,
  getMaxSupply,
  isPausedState,
  isPublicSaleState,
  isPreSaleState,
  allowListMint,
  publicMint
} from '../utils/interact'
import styles from '../styles/Home.module.css';

export default function Home() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const connectedWallets = useWallets()

  const [maxSupply, setMaxSupply] = useState(0)
  const [totalMinted, setTotalMinted] = useState(0)
  const [maxMintAmount, setMaxMintAmount] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isPublicSale, setIsPublicSale] = useState(false)
  const [isPreSale, setIsPreSale] = useState(false)

  const [status, setStatus] = useState(null)
  const [mintAmount, setMintAmount] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [onboard, setOnboard] = useState(null)

  useEffect(() => {
    setOnboard(initOnboard)
  }, [])

  // wallet state
  useEffect(() => {
    if (!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    )
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWalletsLabelArray)
    )
  }, [connectedWallets])

  // previous connected wallets state
  useEffect(() => {
    if (!onboard) return

    const previouslyConnectedWallets = JSON.parse(
      window.localStorage.getItem('connectedWallets')
    )

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        await connect({
          autoSelect: {
            label: previouslyConnectedWallets[0],
            disableModals: true
          }
        })
      }
      setWalletFromLocalStorage()
    }
  }, [onboard, connect])

  // contract state
  useEffect(() => {
    const init = async () => {
      setMaxSupply(await getMaxSupply())
      setTotalMinted(await getTotalMinted())

      setPaused(await isPausedState())
      setIsPublicSale(await isPublicSaleState())
      const isPreSale = await isPreSaleState()
      setIsPreSale(isPreSale)

      setMaxMintAmount(
        isPreSale ? config.presaleMaxMintAmount : config.maxMintAmount
      )
    }

    init()
  }, [])

  // mint amount increment/decrement 
  const incrementMintAmount = () => {
    if (mintAmount < maxMintAmount) {
      setMintAmount(mintAmount + 1)
    }
  }

  const decrementMintAmount = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1)
    }
  }

  // total mint amount
  const totalPrice = () => {
    return Number.parseFloat(mintAmount * config.price).toFixed(3)
  }

  // pre-sale mint
  const presaleMintHandler = async () => {
    await setChain({ chainId: '0x5' })

    setIsMinting(true)

    const { success, status } = await allowListMint(mintAmount)

    setStatus({
      success,
      message: status
    })

    setIsMinting(false)
  }

  // public mint
  const publicMintHandler = async () => {
    await setChain({ chainId: '0x5' })

    setIsMinting(true)

    const { success, status } = await publicMint(mintAmount)

    setStatus({
      success,
      message: status
    })

    setIsMinting(false)
  }

  return (
    <div className={styles.container}>

      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-center ">
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative z-1 md:max-w-3xl w-full bg-[#1b232f] filter backdrop-blur-sm py-4 rounded-md px-2 md:px-10 flex flex-col items-center">

              {/*  wallet disconnected */}
              {wallet && (
                <button
                  className="absolute right-4 bg-indigo-900 transition duration-200 ease-in-out font-chalk border-2 border-[rgba(0,0,0,1)] shadow-[0px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none px-4 py-2 rounded-md text-sm text-white tracking-wide"
                  onClick={() =>
                    disconnect({
                      label: wallet.label
                    })
                  }
                >
                  Disconnect
                </button>
              )}

              {/*  change title sale state  */}
              <h1 className="font-bold text-5xl bg-gradient-to-br text-pink-800 bg-clip-text mt-4">
                {paused ? 'Paused' : isPreSale ? 'Pre-Sale' : 'Public Sale'}
              </h1>

              {/*  user address  */}
              <h3 className="text-sm text-pink-200 tracking-widest mt-2">
                {wallet?.accounts[0]?.address
                  ? wallet?.accounts[0]?.address.slice(0, 8) +
                  '...' +
                  wallet?.accounts[0]?.address.slice(-4)
                  : ''}
              </h3>

              <div className="flex flex-col md:flex-row md:space-x-14 w-full mt-10 md:mt-14">

                {/* total minted and max supply */}
                <div className="relative w-full">
                  <div className="z-10 absolute top-2 left-2 opacity-80 filter backdrop-blur-lg text-base px-4 py-2 bg-black border border-brand-purple rounded-md flex items-center justify-center text-white font-semibold">
                    <p>
                      <span className="text-brand-pink">{totalMinted}</span> /{' '}
                      {maxSupply}
                    </p>
                  </div>

                  <img
                    src="https://i.seadn.io/gae/O7xfYc-mQOvenEX4Rpn54YvYkdncWJzGDSe_HL4oB2wXbjk4D20_x5XbyDGboBq9VOqHPcHSgi7xWK1yB29efOgc8EwSt_dfAtQjKA?auto=format&w=1920"
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>

                <div className="flex flex-col items-center w-full px-5 mt-10">

                  {/* mint amount */}
                  <div className="flex items-center justify-between w-full">
                    <button
                      className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center text-brand-background hover:shadow-lg bg-gray-300 font-bold rounded-md"
                      onClick={decrementMintAmount}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 md:h-8 md:w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 12H6"
                        />
                      </svg>
                    </button>

                    <p className="flex items-center justify-center flex-1 grow text-center font-bold text-pink-200 text-3xl md:text-4xl">
                      {mintAmount}
                    </p>

                    <button
                      className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center text-brand-background hover:shadow-lg bg-gray-300 font-bold rounded-md"
                      onClick={incrementMintAmount}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 md:h-8 md:w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* max mint */}
                  <p className="text-sm text-pink-200 tracking-widest mt-5">
                    Max Mint Amount: {maxMintAmount}
                  </p>

                  {/* mint price and total price */}
                  <div className="w-full text-xl flex items-center justify-between text-pink-400 mt-6">
                    <p>Total</p>

                    <div className="flex items-center space-x-3">
                      <p>
                        {totalPrice()}{' '}
                        ETH
                      </p>{' '}
                      <span className="text-gray-400">+ GAS</span>
                    </div>
                  </div>

                  {/* mint button and status and connect button */}
                  {wallet ? (
                    <button
                      className={` ${paused || isMinting
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-br bg-fuchsia-600 hover:bg-fuchsia-800 '
                        } mt-8 w-full py-3 rounded-md text-2xl text-white tracking-wide `}
                      disabled={paused || isMinting}
                      onClick={isPreSale ? presaleMintHandler : publicMintHandler}
                    >
                      {isMinting ? 'Minting...' : 'Mint'}
                    </button>
                  ) : (
                    <button
                      className="mt-8 w-full bg-fuchsia-600 hover:bg-fuchsia-800 shadow-lg py-3 rounded-md text-2xl text-white tracking-wide "
                      onClick={() => connect()}
                    >
                      Connect Wallet
                    </button>
                  )}

                </div>
              </div>

              {/* status */}
              {status && (
                <div
                  className={`border ${status.success ? 'border-green-500' : 'border-red-500 '
                    } rounded-md text-start h-full px-4 py-4 w-full mx-auto mt-8 md:mt-4"`}
                >
                  <p className="flex flex-col space-y-2 text-white text-sm md:text-base break-words ...">
                    {status.message}
                  </p>
                </div>
              )}

              {/* contract address */}
              <div className="border-t border-gray-800 flex flex-col items-center mt-10 py-2 w-full text-pink-800">
                <h3 className="text-2xl text-brand-pink mt-6 font-bold">
                  Contract Address
                </h3>
                <a
                  href={`https://goerli.etherscan.io/address/${config.contractAddress}#readContract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 mt-4"
                >
                  <span className="break-all ...">{config.contractAddress}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
