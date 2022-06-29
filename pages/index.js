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
          Connect to your wallet and start using it.
        </p>
        
      </main>
    </div>
  )
}
