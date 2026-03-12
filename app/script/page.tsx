'use client'

import { Box, Button, Stack, TextareaAutosize, Typography } from '@mui/material'
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
    <Box sx={{ p: 3, maxWidth: 960 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Script Runner</Typography>
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
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
            style={{
              color: '#00cdae', backgroundColor: '#1a1d23', width: '100%',
              fontFamily: '"SF Mono", Monaco, Menlo, monospace', fontSize: 13,
              padding: 16, borderRadius: 10, border: 'none', outline: 'none',
              lineHeight: 1.6, resize: 'vertical',
            }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Typography variant="caption" sx={{ color: '#8a94a6' }}>
            * Check the console output in F12 developer tools.
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}
