'use client'

import Image from 'next/image'
import { Chip, Stack } from '@mui/material'
import styles from './home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Image alt="Banner" width={1024} height={300} src="/banner.svg" />
        <h4 className={styles.title}>Welcome to Aries Wallet</h4>
        <Stack spacing={1} direction="row" flexWrap="wrap" justifyContent="center">
          <Chip label="EVM" color="success" />
          <Chip label="Smart Contract" color="info" />
          <Chip label="ERC20" color="primary" />
          <Chip label="ERC721" color="secondary" />
          <Chip label="MetaMask" color="secondary" />
          <Chip label="Ledger" color="error" />
          <Chip label="Trezor" color="error" />
          <Chip label="Script" color="warning" />
        </Stack>
        <p className={styles.description}>Read or write smart contract with your wallet on any EVM chain.</p>
        <Image src="/smart_contract.png" alt="smart_contract" width={800} height={400} />
        <p className={styles.description}>Send normal/raw transaction to any address with your connected wallet.</p>
        <Image src="/transaction.png" alt="transaction" width={800} height={400} />
        <p className={styles.description}>Interact any base functions with ERC20/ERC721 token.</p>
        <Image src="/token.png" alt="token" width={800} height={400} />
        <p className={styles.description}>Run your custom Javascript with your connected wallet.</p>
        <Image src="/script.png" alt="script" width={800} height={400} />
        <p className={styles.description}>Welcome to make any Github Pull Request to this open source web wallet</p>
      </main>
    </div>
  )
}
