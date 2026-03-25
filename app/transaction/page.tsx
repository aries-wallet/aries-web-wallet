'use client'

import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount, useChainId, useSendTransaction } from 'wagmi'
import { useDynamicPublicClient } from '@/lib/hooks/use-dynamic-client'
import { parseEther, createWalletClient, http, isAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { useTxHistory } from '@/lib/store/tx-history'

function Card({ children }: { children: React.ReactNode }) {
  return <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 3 }}>{children}</Box>
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
  const [sending, setSending] = useState(false)
  const [sendingPk, setSendingPk] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [addrError, setAddrError] = useState('')

  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = useDynamicPublicClient()
  const { sendTransactionAsync } = useSendTransaction()
  const { showSuccess, showError } = useSnackbar()
  const { addTx } = useTxHistory()

  const validateAddr = (val: string) => {
    setToAddr(val)
    if (val && !isAddress(val)) setAddrError('Invalid address')
    else setAddrError('')
  }

  return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 800 }}>
      <Card>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Send Normal Transaction</Typography>
          <TextField size="small" label="To Address" value={toAddr}
            onChange={(e) => validateAddr(e.target.value)}
            error={!!addrError} helperText={addrError}
          />
          <TextField size="small" label="Value in Ether" value={value} onChange={(e) => setValue(e.target.value)} type="number" />
          <TextField size="small" label="Data (hex)" value={data} onChange={(e) => setData(e.target.value)} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" disabled={sending}
              sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
              onClick={async () => {
                try {
                  if (!address) return
                  setSending(true)
                  const hash = await sendTransactionAsync({
                    to: toAddr ? (toAddr as `0x${string}`) : undefined,
                    value: value ? parseEther(value) : 0n,
                    data: data ? (data as `0x${string}`) : undefined,
                  })
                  showSuccess(`Transaction Hash: ${hash}`)
                  addTx({
                    hash, from: address, to: toAddr,
                    value: value || '0', chainId,
                    chainName: publicClient?.chain?.name || `Chain ${chainId}`,
                    type: 'send', description: `Send ${value || '0'} ETH`,
                  })
                } catch (error: unknown) {
                  console.error(error)
                  showError((error as Error).message)
                } finally {
                  setSending(false)
                }
              }}
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
            {sending && <CircularProgress size={18} />}
          </Stack>
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Get Transaction Status</Typography>
          <TextField size="small" label="Transaction Hash" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" disabled={fetching}
              sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
              onClick={async () => {
                try {
                  if (!publicClient) return
                  setFetching(true)
                  const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` })
                  setTxJson(JSON.stringify(tx, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
                  const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` })
                  setTxReceipt(JSON.stringify(receipt, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2))
                } catch (error: unknown) {
                  console.error(error)
                  showError((error as Error).message)
                } finally {
                  setFetching(false)
                }
              }}
            >
              {fetching ? 'Fetching...' : 'Get Tx & Receipt'}
            </Button>
            {fetching && <CircularProgress size={18} />}
          </Stack>
          {txJson && (
            <Box sx={{ bgcolor: 'action.hover', borderRadius: '8px', p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Tx JSON</Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 0.5 }}>
                {txJson}
              </Typography>
            </Box>
          )}
          {txReceipt && (
            <Box sx={{ bgcolor: 'action.hover', borderRadius: '8px', p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Tx Receipt</Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', mt: 0.5 }}>
                {txReceipt}
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Send Transaction From Private Key</Typography>
          <TextField size="small" label="Private Key" type="password" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          <TextField size="small" label="To Address" value={toAddr} onChange={(e) => validateAddr(e.target.value)} error={!!addrError} />
          <TextField size="small" label="Value in Ether" value={value} onChange={(e) => setValue(e.target.value)} type="number" />
          <TextField size="small" label="GasPrice in Gwei" value={gasPrice} onChange={(e) => setGasPrice(e.target.value)} type="number" />
          <TextField size="small" label="Data (hex)" value={data} onChange={(e) => setData(e.target.value)} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" disabled={sendingPk}
              sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
              onClick={async () => {
                try {
                  if (!publicClient) return
                  setSendingPk(true)
                  const account = privateKeyToAccount(privateKey as `0x${string}`)
                  const chain = publicClient.chain!
                  const walletClient = createWalletClient({ account, chain, transport: http() })
                  const hash = await walletClient.sendTransaction({
                    to: toAddr ? (toAddr as `0x${string}`) : undefined,
                    value: value ? parseEther(value) : 0n,
                    gasPrice: gasPrice ? BigInt(Math.round(Number(gasPrice) * 1e9)) : undefined,
                    data: data ? (data as `0x${string}`) : undefined,
                  })
                  showSuccess(`Transaction Hash: ${hash}`)
                  addTx({
                    hash, from: account.address, to: toAddr,
                    value: value || '0', chainId,
                    chainName: publicClient?.chain?.name || `Chain ${chainId}`,
                    type: 'send', description: `Send ${value || '0'} ETH (PK)`,
                  })
                } catch (error: unknown) {
                  console.error(error)
                  showError((error as Error).message)
                } finally {
                  setSendingPk(false)
                }
              }}
            >
              {sendingPk ? 'Sending...' : 'Send'}
            </Button>
            {sendingPk && <CircularProgress size={18} />}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  )
}
