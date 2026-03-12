'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount, useSendTransaction, usePublicClient } from 'wagmi'
import { parseEther, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

function Card({ children }: { children: React.ReactNode }) {
  return <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>{children}</Box>
}

export default function TransactionPage() {
  const [toAddr, setToAddr] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState('')
  const [txHash, setTxHash] = useState('')
  const [txJson, setTxJson] = useState('')
  const [txReceipt, setTxReceipt] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [gasPrice, setGasPrice] = useState('')

  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { sendTransactionAsync } = useSendTransaction()
  const { showSuccess, showError } = useSnackbar()

  return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 800 }}>
      <Card>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Send Normal Transaction</Typography>
          <TextField size="small" label="To Address" value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
          <TextField size="small" label="Value in Ether" value={value} onChange={(e) => setValue(e.target.value)} />
          <TextField size="small" label="Data" value={data} onChange={(e) => setData(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={async () => {
              try {
                if (!address) return
                const hash = await sendTransactionAsync({
                  to: toAddr ? (toAddr as `0x${string}`) : undefined,
                  value: value ? parseEther(value) : 0n,
                  data: data ? (data as `0x${string}`) : undefined,
                })
                showSuccess(`Transaction Hash: ${hash}`)
              } catch (error: unknown) {
                console.error(error)
                showError((error as Error).message)
              }
            }}
          >
            Send
          </Button>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Get Transaction Status</Typography>
          <TextField size="small" label="Transaction Hash" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={async () => {
              try {
                if (!publicClient) return
                const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` })
                setTxJson(JSON.stringify(tx, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
                const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
                setTxReceipt(JSON.stringify(receipt, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
              } catch (error: unknown) {
                console.error(error)
                showError((error as Error).message)
              }
            }}
          >
            Get Tx & Receipt
          </Button>
          {txJson && (
            <Box sx={{ bgcolor: '#f5f7fb', borderRadius: '8px', p: 2 }}>
              <Typography variant="caption" sx={{ color: '#8a94a6', fontWeight: 600 }}>Tx JSON</Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 0.5, color: '#2d3748' }}>
                {txJson}
              </Typography>
            </Box>
          )}
          {txReceipt && (
            <Box sx={{ bgcolor: '#f5f7fb', borderRadius: '8px', p: 2 }}>
              <Typography variant="caption" sx={{ color: '#8a94a6', fontWeight: 600 }}>Tx Receipt</Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 0.5, color: '#2d3748' }}>
                {txReceipt}
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Send Transaction From Private Key</Typography>
          <TextField size="small" label="Private Key" type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          <TextField size="small" label="To Address" value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
          <TextField size="small" label="Value in Ether" value={value} onChange={(e) => setValue(e.target.value)} />
          <TextField size="small" label="GasPrice in Gwei" value={gasPrice} onChange={(e) => setGasPrice(e.target.value)} />
          <TextField size="small" label="Data" value={data} onChange={(e) => setData(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={async () => {
              try {
                if (!publicClient) return
                const account = privateKeyToAccount(privateKey as `0x${string}`)
                const chain = publicClient.chain
                const walletClient = createWalletClient({ account, chain, transport: http() })
                const hash = await walletClient.sendTransaction({
                  to: toAddr ? (toAddr as `0x${string}`) : undefined,
                  value: value ? parseEther(value) : 0n,
                  gasPrice: gasPrice ? BigInt(Math.round(Number(gasPrice) * 1e9)) : undefined,
                  data: data ? (data as `0x${string}`) : undefined,
                })
                showSuccess(`Transaction Hash: ${hash}`)
              } catch (error: unknown) {
                console.error(error)
                showError((error as Error).message)
              }
            }}
          >
            Send
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
