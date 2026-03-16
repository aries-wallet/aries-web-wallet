'use client'

import { useState } from 'react'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { type Address, isAddress, maxUint256 } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { useTxHistory } from '@/lib/store/tx-history'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

const erc20Abi = [
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'transferFrom', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

const erc721Abi = [
  { name: 'isApprovedForAll', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'setApprovalForAll', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'operator', type: 'address' }, { name: 'approved', type: 'bool' }], outputs: [] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transferFrom', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }], outputs: [] },
] as const

export default function TokenTools() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showSuccess, showError } = useSnackbar()
  const { addTx } = useTxHistory()
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  const [tokenAddress, setTokenAddress] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tokenAddress') || ''
    return ''
  })
  const [destAddress, setDestAddress] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('destAddress') || ''
    return ''
  })
  const [tokenID, setTokenID] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tokenID') || ''
    return ''
  })
  const [loadingAction, setLoadingAction] = useState('')

  const saveToStorage = (key: string, val: string) => { localStorage.setItem(key, val) }

  const tokenAddrError = tokenAddress && !isAddress(tokenAddress)
  const destAddrError = destAddress && !isAddress(destAddress)

  const validate = (requireDest = false) => {
    if (!address || !publicClient || !walletClient) { showError('Please connect wallet'); return false }
    if (!isAddress(tokenAddress)) { showError('Invalid token address'); return false }
    if (requireDest && !isAddress(destAddress)) { showError('Invalid destination address'); return false }
    return true
  }

  const withLoading = async (action: string, fn: () => Promise<void>) => {
    setLoadingAction(action)
    try { await fn() } finally { setLoadingAction('') }
  }

  const btnSx = {
    bgcolor: t.bg,
    color: t.accent,
    boxShadow: shadows.extrudedSmall,
    border: 'none',
    '&:hover': { boxShadow: shadows.extruded, transform: 'translateY(-1px)', bgcolor: t.bg },
  }

  const ActionButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <Button fullWidth sx={btnSx} disabled={!!loadingAction} onClick={onClick}>
      {loadingAction === label ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
      {label}
    </Button>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>DApp Tools</Typography>
      <Stack direction="row" spacing={2.5} flexWrap="wrap" sx={{ gap: 2.5 }}>
        {/* ERC20 */}
        <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, minWidth: 360, flex: 1, boxShadow: shadows.extruded, transition: 'all 300ms ease-out', '&:hover': { boxShadow: shadows.extrudedHover, transform: 'translateY(-2px)' } }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>ERC20 Tools</Typography>
            <TextField fullWidth size="small" value={tokenAddress}
              onChange={(e) => { setTokenAddress(e.target.value); saveToStorage('tokenAddress', e.target.value) }}
              placeholder="Token SC Address"
              error={!!tokenAddrError} helperText={tokenAddrError ? 'Invalid address' : ''}
            />
            <TextField fullWidth size="small" value={destAddress}
              onChange={(e) => { setDestAddress(e.target.value); saveToStorage('destAddress', e.target.value) }}
              placeholder="Destination Address"
              error={!!destAddrError} helperText={destAddrError ? 'Invalid address' : ''}
            />
            <ActionButton label="Approve MAX" onClick={() => withLoading('Approve MAX', async () => {
              if (!validate(true)) return
              const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'approve', args: [destAddress as Address, maxUint256] })
              showSuccess(`Approve MAX success. Hash: ${hash}`)
              addTx({ hash, from: address!, to: tokenAddress, value: '0', chainId, chainName: publicClient?.chain?.name || '', type: 'token', description: 'ERC20 Approve MAX' })
            })} />
            <ActionButton label="Approve 0" onClick={() => withLoading('Approve 0', async () => {
              if (!validate(true)) return
              const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'approve', args: [destAddress as Address, 0n] })
              showSuccess(`Approve 0 success. Hash: ${hash}`)
              addTx({ hash, from: address!, to: tokenAddress, value: '0', chainId, chainName: publicClient?.chain?.name || '', type: 'token', description: 'ERC20 Approve 0' })
            })} />
            <ActionButton label="Allowance" onClick={() => withLoading('Allowance', async () => {
              if (!validate(true)) return
              const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'allowance', args: [address!, destAddress as Address] })
              showSuccess(`Allowance: ${result.toString()}`)
            })} />
            <ActionButton label="Get Balance" onClick={() => withLoading('Get Balance', async () => {
              if (!validate()) return
              const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'balanceOf', args: [address!] })
              showSuccess(`Balance: ${result.toString()}`)
            })} />
            <ActionButton label="Transfer" onClick={() => withLoading('Transfer', async () => {
              if (!validate(true)) return
              const amount = window.prompt('Input amount in wei:')
              if (!amount) return
              const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'transfer', args: [destAddress as Address, BigInt(amount)] })
              showSuccess(`Transfer success. Hash: ${hash}`)
              addTx({ hash, from: address!, to: destAddress, value: amount, chainId, chainName: publicClient?.chain?.name || '', type: 'token', description: `ERC20 Transfer ${amount} wei` })
            })} />
          </Stack>
        </Box>

        {/* ERC721 */}
        <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, minWidth: 360, flex: 1, boxShadow: shadows.extruded, transition: 'all 300ms ease-out', '&:hover': { boxShadow: shadows.extrudedHover, transform: 'translateY(-2px)' } }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>ERC721 Tools</Typography>
            <TextField fullWidth size="small" value={tokenAddress}
              onChange={(e) => { setTokenAddress(e.target.value); saveToStorage('tokenAddress', e.target.value) }}
              placeholder="Token SC Address"
              error={!!tokenAddrError}
            />
            <TextField fullWidth size="small" value={destAddress}
              onChange={(e) => { setDestAddress(e.target.value); saveToStorage('destAddress', e.target.value) }}
              placeholder="Destination Address"
              error={!!destAddrError}
            />
            <TextField fullWidth size="small" value={tokenID}
              onChange={(e) => { setTokenID(e.target.value); saveToStorage('tokenID', e.target.value) }}
              placeholder="Token ID"
            />
            <ActionButton label="isApprovedForAll" onClick={() => withLoading('isApprovedForAll', async () => {
              if (!validate(true)) return
              const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'isApprovedForAll', args: [address!, destAddress as Address] })
              showSuccess(`isApprovedForAll: ${result.toString()}`)
            })} />
            <ActionButton label="setApprovalForAll: true" onClick={() => withLoading('setApprovalForAll: true', async () => {
              if (!validate(true)) return
              const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'setApprovalForAll', args: [destAddress as Address, true] })
              showSuccess(`setApprovalForAll(true) success. Hash: ${hash}`)
              addTx({ hash, from: address!, to: tokenAddress, value: '0', chainId, chainName: publicClient?.chain?.name || '', type: 'token', description: 'ERC721 setApprovalForAll(true)' })
            })} />
            <ActionButton label="setApprovalForAll: false" onClick={() => withLoading('setApprovalForAll: false', async () => {
              if (!validate(true)) return
              const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'setApprovalForAll', args: [destAddress as Address, false] })
              showSuccess(`setApprovalForAll(false) success. Hash: ${hash}`)
              addTx({ hash, from: address!, to: tokenAddress, value: '0', chainId, chainName: publicClient?.chain?.name || '', type: 'token', description: 'ERC721 setApprovalForAll(false)' })
            })} />
            <ActionButton label="Get Balance" onClick={() => withLoading('Get Balance', async () => {
              if (!validate()) return
              const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'balanceOf', args: [address!] })
              showSuccess(`Balance: ${result.toString()}`)
            })} />
            <ActionButton label="Transfer" onClick={() => withLoading('Transfer', async () => {
              if (!validate(true)) return
              if (!tokenID) { showError('Token ID required'); return }
              const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'transferFrom', args: [address!, destAddress as Address, BigInt(tokenID)] })
              showSuccess(`Transfer success. Hash: ${hash}`)
              addTx({ hash, from: address!, to: destAddress, value: tokenID, chainId, chainName: publicClient?.chain?.name || '', type: 'token', description: `ERC721 Transfer #${tokenID}` })
            })} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
