'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Autocomplete, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import { AddBox, ContentCopy, DeleteForever, Edit, FileCopy, CloudDownload, Visibility, VisibilityOff } from '@mui/icons-material'
import { useAccount } from 'wagmi'
import { useDynamicPublicClient, useDynamicWalletClient } from '@/lib/hooks/use-dynamic-client'
import { type Abi, type AbiFunction, isAddress } from 'viem'
import copy from 'copy-to-clipboard'
import { useContractStore } from '@/lib/store/contract-store'
import { useThemeStore } from '@/lib/store/theme-store'
import { useTxHistory } from '@/lib/store/tx-history'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { ContractRead } from './read'
import { ContractWrite } from './write'

const iconBtnSx = { color: 'text.secondary', '&:hover': { color: '#5b7ff5', bgcolor: 'action.hover' } }

// Etherscan V2 unified API — all chains via single endpoint with chainid param
const ETHERSCAN_V2_API = 'https://api.etherscan.io/v2/api'
// Sourcify API for chains not supported by Etherscan (e.g. Wanchain)
const SOURCIFY_API = 'https://sourcify.dev/server/v2/contract'

type ChainSource = 'etherscan' | 'sourcify'

const explorerChains: { chainId: number; name: string; source: ChainSource }[] = [
  { chainId: 888, name: 'Wanchain', source: 'sourcify' },
  { chainId: 999, name: 'Wanchain Testnet', source: 'sourcify' },
  { chainId: 1, name: 'Ethereum', source: 'etherscan' },
  { chainId: 11155111, name: 'Sepolia', source: 'etherscan' },
  { chainId: 56, name: 'BSC', source: 'etherscan' },
  { chainId: 97, name: 'BSC Testnet', source: 'etherscan' },
  { chainId: 137, name: 'Polygon', source: 'etherscan' },
  { chainId: 43114, name: 'Avalanche', source: 'etherscan' },
  { chainId: 43113, name: 'Avalanche Fuji', source: 'etherscan' },
  { chainId: 42161, name: 'Arbitrum', source: 'etherscan' },
  { chainId: 10, name: 'Optimism', source: 'etherscan' },
  { chainId: 8453, name: 'Base', source: 'etherscan' },
  { chainId: 1284, name: 'Moonbeam', source: 'etherscan' },
  { chainId: 1285, name: 'Moonriver', source: 'etherscan' },
  { chainId: 1287, name: 'Moonbase Alpha', source: 'etherscan' },
  { chainId: 250, name: 'Fantom', source: 'etherscan' },
  { chainId: 25, name: 'Cronos', source: 'etherscan' },
  { chainId: 324, name: 'zkSync Era', source: 'etherscan' },
  { chainId: 59144, name: 'Linea', source: 'etherscan' },
  { chainId: 534352, name: 'Scroll', source: 'etherscan' },
  { chainId: 81457, name: 'Blast', source: 'etherscan' },
  { chainId: 5000, name: 'Mantle', source: 'etherscan' },
]

// ── Sourcify fetch ──

