'use client'

import { Button, Paper, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
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
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showSuccess, showError } = useSnackbar()

  return (
    <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
      <Stack spacing={2}>
        <h1>MEME Coin Creation</h1>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        <TextField label="Total Supply in Ether" value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)} />
        <TextField label="Receiver Address" value={receiver} onChange={(e) => setReceiver(e.target.value)} />
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              if (!walletClient || !publicClient || !address) return
              const hash = await walletClient.deployContract({
                abi: memeTokenAbi,
                bytecode: memeTokenBytecode as `0x${string}`,
                args: [name, symbol, BigInt(totalSupply), receiver as Address],
              })
              const receipt = await publicClient.waitForTransactionReceipt({ hash })
              if (receipt.contractAddress) {
                showSuccess(`Contract deployed at: ${receipt.contractAddress}`)
              } else {
                showSuccess(`Deploy tx: ${hash}`)
              }
            } catch (error: unknown) {
              console.error(error)
              showError((error as Error).message)
            }
          }}
        >
          Create & Mint
        </Button>
      </Stack>
      <div style={{ height: '30px' }} />
      <Stack spacing={2}>
        <h1>Verify the MEME Coin in explorer</h1>
        <Button variant="contained" color="primary" onClick={() => { copy(memeSourceCode); showSuccess('Source code copied!') }}>
          Copy Contract Source Code
        </Button>
        <div>1) Select Single File to Verify;</div>
        <div>2) Select solidity 0.8.25 version;</div>
        <div>3) Select evm version london;</div>
        <div>4) Paste the copied source code;</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/1.jpg" style={{ maxWidth: '800px' }} alt="step1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/2.jpg" style={{ maxWidth: '800px' }} alt="step2" />
      </Stack>
    </Paper>
  )
}
