'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import { AddBox, ContentCopy, DeleteForever, Edit, FileCopy } from '@mui/icons-material'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { type Abi, type AbiFunction } from 'viem'
import copy from 'copy-to-clipboard'
import { useContractStore } from '@/lib/store/contract-store'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { ContractRead } from './read'
import { ContractWrite } from './write'

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
      console.log(`Sending Transaction call method: ${subAbi.name} with params: ${params}`)
      const hash = await walletClient.writeContract({
        address: scAddr as `0x${string}`,
        abi: [subAbi] as Abi,
        functionName: subAbi.name,
        args: params.length > 0 ? params : undefined,
        value: payableValue ? BigInt(payableValue) : 0n,
      })
      console.log('tx hash:', hash)
      showSuccess('Send Tx succeeded: ' + hash)
    } catch (error: unknown) {
      console.error(error)
      showError('Send Tx Failed: ' + (error as Error).message)
    }
  }, [walletClient, address, scAddr, showSuccess, showError])

  return (
    <div style={{ width: '100%', textAlign: 'left' }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ padding: '10px' }}>
        {contractNames.length > 0 && (
          <Autocomplete
            disablePortal
            options={contractNames}
            sx={{ width: '260px' }}
            renderInput={(params) => <TextField {...params} label="Contract Name" variant="standard" />}
            onChange={(_, value) => { if (value) setContract(value) }}
            value={scName}
          />
        )}
        <TextField
          variant="standard"
          label="Contract Address"
          value={scAddr}
          onChange={(e) => setScAddr(e.target.value)}
          sx={{ minWidth: '300px' }}
        />
        <Divider orientation="vertical" flexItem />
        <Button variant="contained" onClick={() => {
          setAccessAddr(scAddr)
          try { setAccessAbi(JSON.parse(contract.abi)) } catch { showError('Invalid ABI JSON') }
        }}>Access</Button>
        <Tooltip title="Copy ABI">
          <IconButton size="small" onClick={() => { copy(contract.abi); showSuccess('ABI copied') }}>
            <FileCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy Contract Address">
          <IconButton size="small" onClick={() => { copy(scAddr); showSuccess('Contract Address copied') }}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add Contract">
          <IconButton size="small" onClick={() => setShowAddContract(true)}>
            <AddBox />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Contract">
          <IconButton size="small" onClick={() => {
            if (!contract?.name) { showError('No contract selected'); return }
            setEditContract({ name: contract.name, contract: contract.contract || scAddr, abi: contract.abi })
            setShowEditContract(true)
          }}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove Contract">
          <IconButton size="small" onClick={async () => {
            if (!window.confirm('Are you sure to delete this Contract?')) return
            const ret = await deleteContract(scName)
            if (ret) showSuccess('Contract Deleted')
            else showError('Contract delete failed')
          }}>
            <DeleteForever />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Button variant={isRead ? 'outlined' : 'text'} onClick={() => setIsRead(true)}>Read Contract</Button>
        <Button variant={!isRead ? 'outlined' : 'text'} onClick={() => setIsRead(false)}>Write Contract</Button>
      </Stack>

      {isRead && accessAddr && accessAbi.length > 0 && publicClient && (
        <ContractRead publicClient={publicClient} scAddr={accessAddr} abi={accessAbi} />
      )}
      {!isRead && accessAddr && accessAbi.length > 0 && (
        <ContractWrite send={send} abi={accessAbi} />
      )}

      <Dialog open={showAddContract} onClose={() => setShowAddContract(false)} fullWidth>
        <DialogTitle>Add Contract</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Contract Name" value={newContract.name} onChange={(e) => setNewContract({ ...newContract, name: e.target.value })} />
            <TextField label="Contract Address" value={newContract.contract} onChange={(e) => setNewContract({ ...newContract, contract: e.target.value })} />
            <TextField label="Contract ABI" multiline rows={4} value={newContract.abi} onChange={(e) => setNewContract({ ...newContract, abi: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={async () => {
            await addContract(newContract)
            setShowAddContract(false)
            await setContract(newContract.name)
          }}>Ok</Button>
          <Button onClick={() => setShowAddContract(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditContract} onClose={() => setShowEditContract(false)} fullWidth>
        <DialogTitle>Edit Contract</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Contract Name" value={editContract.name} onChange={(e) => setEditContract({ ...editContract, name: e.target.value })} />
            <TextField label="Contract Address" value={editContract.contract} onChange={(e) => setEditContract({ ...editContract, contract: e.target.value })} />
            <TextField label="Contract ABI" multiline rows={4} value={editContract.abi} onChange={(e) => setEditContract({ ...editContract, abi: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={async () => {
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
          }}>Ok</Button>
          <Button onClick={() => setShowEditContract(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