async function fetchAbiFromSourcify(address: string, chainId: number, isProxy: boolean): Promise<{ abi: string | null; error?: string; implAddress?: string }> {
  const url = `${SOURCIFY_API}/${chainId}/${address}?fields=abi`
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) {
      return { abi: null, error: 'Contract not verified on Sourcify for this chain.' }
    }
    return { abi: null, error: `Sourcify request failed (HTTP ${res.status})` }
  }
  const json = await res.json()

  if (!json.abi || !Array.isArray(json.abi) || json.abi.length === 0) {
    if (json.match === null) {
      return { abi: null, error: 'Contract not verified on Sourcify for this chain.' }
    }
    return { abi: null, error: 'No ABI found in Sourcify response.' }
  }

  const abiStr = JSON.stringify(json.abi)

  // If proxy, check if ABI looks like a minimal proxy (only fallback/receive/upgrade events)
  // and try to read implementation slot via RPC
  if (isProxy) {
    // For Sourcify, we try to fetch the implementation contract's ABI
    // Read EIP-1967 implementation slot
    try {
      const rpcUrl = chainId === 888
        ? 'https://gwan-ssl.wandevs.org:56891'
        : chainId === 999
        ? 'https://gwan-ssl.wandevs.org:46891'
        : null
      if (rpcUrl) {
        const slotRes = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1, method: 'eth_getStorageAt',
            params: [address, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', 'latest'],
          }),
        })
        const slotJson = await slotRes.json()
        if (slotJson.result && slotJson.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          const implAddr = '0x' + slotJson.result.slice(-40)
          // Fetch implementation ABI from Sourcify
          const implResult = await fetchAbiFromSourcify(implAddr, chainId, false)
          if (implResult.abi) {
            return { abi: implResult.abi, implAddress: implAddr }
          }
          return { abi: null, error: `Proxy implementation ${implAddr} is not verified on Sourcify.` }
        }
      }
      return { abi: null, error: 'Could not read proxy implementation address.' }
    } catch {
      return { abi: null, error: 'Failed to detect proxy implementation via RPC.' }
    }
  }

  return { abi: abiStr }
}

// ── Etherscan fetch ──

async function fetchAbiFromEtherscan(address: string, chainId: number, apiKey: string, isProxy: boolean): Promise<{ abi: string | null; error?: string; implAddress?: string }> {
  let targetAddress = address
  if (isProxy) {
    const implUrl = `${ETHERSCAN_V2_API}?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    const implRes = await fetch(implUrl)
    const implJson = await implRes.json()
    if (implJson.status === '1' && implJson.result?.[0]?.Implementation) {
      targetAddress = implJson.result[0].Implementation
    } else {
      return { abi: null, error: 'Could not detect proxy implementation. Try without proxy option.' }
    }
  }

  const url = `${ETHERSCAN_V2_API}?chainid=${chainId}&module=contract&action=getabi&address=${targetAddress}&apikey=${apiKey}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.status === '1' && json.result) {
    return { abi: json.result, implAddress: isProxy ? targetAddress : undefined }
  }
  return { abi: null, error: json.result || json.message || 'Unknown error' }
}

// ── Unified fetch ──

async function fetchAbiFromExplorer(address: string, chainId: number, apiKey: string, isProxy: boolean, source: ChainSource): Promise<{ abi: string | null; error?: string; implAddress?: string }> {
  if (source === 'sourcify') {
    return fetchAbiFromSourcify(address, chainId, isProxy)
  }
  return fetchAbiFromEtherscan(address, chainId, apiKey, isProxy)
}

// ── Fetch ABI Dialog ──

