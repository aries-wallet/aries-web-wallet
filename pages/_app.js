import { ThemeProvider } from '@emotion/react'
import { Stack } from '@mui/material'
import { createTheme } from '@mui/material/styles'
import Image from 'next/image'
import Head from 'next/head'  // 新增
import { useEffect, useState } from 'react'
import '../styles/globals.css'
import { initDb } from '../utils/db'
import SideBar from './_sideBar'

const theme = createTheme({
  palette: {
    mode: 'light',
  }
})

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    initDb().then(ret=>{
      console.log('initDb', ret)
    }).catch(console.error).finally(()=>{
      console.log('initDb finish');
      setLoading(false);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>AriesWallet - Smart Contract Interaction & Crypto Management Tool</title>
        <meta name="description" content="AriesWallet is a powerful tool for interacting with smart contracts and managing cryptocurrency transactions. Securely read and write smart contracts without storing private keys." />
        <meta name="keywords" content="smart contracts, blockchain interaction, cryptocurrency management, AriesWallet, DeFi tools, Web3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.arieswallet.com" />
        <meta property="og:title" content="AriesWallet - Smart Contract Interaction & Crypto Management Tool" />
        <meta property="og:description" content="Interact with smart contracts and manage crypto transactions securely with AriesWallet. No private key storage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.arieswallet.com" />
        <meta property="og:image" content="https://www.arieswallet.com/og-image.svg" />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {
        loading ? <div style={{width:'100%', textAlign:'center'}}>
            <Image alt="Loading..." src="/loading.gif" width="800" height="600" />
          </div> :  <Stack spacing={2} direction='row' >
          <SideBar />
          <div style={{width:'100%', height: "100vh", overflow: "scroll"}}>
            <Component {...pageProps} />
          </div>
        </Stack>
      }
    </ThemeProvider>
  )
}

export default MyApp
