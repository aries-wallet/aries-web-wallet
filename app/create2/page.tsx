'use client'

import { Button, Divider, Paper, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import { type Address, decodeEventLog } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

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

  return (
    <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
      <Stack spacing={2}>
        <h1>Create2 Deployer</h1>
        <h2>Deploy contracts with the same address across multiple blockchains using CREATE2.</h2>
        <h2>We are using Create2Deployer contract: https://github.com/lolieatapple/create2-same-address.git</h2>
        <h2>Step1. Input Your contract bytecode and seeds to query deploy address;</h2>
        <h2>Step2. Click deploy button to finish the deployment;</h2>

        {supportedChains.includes(chainId) && (
          <Stack spacing={2}>
            <TextField label="Bytecode start with 0x" placeholder="0x66331231231234..." value={bytecode} onChange={(e) => setBytecode(e.target.value)} />
            <TextField label="Seed" placeholder="hello world 123" value={seed} onChange={(e) => setSeed(e.target.value)} />
            <Button
              variant="contained"
              sx={{ textTransform: 'none' }}
              onClick={async () => {
                try {
                  if (!publicClient || !address) return
                  const addr = await publicClient.readContract({
                    address: create2Deployer,
                    abi: create2DeployerAbi,
                    functionName: 'computeAddress',
                    args: [bytecode as `0x${string}`, seed],
                  })
                  setScAddr(addr)
                } catch (error: unknown) {
                  console.error(error)
                  showError((error as Error).message)
                }
              }}
            >
              Step1. Query Deploy Contract Address
            </Button>
            {scAddr && <TextField label="Contract Address" value={scAddr} InputProps={{ readOnly: true }} />}
            <Button
              variant="contained"
              sx={{ textTransform: 'none' }}
              onClick={async () => {
                try {
                  if (!walletClient || !publicClient || !address) return
                  const hash = await walletClient.writeContract({
                    address: create2Deployer,
                    abi: create2DeployerAbi,
                    functionName: 'deploy',
                    args: [bytecode as `0x${string}`, seed],
                  })
                  const receipt = await publicClient.waitForTransactionReceipt({ hash })
                  const deployedEvent = receipt.logs.find((log) => {
                    try {
                      const decoded = decodeEventLog({ abi: create2DeployerAbi, data: log.data, topics: log.topics })
                      return decoded.eventName === 'Deployed'
                    } catch { return false }
                  })
                  if (deployedEvent) {
                    const decoded = decodeEventLog({ abi: create2DeployerAbi, data: deployedEvent.data, topics: deployedEvent.topics })
                    setFinalAddr((decoded.args as { addr: string }).addr)
                  }
                  showSuccess(`Deploy tx: ${hash}`)
                } catch (error: unknown) {
                  console.error(error)
                  showError((error as Error).message)
                }
              }}
            >
              Step2. Finish Deploy
            </Button>
            {finalAddr && <TextField label="Final Address" value={finalAddr} InputProps={{ readOnly: true }} />}
          </Stack>
        )}

        {!supportedChains.includes(chainId) && (
          <Stack spacing={2}>
            <Divider />
            <h2>Unsupported chain id: {chainId}</h2>
            <h2>Currently only support: {supportedChains.toString()}</h2>
            <h2>If you want more chains, please contact us.</h2>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