function FetchAbiDialog({ open, onClose, address, onResult, currentChainId, savedApiKey, onSaveApiKey }: {
  open: boolean
  onClose: () => void
  address: string
  onResult: (abi: string) => void
  currentChainId: number
  savedApiKey: string
  onSaveApiKey: (key: string) => void
}) {
  const [fetchAddr, setFetchAddr] = useState(address)
  const [selectedChainId, setSelectedChainId] = useState(currentChainId)
  const [isProxy, setIsProxy] = useState(false)
  const [apiKey, setApiKey] = useState(savedApiKey)
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')

  // Sync from props when dialog opens
  useEffect(() => {
    if (open) {
      setFetchAddr(address)
      setSelectedChainId(currentChainId)
      setApiKey(savedApiKey)
      setError('')
      setResult('')
      setLoading(false)
    }
  }, [open, address, currentChainId, savedApiKey])

  const addrValid = isAddress(fetchAddr)
  const [implAddr, setImplAddr] = useState('')
  const selectedChain = explorerChains.find((c) => c.chainId === selectedChainId)
  const isSourcify = selectedChain?.source === 'sourcify'

  const handleFetch = async () => {
    if (!addrValid) { setError('Invalid address'); return }
    if (!isSourcify && !apiKey.trim()) { setError('API Key is required for Etherscan-based chains'); return }

    // Persist the key
    if (apiKey && apiKey !== savedApiKey) onSaveApiKey(apiKey)

    setLoading(true)
    setError('')
    setResult('')
    setImplAddr('')
    try {
      const { abi, error: apiError, implAddress } = await fetchAbiFromExplorer(fetchAddr, selectedChainId, apiKey, isProxy, selectedChain?.source || 'etherscan')
      if (abi) {
        setResult(abi)
        if (implAddress) setImplAddr(implAddress)
      } else {
        setError(apiError || 'ABI not found.')
      }
    } catch (err) {
      setError('Request failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleUse = () => {
    onResult(result)
    onClose()
  }

  // Mask API key display
  const maskedKey = apiKey ? apiKey.slice(0, 4) + '*'.repeat(Math.max(0, apiKey.length - 8)) + apiKey.slice(-4) : ''

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Fetch ABI from Explorer</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Address */}
          <TextField
            label="Contract Address" size="small" fullWidth
            value={fetchAddr}
            onChange={(e) => setFetchAddr(e.target.value)}
            error={fetchAddr.length > 2 && !addrValid}
            helperText={fetchAddr.length > 2 && !addrValid ? 'Invalid address' : ''}
          />

          {/* Chain selector */}
          <TextField
            select label="Chain" size="small" fullWidth
            value={selectedChainId}
            onChange={(e) => setSelectedChainId(Number(e.target.value))}
          >
            {explorerChains.map((c) => (
              <MenuItem key={c.chainId} value={c.chainId}>
                {c.name} (#{c.chainId}){c.source === 'sourcify' ? ' — Sourcify' : ''}
              </MenuItem>
            ))}
          </TextField>

          {/* Proxy toggle */}
          <FormControlLabel
            control={<Checkbox checked={isProxy} onChange={(e) => setIsProxy(e.target.checked)} size="small" />}
            label={
              <Stack>
                <Typography variant="body2">This is a Proxy contract</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Will auto-detect the implementation address and fetch its ABI
                </Typography>
              </Stack>
            }
          />

          {/* API Key — not needed for Sourcify chains */}
          <TextField
            label="Etherscan API Key" size="small" fullWidth
            disabled={isSourcify}
            type={showKey ? 'text' : 'password'}
            value={isSourcify ? '' : (showKey ? apiKey : (apiKey ? maskedKey : ''))}
            onChange={(e) => { setShowKey(true); setApiKey(e.target.value) }}
            onFocus={() => { if (!showKey) setShowKey(true) }}
            placeholder={isSourcify ? 'Not required for Sourcify chains' : 'Enter your API key'}
            helperText={isSourcify ? 'Sourcify is free and does not require an API key' : (savedApiKey ? 'API key is saved locally' : 'Get a free key from etherscan.io/apis')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowKey(!showKey)} edge="end">
                    {showKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Error */}
          {error && (
            <Typography variant="body2" color="error" sx={{ wordBreak: 'break-word' }}>
              {error}
            </Typography>
          )}

          {/* Result preview */}
          {result && (
            <Box sx={{ bgcolor: 'action.hover', borderRadius: '8px', p: 1.5, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                ABI fetched ({result.length} chars, {JSON.parse(result).length} entries)
                {implAddr && ` — via implementation ${implAddr.slice(0, 10)}...${implAddr.slice(-6)}`}
              </Typography>
              <Typography variant="body2" sx={{
                fontFamily: 'monospace', fontSize: 11, mt: 0.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'text.secondary',
                maxHeight: 140, overflow: 'auto',
              }}>
                {result.slice(0, 500)}{result.length > 500 ? '...' : ''}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
        {result ? (
          <Button variant="contained" onClick={handleUse}
            sx={{ bgcolor: '#48bb78', '&:hover': { bgcolor: '#38a169' } }}
          >
            Use this ABI
          </Button>
        ) : (
          <Button variant="contained" onClick={handleFetch} disabled={loading || !addrValid}
            sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
          >
            {loading ? <><CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} /> Fetching...</> : 'Fetch ABI'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

// ── Main Contract Component ──

export function Contract() {
  const { showSuccess, showError } = useSnackbar()
  const [showAddContract, setShowAddContract] = useState(false)
  const [showEditContract, setShowEditContract] = useState(false)
  const [showFetchDialog, setShowFetchDialog] = useState(false)
  const [fetchTarget, setFetchTarget] = useState<'toolbar' | 'add' | 'edit'>('toolbar')
  const { address, chainId } = useAccount()
  const publicClient = useDynamicPublicClient()
  const walletClient = useDynamicWalletClient()
  const { etherscanApiKey, setEtherscanApiKey } = useThemeStore()
  const { addTx } = useTxHistory()

  const { contract, setContract, addContract, contractList, deleteContract, updateContract } = useContractStore()
  const [scAddr, setScAddr] = useState('0x')
  const [addrError, setAddrError] = useState('')

  const scName = useMemo(() => contract?.name || '', [contract])
  const contractNames = useMemo(() => contractList.map((v) => v.name), [contractList])

  useEffect(() => {
    if (contract?.contract) setScAddr(contract.contract)
  }, [contract])

  const [newContract, setNewContract] = useState({ name: '', contract: '', abi: '' })
  const [editContract, setEditContract] = useState({ name: '', contract: '0x', abi: '' })
  const [isRead, setIsRead] = useState(true)
  const [accessAddr, setAccessAddr] = useState('')
  const [accessAbi, setAccessAbi] = useState<AbiFunction[]>([])
  const [sendLoading, setSendLoading] = useState(false)

  // Validate address on change
  const handleAddrChange = (val: string) => {
    setScAddr(val)
    if (val && val !== '0x' && !isAddress(val)) {
      setAddrError('Invalid address format')
    } else {
      setAddrError('')
    }
  }

  const send = useCallback(async (subAbi: AbiFunction, params: unknown[], payableValue?: string) => {
    try {
      setSendLoading(true)
      if (!walletClient || !address) { showError('Please connect wallet'); return }
      const hash = await walletClient.writeContract({
        address: scAddr as `0x${string}`,
        abi: [subAbi] as Abi,
        functionName: subAbi.name,
        args: params.length > 0 ? params : undefined,
        value: payableValue ? BigInt(payableValue) : 0n,
      })
      showSuccess('Send Tx succeeded: ' + hash)
      addTx({
        hash,
        from: address,
        to: scAddr,
        value: payableValue || '0',
        chainId: chainId!,
        chainName: publicClient?.chain?.name || `Chain ${chainId}`,
        type: 'contract-write',
        description: `${scName}.${subAbi.name}()`,
      })
    } catch (error: unknown) {
      console.error(error)
      showError('Send Tx Failed: ' + (error as Error).message)
    } finally {
      setSendLoading(false)
    }
  }, [walletClient, address, scAddr, chainId, publicClient, scName, showSuccess, showError, addTx])

  // Handle ABI fetch result depending on which context triggered the dialog
  const handleFetchResult = useCallback((abi: string) => {
    if (fetchTarget === 'toolbar') {
      // Update current contract + access
      if (contract.name) {
        updateContract(contract.name, { ...contract, abi, contract: scAddr })
      }
      setAccessAddr(scAddr)
      try { setAccessAbi(JSON.parse(abi)) } catch { /* */ }
      showSuccess('ABI loaded')
    } else if (fetchTarget === 'add') {
      setNewContract((prev) => ({ ...prev, abi }))
    } else if (fetchTarget === 'edit') {
      setEditContract((prev) => ({ ...prev, abi }))
    }
  }, [fetchTarget, contract, scAddr, updateContract, showSuccess])

  // Address for fetch dialog depends on context
  const fetchDialogAddr = fetchTarget === 'add' ? newContract.contract
    : fetchTarget === 'edit' ? editContract.contract
    : scAddr

  // JSON validation helper
  const validateAbiJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json)
      return Array.isArray(parsed)
    } catch {
      return false
    }
  }

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1.5 }}>
          {contractNames.length > 0 && (
            <Autocomplete
              disablePortal options={contractNames} sx={{ width: 240 }}
              renderInput={(params) => <TextField {...params} label="Contract Name" size="small" />}
              onChange={(_, value) => { if (value) setContract(value) }}
              value={scName}
            />
          )}
          <TextField
            size="small" label="Contract Address"
            value={scAddr} onChange={(e) => handleAddrChange(e.target.value)}
            error={!!addrError}
            helperText={addrError}
            sx={{ minWidth: 300 }}
          />
          <Button variant="contained" onClick={() => {
            setAccessAddr(scAddr)
            try { setAccessAbi(JSON.parse(contract.abi)) } catch { showError('Invalid ABI JSON') }
          }} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>
            Access
          </Button>

          <Tooltip title="Fetch ABI from Explorer">
            <IconButton size="small" sx={iconBtnSx}
              onClick={() => { setFetchTarget('toolbar'); setShowFetchDialog(true) }}
            >
              <CloudDownload fontSize="small" />
            </IconButton>
          </Tooltip>

          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Copy ABI">
              <IconButton size="small" sx={iconBtnSx} onClick={() => { copy(contract.abi); showSuccess('ABI copied') }}>
                <FileCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Address">
              <IconButton size="small" sx={iconBtnSx} onClick={() => { copy(scAddr); showSuccess('Address copied') }}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Contract">
              <IconButton size="small" sx={iconBtnSx} onClick={() => setShowAddContract(true)}>
                <AddBox fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Contract">
              <IconButton size="small" sx={iconBtnSx} onClick={() => {
                if (!contract?.name) { showError('No contract selected'); return }
                setEditContract({ name: contract.name, contract: contract.contract || scAddr, abi: contract.abi })
                setShowEditContract(true)
              }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove Contract">
              <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#e85d5d', bgcolor: '#fef2f2' } }} onClick={async () => {
                if (!window.confirm('Are you sure to delete this Contract?')) return
                const ret = await deleteContract(scName)
                if (ret) showSuccess('Contract Deleted')
                else showError('Contract delete failed')
              }}>
                <DeleteForever fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Read / Write toggle */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {['Read Contract', 'Write Contract'].map((label, i) => {
            const active = i === 0 ? isRead : !isRead
            return (
              <Button key={label} size="small" onClick={() => setIsRead(i === 0)}
                sx={{
                  bgcolor: active ? '#eef2ff' : 'transparent',
                  color: active ? '#5b7ff5' : 'text.secondary',
                  fontWeight: active ? 700 : 500,
                  '&:hover': { bgcolor: active ? '#e5ebff' : 'action.hover' },
                }}
              >
                {label}
              </Button>
            )
          })}
        </Stack>
      </Box>

      {/* Panels — both rendered, toggle visibility to preserve state */}
      <Box sx={{ display: isRead ? 'block' : 'none' }}>
        {accessAddr && accessAbi.length > 0 && publicClient && (
          <ContractRead publicClient={publicClient} scAddr={accessAddr} abi={accessAbi} />
        )}
      </Box>
      <Box sx={{ display: !isRead ? 'block' : 'none' }}>
        {accessAddr && accessAbi.length > 0 && (
          <ContractWrite send={send} abi={accessAbi} sendLoading={sendLoading} />
        )}
      </Box>

      {/* Fetch ABI Dialog */}
      <FetchAbiDialog
        open={showFetchDialog}
        onClose={() => setShowFetchDialog(false)}
        address={fetchDialogAddr}
        onResult={handleFetchResult}
        currentChainId={chainId ?? 1}
        savedApiKey={etherscanApiKey}
        onSaveApiKey={setEtherscanApiKey}
      />

      {/* Add Dialog */}
      <Dialog open={showAddContract} onClose={() => setShowAddContract(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Add Contract</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Contract Name" size="small" value={newContract.name} onChange={(e) => setNewContract({ ...newContract, name: e.target.value })} />
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField label="Contract Address" size="small" fullWidth
                placeholder="0x..."
                value={newContract.contract}
                onChange={(e) => setNewContract({ ...newContract, contract: e.target.value })}
                error={newContract.contract.length > 0 && !isAddress(newContract.contract)}
                helperText={newContract.contract.length > 0 && !isAddress(newContract.contract) ? 'Invalid address' : ''}
              />
              <Tooltip title="Fetch ABI from Explorer">
                <IconButton
                  disabled={!isAddress(newContract.contract)}
                  onClick={() => { setFetchTarget('add'); setShowFetchDialog(true) }}
                  sx={{ mt: 0.5 }}
                >
                  <CloudDownload />
                </IconButton>
              </Tooltip>
            </Stack>
            <TextField
              label="Contract ABI" size="small" multiline rows={6}
              value={newContract.abi}
              onChange={(e) => setNewContract({ ...newContract, abi: e.target.value })}
              error={newContract.abi.length > 0 && !validateAbiJson(newContract.abi)}
              helperText={newContract.abi.length > 0 && !validateAbiJson(newContract.abi) ? 'Invalid JSON array' : `${newContract.abi.length} characters`}
              sx={{ '& textarea': { fontFamily: 'monospace', fontSize: 12 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAddContract(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained"
            disabled={!newContract.name || !validateAbiJson(newContract.abi)}
            onClick={async () => {
              await addContract(newContract)
              setShowAddContract(false)
              // Auto-access the new contract
              setScAddr(newContract.contract)
              setAccessAddr(newContract.contract)
              try { setAccessAbi(JSON.parse(newContract.abi)) } catch { /* */ }
              setNewContract({ name: '', contract: '', abi: '' })
            }} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditContract} onClose={() => setShowEditContract(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Contract</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Contract Name" size="small" value={editContract.name} onChange={(e) => setEditContract({ ...editContract, name: e.target.value })} />
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField label="Contract Address" size="small" fullWidth
                value={editContract.contract}
                onChange={(e) => setEditContract({ ...editContract, contract: e.target.value })}
                error={editContract.contract.length > 2 && !isAddress(editContract.contract)}
                helperText={editContract.contract.length > 2 && !isAddress(editContract.contract) ? 'Invalid address' : ''}
              />
              <Tooltip title="Fetch ABI from Explorer">
                <IconButton
                  disabled={!isAddress(editContract.contract)}
                  onClick={() => { setFetchTarget('edit'); setShowFetchDialog(true) }}
                  sx={{ mt: 0.5 }}
                >
                  <CloudDownload />
                </IconButton>
              </Tooltip>
            </Stack>
            <TextField
              label="Contract ABI" size="small" multiline rows={6}
              value={editContract.abi}
              onChange={(e) => setEditContract({ ...editContract, abi: e.target.value })}
              error={editContract.abi.length > 0 && !validateAbiJson(editContract.abi)}
              helperText={editContract.abi.length > 0 && !validateAbiJson(editContract.abi) ? 'Invalid JSON array' : `${editContract.abi.length} characters`}
              sx={{ '& textarea': { fontFamily: 'monospace', fontSize: 12 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowEditContract(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!editContract.name) { showError('Contract Name required'); return }
            if (!validateAbiJson(editContract.abi)) { showError('Contract ABI is not valid JSON array'); return }
            const ok = await updateContract(scName, editContract)
            if (!ok) { showError('Update failed (maybe name already exists)'); return }
            setShowEditContract(false)
            showSuccess('Contract Updated')
            await setContract(editContract.name)
            setScAddr(editContract.contract)
          }} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
