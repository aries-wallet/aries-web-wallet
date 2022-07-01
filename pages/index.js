import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Aries Web Wallet
        </h1>
        <p className={styles.description}>
          ❤️ Connect to your wallet and start using it. ❤️
        </p>
        <p className={styles.description}>1. You can read or write smart contract with your wallet on any EVM chain.</p>
        <Image src="/smart_contract.png" alt="smart_contract" width={800} height={400} />
        <p className={styles.description}>2. You can send normal/raw transaction to any address with your connected wallet.</p>
        <Image src="/transaction.png" alt="transaction" width={800} height={400} />
        <p className={styles.description}>3. You can interact any base functions with ERC20/ERC721 token.</p>
        <Image src="/token.png" alt="token" width={800} height={400} />
        <p className={styles.description}>4. You can run your custom Javascript with your connected wallet.</p>
        <Image src="/script.png" alt="script" width={800} height={400} />
        <p className={styles.description}>* Welcome to make any Github Pull Request to this open source web wallet *</p>
      </main>
    </div>
  )
}
