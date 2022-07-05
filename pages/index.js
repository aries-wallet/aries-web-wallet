import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Tag } from 'antd';
import { Stack } from '@mui/material';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Image alt="Banner" width={1024} height={300} src="/banner.svg" />
        <h4 className={styles.title}>
          Welcome to Aries Wallet
        </h4>
        <Stack spacing={1} direction="row">
          <Tag color="green">EVM</Tag>
          <Tag color="cyan">Smart Contract</Tag>
          <Tag color="blue">ERC20</Tag>
          <Tag color="geekblue">ERC721</Tag>
          <Tag color="purple">MetaMask</Tag>
          <Tag color="magenta">Ledger</Tag>
          <Tag color="red">Trezor</Tag>
          <Tag color="volcano">Script</Tag>
        </Stack>
        <p className={styles.description}>△ Read or write smart contract with your wallet on any EVM chain.</p>
        <Image src="/smart_contract.png" alt="smart_contract" width={800} height={400} />
        <p className={styles.description}>△ Send normal/raw transaction to any address with your connected wallet.</p>
        <Image src="/transaction.png" alt="transaction" width={800} height={400} />
        <p className={styles.description}>△ Interact any base functions with ERC20/ERC721 token.</p>
        <Image src="/token.png" alt="token" width={800} height={400} />
        <p className={styles.description}>△ Run your custom Javascript with your connected wallet.</p>
        <Image src="/script.png" alt="script" width={800} height={400} />
        <p className={styles.description}>→ Welcome to make any Github Pull Request to this open source web wallet ←</p>
      </main>
    </div>
  )
}
