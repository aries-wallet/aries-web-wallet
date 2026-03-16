'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { type Address } from 'viem'
import copy from 'copy-to-clipboard'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { memeTokenAbi, memeTokenBytecode, memeSourceCode } from './constants'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

export default function MemeCoinCreation() {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [receiver, setReceiver] = useState('')
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showSuccess, showError } = useSnackbar()
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return (
    <Stack spacing={2.5} sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>MEME Coin Creation</Typography>
          <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField size="small" label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          <TextField size="small" label="Total Supply in Ether" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} />
          <TextField size="small" label="Receiver Address" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
          <Button variant="contained"
            sx={{ alignSelf: 'flex-start' }}
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

      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Verify in Explorer</Typography>
          <Button variant="contained"
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => { copy(memeSourceCode); showSuccess('Source code copied!') }}
          >
            Copy Contract Source Code
          </Button>
          <Box sx={{ boxShadow: shadows.inset, borderRadius: '16px', p: 2 }}>
            <Typography variant="body2" sx={{ color: t.textSecondary, lineHeight: 2 }}>
              1) Select Single File to Verify<br />
              2) Select solidity 0.8.25 version<br />
              3) Select evm version london<br />
              4) Paste the copied source code
            </Typography>
          </Box>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/1.jpg" style={{ maxWidth: '100%', borderRadius: 16 }} alt="step1" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/2.jpg" style={{ maxWidth: '100%', borderRadius: 16 }} alt="step2" />
        </Stack>
      </Box>
    </Stack>
  )
}
