'use client'

import { Alert, Box, Button, Stack, TextareaAutosize, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useEffect, useState } from 'react'
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi'
import { parseEther, type Address } from 'viem'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

let wanchainUtil: { toChecksumOTAddress: (addr: string) => string; generateOTAWaddress: (pk: string) => string } | undefined
if (typeof window !== 'undefined') {
  try { wanchainUtil = require('wanchain-util') } catch {}
}

const multiPrivateTxSC: Record<number, Address> = {
  888: '0x7D02Ec17f20cA4Bf43FD50410aC52a4038a48365',
  999: '0xD8D7fdab0d3ffD305b7ee4b4249405C9F82892A7',
}

const multiPrivateAbi = [
  { inputs: [{ name: 'otas', type: 'string[]' }, { name: 'values', type: 'uint256[]' }], name: 'send', outputs: [], stateMutability: 'payable', type: 'function' },
] as const

function splitAmount(amount: number) {
  const denominations = [50000, 5000, 1000, 500, 200, 100, 50, 20, 10]
  const result: { denomination: number; count: number }[] = []
  let remaining = amount
  for (const d of denominations) {
    const count = Math.floor(remaining / d)
    if (count > 0) { result.push({ denomination: d, count }); remaining -= d * count }
  }
  return result
}

export default function PrivateTx() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('privateTxText') || ''
    return ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lines, setLines] = useState<{ pk: string; value: string }[]>([])
  const [total, setTotal] = useState(0)
  const [otas, setOtas] = useState<{ ota: string; value: bigint }[]>([])
  const [loading, setLoading] = useState(false)
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  useEffect(() => {
    if (!text) { setLines([]); setError(''); return }
    if (!wanchainUtil) { setError('wanchain-util not loaded'); return }
    try {
      const _lines = text.split('\n').map((v) => v.trim()).filter(Boolean)
      let _total = 0
      const parsed = _lines.map((v) => {
        const two = v.split(',').map((s) => s.trim())
        if (two.length !== 2) throw new Error('FORMAT ERROR: Each line should contain a private address and the amount, separated by a comma.')
        if (wanchainUtil!.toChecksumOTAddress(two[0]) !== two[0]) throw new Error('FORMAT ERROR: Invalid private address.')
        if (isNaN(Number(two[1]))) throw new Error('FORMAT ERROR: Invalid amount.')
        if (Number(two[1]) % 10 !== 0) throw new Error('FORMAT ERROR: The amount must be a multiple of 10 WAN.')
        _total += parseInt(two[1])
        return { pk: two[0], value: two[1] }
      })
      setLines(parsed)
      setTotal(_total)
      setError('')
    } catch (e: unknown) { setError((e as Error).message) }
  }, [text])

  useEffect(() => {
    if (lines.length === 0 || !wanchainUtil) { setOtas([]); return }
    setSuccess('')
    try {
      const _ota: { ota: string; value: bigint }[] = []
      lines.forEach((v) => {
        splitAmount(Number(v.value)).forEach((m) => {
          for (let i = 0; i < m.count; i++) {
            _ota.push({ ota: wanchainUtil!.generateOTAWaddress(v.pk), value: parseEther(m.denomination.toString()) })
          }
        })
      })
      setOtas(_ota)
      setError('')
    } catch (e: unknown) { setError((e as Error).message) }
  }, [lines])

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Multiple Private Transaction</Typography>
          <Typography variant="body2" sx={{ color: t.textSecondary, lineHeight: 1.8 }}>
            Support batch sending of private transactions on Wanchain mainnet and testnet.
            Each line should contain a private address and the amount, separated by a comma. The amount must be a multiple of 10 WAN.
            <br />Only Wan Wallet Desktop v1.5.10 or above can receive the WAN.
          </Typography>
          <TextareaAutosize
            aria-label="OTA addresses" minRows={10}
            style={{
              width: '100%', fontFamily: 'monospace', fontSize: 13,
              padding: 12, borderRadius: 16, border: 'none', outline: 'none',
              resize: 'vertical',
              backgroundColor: t.bg,
              color: t.text,
              boxShadow: shadows.inset,
            }}
            value={text}
            onChange={(e) => { setText(e.target.value); localStorage.setItem('privateTxText', e.target.value) }}
            placeholder="For example:\n0x03473d...0B0,100\n0x0387a8...cd0,200"
          />

          <Box sx={{ display: 'flex', gap: 3, px: 1 }}>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>Addresses: <b style={{ color: t.text }}>{lines.length}</b></Typography>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>Total WAN: <b style={{ color: t.text }}>{total}</b></Typography>
            <Typography variant="caption" sx={{ color: t.textSecondary }}>OTA Count: <b style={{ color: t.text }}>{otas.length}</b></Typography>
          </Box>

          {error && <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: '16px' }}>{success}</Alert>}

          <LoadingButton
            disabled={error.length > 0} loading={loading} variant="contained"
            sx={{ alignSelf: 'flex-start' }}
            onClick={async () => {
              try {
                setSuccess('')
                if (otas.length === 0) throw new Error('No valid data.')
                if (!address || !walletClient) throw new Error('Please connect to a wallet.')
                if (![888, 999].includes(chainId)) throw new Error('Please connect to Wanchain mainnet or testnet.')
                setLoading(true)
                const hash = await walletClient.writeContract({
                  address: multiPrivateTxSC[chainId],
                  abi: multiPrivateAbi, functionName: 'send',
                  args: [otas.map((v) => v.ota), otas.map((v) => v.value)],
                  value: parseEther(total.toString()),
                })
                setSuccess('Success! Tx Hash: ' + hash)
                setError('')
              } catch (e: unknown) { setError((e as Error).message) }
              setLoading(false)
            }}
          >
            Send
          </LoadingButton>
        </Stack>
      </Box>
    </Box>
  )
}
