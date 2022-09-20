import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { providers, Contract } from 'ethers'
import { useState, useEffect, useRef } from 'react'
import { NFT_ALLOWLIST_CONTRACT, abi } from '../constants'

export default function Home() {
  const [connectedWallet, setConnectedWallet] = useState(false)
  const [addressAllow, setAddressAllow] = useState("")
  const [isAllowlistAddresses, setIsAllowlistAddresses] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 5) {
      window.alert("Change the network to Goerli")
      throw new Error("Change network to Goerli")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }
    return web3Provider
  }

  const allowlistAddress = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_ALLOWLIST_CONTRACT, abi, signer)

      const txn = await nftContract.allowlistAddresses([addressAllow])
      setLoading(true)
      await txn.wait()
      setLoading(false)
    } catch (err) {
      console.error({ err })
    }
  }

  const preSaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_ALLOWLIST_CONTRACT, abi, signer)

      const txn = await nftContract.preSale()
      setLoading(true)
      await txn.wait()
      setLoading(false)
    } catch (err) {
      console.error({ err })
    }
  }

  const checkIfIsAllowlistAddress = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_ALLOWLIST_CONTRACT, abi, signer)

      const address = await signer.getAddress()
      const _isAllowlistAddress = await nftContract.isAllowlistAddress(address)
      setIsAllowlistAddresses(_isAllowlistAddress)
    } catch (err) {
      console.error({ err })
    }
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(NFT_ALLOWLIST_CONTRACT, abi, provider)
      const _owner = await nftContract.owner()

      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress()

      if (_owner.toLowerCase() === address.toLowerCase()) {
        setIsOwner(true)
      }
    } catch (err) {
      console.error({ err })
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setConnectedWallet(true)
    } catch (err) {
      console.error({ err })
    }
  }

  useEffect(() => {
    if (!connectedWallet) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()


      setInterval(async function() {
        await getOwner()
        await checkIfIsAllowlistAddress()
      }, 1000 * 5)
    }
  }, [connectedWallet])

  const renderButton = () => {
    if (!connectedWallet) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      )
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>
    }

    if (isAllowlistAddresses) {
      return (
        <button className={styles.button} onClick={preSaleMint}>
          Presale NFT
        </button>
      )
    }
  }

  return (
    <div>
      <Head>
        <title>NFT Allowlist</title>
        <meta name="description" content="NFT Allowlist now" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to NFT Allowlist</h1>
          <div className={styles.description}>
            Its an NFT Allowlist for users in Crypto.
          </div>
          <div className={styles.description}>
            LFG!!
          </div>
          {renderButton()}

          {
            isOwner ? (
              <div>
                <hr/> <br/> <br/>
                <input 
                  className={styles.input} 
                  placeholder="0x000000000000000000000000000000000" 
                  onChange={event => setAddressAllow(event.target.value)} 
                />
                <button className={styles.button} onClick={allowlistAddress}>
                  Allow Address
                </button>
              </div>
            ) : null
          }
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
    </div>
  )
}
