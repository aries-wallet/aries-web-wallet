'use client'

import { useState } from 'react'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { type Address, isAddress, maxUint256 } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

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

const btnSx = { bgcolor: '#fff', color: '#5b7ff5', border: '1px solid #e2e6ef', '&:hover': { bgcolor: '#eef2ff', borderColor: '#5b7ff5' } }

export default function TokenTools() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showSuccess, showError } = useSnackbar()

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

  const saveToStorage = (key: string, val: string) => { localStorage.setItem(key, val) }

  const validate = (requireDest = false) => {
    if (!address || !publicClient || !walletClient) { showError('Please connect wallet'); return false }
    if (!isAddress(tokenAddress)) { showError('Invalid token address'); return false }
    if (requireDest && !isAddress(destAddress)) { showError('Invalid destination address'); return false }
    return true
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748', mb: 2 }}>DApp Tools</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
        {/* ERC20 */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3, minWidth: 400, flex: 1 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2d3748' }}>ERC20 Tools</Typography>
            <TextField fullWidth size="small" value={tokenAddress} onChange={(e) => { setTokenAddress(e.target.value); saveToStorage('tokenAddress', e.target.value) }} placeholder="Token SC Address" />
            <TextField fullWidth size="small" value={destAddress} onChange={(e) => { setDestAddress(e.target.value); saveToStorage('destAddress', e.target.value) }} placeholder="Destination Address" />
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              try {
                const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'approve', args: [destAddress as Address, maxUint256] })
                showSuccess(`Approve MAX success. Hash: ${hash}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Approve MAX</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              try {
                const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'approve', args: [destAddress as Address, 0n] })
                showSuccess(`Approve 0 success. Hash: ${hash}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Approve 0</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              try {
                const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'allowance', args: [address!, destAddress as Address] })
                showSuccess(`Allowance: ${result.toString()}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Allowance</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate()) return
              try {
                const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'balanceOf', args: [address!] })
                showSuccess(`Balance: ${result.toString()}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Get Balance</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              const amount = window.prompt('Input amount in wei:')
              if (!amount) return
              try {
                const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc20Abi, functionName: 'transfer', args: [destAddress as Address, BigInt(amount)] })
                showSuccess(`Transfer success. Hash: ${hash}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Transfer</Button>
          </Stack>
        </Box>

        {/* ERC721 */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3, minWidth: 400, flex: 1 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2d3748' }}>ERC721 Tools</Typography>
            <TextField fullWidth size="small" value={tokenAddress} onChange={(e) => { setTokenAddress(e.target.value); saveToStorage('tokenAddress', e.target.value) }} placeholder="Token SC Address" />
            <TextField fullWidth size="small" value={destAddress} onChange={(e) => { setDestAddress(e.target.value); saveToStorage('destAddress', e.target.value) }} placeholder="Destination Address" />
            <TextField fullWidth size="small" value={tokenID} onChange={(e) => { setTokenID(e.target.value); saveToStorage('tokenID', e.target.value) }} placeholder="Token ID" />
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              try {
                const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'isApprovedForAll', args: [address!, destAddress as Address] })
                showSuccess(`isApprovedForAll: ${result.toString()}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>isApprovedForAll</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              try {
                const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'setApprovalForAll', args: [destAddress as Address, true] })
                showSuccess(`setApprovalForAll(true) success. Hash: ${hash}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>setApprovalForAll: true</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              try {
                const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'setApprovalForAll', args: [destAddress as Address, false] })
                showSuccess(`setApprovalForAll(false) success. Hash: ${hash}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>setApprovalForAll: false</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate()) return
              try {
                const result = await publicClient!.readContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'balanceOf', args: [address!] })
                showSuccess(`Balance: ${result.toString()}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Get Balance</Button>
            <Button fullWidth sx={btnSx} onClick={async () => {
              if (!validate(true)) return
              if (!tokenID) { showError('Token ID required'); return }
              try {
                const hash = await walletClient!.writeContract({ address: tokenAddress as Address, abi: erc721Abi, functionName: 'transferFrom', args: [address!, destAddress as Address, BigInt(tokenID)] })
                showSuccess(`Transfer success. Hash: ${hash}`)
              } catch (e: unknown) { showError((e as Error).message) }
            }}>Transfer</Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
