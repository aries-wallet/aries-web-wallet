'use client'

import { Button, Paper, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useAccount, useSendTransaction, usePublicClient } from 'wagmi'
import { parseEther, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

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
    <div>
      <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
        <Stack spacing={2}>
          <h1>Send Normal Transaction</h1>
          <TextField label="To Address" value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
          <TextField label="Value in Ether" value={value} onChange={(e) => setValue(e.target.value)} />
          <TextField label="Data" value={data} onChange={(e) => setData(e.target.value)} />
          <Button
            variant="contained"
            color="primary"
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
      </Paper>

      <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
        <Stack spacing={2}>
          <h1>Get Transaction Status</h1>
          <TextField label="Transaction Hash" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          <Button
            variant="contained"
            color="primary"
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
          <h4>Tx JSON</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{txJson}</pre>
          <h4>Tx Receipt</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{txReceipt}</pre>
        </Stack>
      </Paper>

      <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
        <Stack spacing={2}>
          <h1>Send Normal Transaction From Private Key</h1>
          <TextField label="Private Key" type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          <TextField label="To Address" value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
          <TextField label="Value in Ether" value={value} onChange={(e) => setValue(e.target.value)} />
          <TextField label="GasPrice in Gwei" value={gasPrice} onChange={(e) => setGasPrice(e.target.value)} />
          <TextField label="Data" value={data} onChange={(e) => setData(e.target.value)} />
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                if (!publicClient) return
                const account = privateKeyToAccount(privateKey as `0x${string}`)
                const chain = publicClient.chain
                const walletClient = createWalletClient({
                  account,
                  chain,
                  transport: http(),
                })
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
      </Paper>
    </div>
  )
}
