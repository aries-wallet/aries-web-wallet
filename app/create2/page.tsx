'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { type Address, decodeEventLog } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

const create2Deployer = '0xB278cEa7C413600F14e7eD92600B7AA0B2A86Df5' as const
const supportedChains = [888, 999, 43114, 43113, 16180, 62831]

const create2DeployerAbi = [
  { inputs: [], name: 'Create2EmptyBytecode', type: 'error' },
  { inputs: [], name: 'Create2FailedDeployment', type: 'error' },
  { inputs: [{ name: 'balance', type: 'uint256' }, { name: 'needed', type: 'uint256' }], name: 'Create2InsufficientBalance', type: 'error' },
  { anonymous: false, inputs: [{ indexed: true, name: 'deployer', type: 'address' }, { indexed: false, name: 'addr', type: 'address' }, { indexed: false, name: 'salt', type: 'bytes32' }], name: 'Deployed', type: 'event' },
  { inputs: [{ name: 'bytecode', type: 'bytes' }, { name: 'seed', type: 'string' }], name: 'computeAddress', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'bytecode', type: 'bytes' }, { name: 'seed', type: 'string' }], name: 'deploy', outputs: [{ name: 'addr', type: 'address' }], stateMutability: 'nonpayable', type: 'function' },
] as const

export default function Create2DeployerPage() {
  const [scAddr, setScAddr] = useState('')
  const [finalAddr, setFinalAddr] = useState('')
  const [bytecode, setBytecode] = useState('')
  const [seed, setSeed] = useState('')
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showSuccess, showError } = useSnackbar()
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Create2 Deployer</Typography>
          <Typography variant="body2" sx={{ color: t.textSecondary, lineHeight: 1.8 }}>
            Deploy contracts with the same address across multiple blockchains using CREATE2.
          </Typography>

          {supportedChains.includes(chainId) ? (
            <Stack spacing={2}>
              <TextField size="small" label="Bytecode (0x...)" value={bytecode} onChange={(e) => setBytecode(e.target.value)} />
              <TextField size="small" label="Seed" placeholder="hello world 123" value={seed} onChange={(e) => setSeed(e.target.value)} />
              <Button variant="contained"
                sx={{ alignSelf: 'flex-start' }}
                onClick={async () => {
                  try {
                    if (!publicClient || !address) return
                    const addr = await publicClient.readContract({
                      address: create2Deployer, abi: create2DeployerAbi,
                      functionName: 'computeAddress', args: [bytecode as `0x${string}`, seed],
                    })
                    setScAddr(addr)
                  } catch (error: unknown) { console.error(error); showError((error as Error).message) }
                }}
              >
                Step 1 — Query Deploy Address
              </Button>
              {scAddr && (
                <Box sx={{ boxShadow: shadows.inset, borderRadius: '16px', p: 2 }}>
                  <Typography variant="caption" sx={{ color: t.textSecondary, fontWeight: 600 }}>Predicted Address</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 0.5, color: t.text }}>{scAddr}</Typography>
                </Box>
              )}
              <Button variant="contained"
                sx={{ alignSelf: 'flex-start', bgcolor: '#e8853d', '&:hover': { bgcolor: '#d47632' } }}
                onClick={async () => {
                  try {
                    if (!walletClient || !publicClient || !address) return
                    const hash = await walletClient.writeContract({
                      address: create2Deployer, abi: create2DeployerAbi,
                      functionName: 'deploy', args: [bytecode as `0x${string}`, seed],
                    })
                    const receipt = await publicClient.waitForTransactionReceipt({ hash })
                    const deployedEvent = receipt.logs.find((log) => {
                      try { const d = decodeEventLog({ abi: create2DeployerAbi, data: log.data, topics: log.topics }); return d.eventName === 'Deployed' } catch { return false }
                    })
                    if (deployedEvent) {
                      const decoded = decodeEventLog({ abi: create2DeployerAbi, data: deployedEvent.data, topics: deployedEvent.topics })
                      setFinalAddr((decoded.args as { addr: string }).addr)
                    }
                    showSuccess(`Deploy tx: ${hash}`)
                  } catch (error: unknown) { console.error(error); showError((error as Error).message) }
                }}
              >
                Step 2 — Deploy
              </Button>
              {finalAddr && (
                <Box sx={{ boxShadow: shadows.inset, borderRadius: '16px', p: 2 }}>
                  <Typography variant="caption" sx={{ color: t.textSecondary, fontWeight: 600 }}>Final Address</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 0.5, color: t.text }}>{finalAddr}</Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <Box sx={{ boxShadow: shadows.inset, borderRadius: '16px', p: 2 }}>
              <Typography variant="body2" sx={{ color: '#e8853d' }}>
                Unsupported chain ({chainId}). Supported: {supportedChains.join(', ')}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
