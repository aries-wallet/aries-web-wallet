'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import { AddBox, ContentCopy, DeleteForever, Edit, FileCopy } from '@mui/icons-material'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { type Abi, type AbiFunction } from 'viem'
import copy from 'copy-to-clipboard'
import { useContractStore } from '@/lib/store/contract-store'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { ContractRead } from './read'
import { ContractWrite } from './write'

const iconBtnSx = { color: '#8a94a6', '&:hover': { color: '#5b7ff5', bgcolor: '#eef2ff' } }

export function Contract() {
  const { showSuccess, showError } = useSnackbar()
  const [showAddContract, setShowAddContract] = useState(false)
  const [showEditContract, setShowEditContract] = useState(false)
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const { contract, setContract, addContract, contractList, deleteContract, updateContract } = useContractStore()
  const [scAddr, setScAddr] = useState('0x')

  const scName = useMemo(() => contract?.name || '', [contract])
  const contractNames = useMemo(() => contractList.map((v) => v.name), [contractList])

  useEffect(() => {
    if (contract?.contract) setScAddr(contract.contract)
  }, [contract])

  const [newContract, setNewContract] = useState({ name: '', contract: '0x', abi: '' })
  const [editContract, setEditContract] = useState({ name: '', contract: '0x', abi: '' })
  const [isRead, setIsRead] = useState(true)
  const [accessAddr, setAccessAddr] = useState('')
  const [accessAbi, setAccessAbi] = useState<AbiFunction[]>([])

  const send = useCallback(async (subAbi: AbiFunction, params: string[], payableValue?: string) => {
    try {
      if (!walletClient || !address) { showError('Please connect wallet'); return }
      const hash = await walletClient.writeContract({
        address: scAddr as `0x${string}`,
        abi: [subAbi] as Abi,
        functionName: subAbi.name,
        args: params.length > 0 ? params : undefined,
        value: payableValue ? BigInt(payableValue) : 0n,
      })
      showSuccess('Send Tx succeeded: ' + hash)
    } catch (error: unknown) {
      console.error(error)
      showError('Send Tx Failed: ' + (error as Error).message)
    }
  }, [walletClient, address, scAddr, showSuccess, showError])

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 2, mb: 2 }}>
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
            value={scAddr} onChange={(e) => setScAddr(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <Button variant="contained" onClick={() => {
            setAccessAddr(scAddr)
            try { setAccessAbi(JSON.parse(contract.abi)) } catch { showError('Invalid ABI JSON') }
          }} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>
            Access
          </Button>

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
              <IconButton size="small" sx={{ color: '#8a94a6', '&:hover': { color: '#e85d5d', bgcolor: '#fef2f2' } }} onClick={async () => {
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
                  color: active ? '#5b7ff5' : '#8a94a6',
                  fontWeight: active ? 700 : 500,
                  '&:hover': { bgcolor: active ? '#e5ebff' : '#f5f7fb' },
                }}
              >
                {label}
              </Button>
            )
          })}
        </Stack>
      </Box>

      {/* Panels */}
      {isRead && accessAddr && accessAbi.length > 0 && publicClient && (
        <ContractRead publicClient={publicClient} scAddr={accessAddr} abi={accessAbi} />
      )}
      {!isRead && accessAddr && accessAbi.length > 0 && (
        <ContractWrite send={send} abi={accessAbi} />
      )}

      {/* Add Dialog */}
      <Dialog open={showAddContract} onClose={() => setShowAddContract(false)} fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3748' }}>Add Contract</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Contract Name" size="small" value={newContract.name} onChange={(e) => setNewContract({ ...newContract, name: e.target.value })} />
            <TextField label="Contract Address" size="small" value={newContract.contract} onChange={(e) => setNewContract({ ...newContract, contract: e.target.value })} />
            <TextField label="Contract ABI" size="small" multiline rows={4} value={newContract.abi} onChange={(e) => setNewContract({ ...newContract, abi: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAddContract(false)} sx={{ color: '#8a94a6' }}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            await addContract(newContract)
            setShowAddContract(false)
            await setContract(newContract.name)
          }} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditContract} onClose={() => setShowEditContract(false)} fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3748' }}>Edit Contract</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Contract Name" size="small" value={editContract.name} onChange={(e) => setEditContract({ ...editContract, name: e.target.value })} />
            <TextField label="Contract Address" size="small" value={editContract.contract} onChange={(e) => setEditContract({ ...editContract, contract: e.target.value })} />
            <TextField label="Contract ABI" size="small" multiline rows={4} value={editContract.abi} onChange={(e) => setEditContract({ ...editContract, abi: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowEditContract(false)} sx={{ color: '#8a94a6' }}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (!editContract.name) { showError('Contract Name required'); return }
            if (!editContract.contract) { showError('Contract Address required'); return }
            if (!editContract.abi) { showError('Contract ABI required'); return }
            try { JSON.parse(editContract.abi) } catch { showError('Contract ABI is not valid JSON'); return }
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
