'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useDynamicPublicClient, useDynamicWalletClient } from '@/lib/hooks/use-dynamic-client'
import { type Address } from 'viem'
import copy from 'copy-to-clipboard'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { memeTokenAbi, memeTokenBytecode, memeSourceCode } from './constants'

export default function MemeCoinCreation() {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [receiver, setReceiver] = useState('')
  const { address } = useAccount()
  const publicClient = useDynamicPublicClient()
  const walletClient = useDynamicWalletClient()
  const { showSuccess, showError } = useSnackbar()

  return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>MEME Coin Creation</Typography>
          <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField size="small" label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <TextField size="small" label="Total Supply in Ether" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} />
          <TextField size="small" label="Receiver Address" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
          <Button variant="contained"
            sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={async () => {
              try {
                if (!walletClient || !publicClient || !address) return
                const hash = await walletClient.deployContract({
                  abi: memeTokenAbi, bytecode: memeTokenBytecode as `0x${string}`,
                  args: [name, symbol, BigInt(totalSupply), receiver as Address],
                })
                const receipt = await publicClient.waitForTransactionReceipt({ hash })
                if (receipt.contractAddress) showSuccess(`Contract deployed at: ${receipt.contractAddress}`)
                else showSuccess(`Deploy tx: ${hash}`)
              } catch (error: unknown) { console.error(error); showError((error as Error).message) }
            }}
          >
            Create & Mint
          </Button>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Verify in Explorer</Typography>
          <Button variant="contained"
            sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={() => { copy(memeSourceCode); showSuccess('Source code copied!') }}
          >
            Copy Contract Source Code
          </Button>
          <Box sx={{ bgcolor: '#f5f7fb', borderRadius: '8px', p: 2 }}>
            <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 2 }}>
              1) Select Single File to Verify<br />
              2) Select solidity 0.8.25 version<br />
              3) Select evm version london<br />
              4) Paste the copied source code
            </Typography>
          </Box>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/1.jpg" style={{ maxWidth: '100%', borderRadius: 12 }} alt="step1" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/2.jpg" style={{ maxWidth: '100%', borderRadius: 12 }} alt="step2" />
        </Stack>
      </Box>
    </Stack>
  )
}
