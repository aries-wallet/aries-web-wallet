'use client'

import { Button, Paper, Stack, TextareaAutosize } from '@mui/material'
import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import * as viem from 'viem'

const template = `
// You can use the wallet object to get address, chainId, publicClient, walletClient, and viem
const func = async () => {
    const address = wallet.address;
    const chainId = wallet.chainId;
    const publicClient = wallet.publicClient;
    const balance = await publicClient.getBalance({ address });
    console.log('Address and chainId', address, chainId);
    console.log('Balance:', balance.toString());
}

// Run the function above
func();
`

export default function ScriptPage() {
  const [code, setCode] = useState(template)
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return (
    <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
      <Stack spacing={3}>
        <Button
          variant="contained"
          onClick={() => {
            console.log('start run script.')
            const walletObj = { address, chainId, publicClient, walletClient, viem }
            const myFunc = new Function('wallet', code)
            myFunc(walletObj)
            console.log('finish run script.')
          }}
        >
          Run
        </Button>
        <TextareaAutosize
          aria-label="script editor"
          minRows={20}
          style={{ color: '#00cdae', backgroundColor: '#1e1e1e', width: '100%', fontFamily: 'monospace', padding: '10px' }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <p>* Please check the console output in F12 console window.</p>
      </Stack>
    </Paper>
  )
}
