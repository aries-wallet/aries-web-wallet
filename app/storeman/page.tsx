'use client'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { formatEther, parseEther, getAddress, type Address } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

const storemanSC = '0x1E7450D5d17338a348C5438546f0b4D0A5fbeaB6' as const

// Minimal storeman ABI for the functions we use
const storemanAbi = [
  { name: 'getStoremanInfo', type: 'function', stateMutability: 'view', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [{ name: 'sender', type: 'address' }, { name: 'enodeID', type: 'bytes' }, { name: 'PK', type: 'bytes' }, { name: 'nextPK', type: 'bytes' }, { name: 'groupId', type: 'bytes32' }, { name: 'nextGroupId', type: 'bytes32' }, { name: 'incentive', type: 'uint256' }, { name: 'deposit', type: 'uint256' }, { name: 'delegateDeposit', type: 'uint256' }, { name: 'partnerCount', type: 'uint256' }, { name: 'partnerDeposit', type: 'uint256' }, { name: 'delegatorCount', type: 'uint256' }] },
  { name: 'getSmDelegatorInfo', type: 'function', stateMutability: 'view', inputs: [{ name: 'wkAddr', type: 'address' }, { name: 'delegator', type: 'address' }], outputs: [{ name: 'sender', type: 'address' }, { name: 'deposit', type: 'uint256' }, { name: 'incentive', type: 'uint256' }] },
  { name: 'getSmPartnerInfo', type: 'function', stateMutability: 'view', inputs: [{ name: 'wkAddr', type: 'address' }, { name: 'partner', type: 'address' }], outputs: [{ name: 'sender', type: 'address' }, { name: 'deposit', type: 'uint256' }] },
  { name: 'getSmPartnerAddr', type: 'function', stateMutability: 'view', inputs: [{ name: 'wkAddr', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { name: 'checkCanPartnerClaim', type: 'function', stateMutability: 'view', inputs: [{ name: 'wkAddr', type: 'address' }, { name: 'partner', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'stakeIncentiveClaim', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
  { name: 'delegateIn', type: 'function', stateMutability: 'payable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
  { name: 'delegateIncentiveClaim', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
  { name: 'delegateOut', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
  { name: 'partIn', type: 'function', stateMutability: 'payable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
  { name: 'partClaim', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
  { name: 'partOut', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'wkAddr', type: 'address' }], outputs: [] },
] as const

export default function Storeman() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { showError } = useSnackbar()

  const [workAddress, setWorkAddress] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('workAddress') || ''
    return ''
  })
  const [info, setInfo] = useState<Record<string, unknown>>({})
  const [delegateInfo, setDelegateInfo] = useState<Record<string, unknown>>({})
  const [partnerInfo, setPartnerInfo] = useState<Record<string, unknown>>({})
  const [updater, setUpdater] = useState(0)
  const [showDistribution, setShowDistribution] = useState(false)
  const [partners, setPartners] = useState<Array<{ sender: string; deposit: bigint }>>([])
  const [rewards, setRewards] = useState<Record<string, number>>({})
  const [totalReward, setTotalReward] = useState<string>('0')
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [depositType, setDepositType] = useState<'delegate' | 'partner'>('delegate')
  const [depositAmount, setDepositAmount] = useState('')
  const [balance, setBalance] = useState('0')

  useEffect(() => {
    if (!publicClient || !workAddress || !isConnected) return
    const func = async () => {
      try {
        const wkAddr = getAddress(workAddress)
        const result = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getStoremanInfo', args: [wkAddr] }) as unknown as Record<string, unknown>
        setInfo(result)

        if (address) {
          const dInfo = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmDelegatorInfo', args: [wkAddr, address] }) as unknown as Record<string, unknown>
          setDelegateInfo(dInfo)
          const pInfo = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmPartnerInfo', args: [wkAddr, address] }) as unknown as Record<string, unknown>
          const claimable = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'checkCanPartnerClaim', args: [wkAddr, address] })
          setPartnerInfo({ ...pInfo, claimable })

          const partnerCount = Number((result as unknown as { partnerCount: bigint }).partnerCount || 0)
          const _partners: Array<{ sender: string; deposit: bigint }> = []
          for (let i = 0; i < partnerCount; i++) {
            const partnerAddr = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmPartnerAddr', args: [wkAddr, BigInt(i)] }) as Address
            const pi = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmPartnerInfo', args: [wkAddr, partnerAddr] }) as unknown as { sender: string; deposit: bigint }
            _partners.push(pi)
          }
          setPartners(_partners)
        }
      } catch (e: unknown) { console.log((e as Error).message) }
    }
    func()
  }, [publicClient, workAddress, updater, address, isConnected])

  const fmtEther = (v: unknown) => v ? Number(formatEther(BigInt(String(v)))).toFixed(2) : '0'

  const calcReward = (value: string, noRewardAddr?: string) => {
    let total = Number(formatEther(BigInt(String(info.deposit || 0))))
    for (const p of partners) {
      if (p.sender === noRewardAddr) continue
      total += Number(formatEther(p.deposit))
    }
    const _rewards: Record<string, number> = {}
    _rewards['staker'] = Number(value) * Number(formatEther(BigInt(String(info.deposit || 0)))) / total
    for (const p of partners) {
      if (p.sender === noRewardAddr) { _rewards[p.sender] = 0; continue }
      _rewards[p.sender] = Number(value) * Number(formatEther(p.deposit)) / total
    }
    setRewards(_rewards)
  }

  const handleDeposit = async () => {
    if (!walletClient || !publicClient) return
    try {
      const amount = parseEther(depositAmount)
      const wkAddr = getAddress(workAddress)
      const fn = depositType === 'delegate' ? 'delegateIn' : 'partIn'
      const hash = await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: fn, args: [wkAddr], value: amount })
      setUpdater(Date.now())
      setDepositDialogOpen(false)
    } catch (e: unknown) { showError((e as Error).message) }
  }

  const openDepositDialog = async (type: 'delegate' | 'partner') => {
    setDepositType(type)
    setDepositAmount('')
    if (publicClient && address) {
      const bal = await publicClient.getBalance({ address })
      setBalance(Number(formatEther(bal)).toFixed(2))
    }
    setDepositDialogOpen(true)
  }

  return (
    <div style={{ width: '100%', textAlign: 'center', padding: '40px', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={10} sx={{ width: '800px', padding: '20px' }}>
        <h1>Wanchain Storeman Monitor</h1>
        <TextField fullWidth label="Work Address" value={workAddress} onChange={(e) => { setWorkAddress(e.target.value); localStorage.setItem('workAddress', e.target.value) }} />
        <Divider sx={{ margin: '20px' }} />
        {!isConnected && <h1>Please connect wallet and switch to Wanchain.</h1>}
        {isConnected && (
          <Paper elevation={4} sx={{ padding: '10px' }}>
            <Table>
              <TableHead>
                <TableRow><TableCell>Type</TableCell><TableCell>Value</TableCell><TableCell>Action</TableCell></TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Deposit</TableCell>
                  <TableCell>{fmtEther(info.deposit)} WAN</TableCell>
                  <TableCell><Button variant="outlined" fullWidth disabled>Exit</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Incentive</TableCell>
                  <TableCell>{fmtEther(info.incentive)} WAN</TableCell>
                  <TableCell>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      if (!walletClient) return
                      await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'stakeIncentiveClaim', args: [getAddress(workAddress)] })
                      setUpdater(Date.now())
                    }}>Claim</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Delegation</TableCell>
                  <TableCell>
                    <div>All: {fmtEther(info.delegateDeposit)} WAN</div>
                    <div>My: {fmtEther(delegateInfo.deposit)} WAN</div>
                    <div>Claimable: {fmtEther(delegateInfo.incentive)} WAN</div>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={1}>
                      <Button variant="outlined" onClick={() => openDepositDialog('delegate')}>Deposit</Button>
                      <Button variant="outlined" onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'delegateIncentiveClaim', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Claim</Button>
                      <Button variant="outlined" onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'delegateOut', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Exit</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DelegatorCount</TableCell>
                  <TableCell>{String(info.delegatorCount || 0)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell>Partner</TableCell>
                  <TableCell>
                    <div>All: {fmtEther(info.partnerDeposit)} WAN</div>
                    <div>My: {fmtEther(partnerInfo.deposit)} WAN</div>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={1}>
                      <Button variant="outlined" onClick={() => openDepositDialog('partner')}>Deposit</Button>
                      <Button variant="outlined" disabled={!partnerInfo.claimable} onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'partClaim', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Claim</Button>
                      <Button variant="outlined" onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'partOut', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Exit</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PartnerCount</TableCell>
                  <TableCell>
                    {String(info.partnerCount || 0)}
                    &nbsp;&nbsp;<a style={{ cursor: 'pointer' }} onClick={() => setShowDistribution(!showDistribution)}><i><u>Distribution</u></i></a>
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>
                    {info.sender ? (
                      <a style={{ cursor: 'pointer' }} onClick={() => window.open('https://www.wanscan.org/address/' + info.sender)}>
                        {getAddress(String(info.sender)).slice(0, 6) + '...' + getAddress(String(info.sender)).slice(-4)}
                      </a>
                    ) : null}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        )}

        {showDistribution && <Divider sx={{ margin: '20px' }} />}
        {showDistribution && Boolean(info.sender) && (
          <Paper elevation={4} sx={{ padding: '10px', textAlign: 'center' }}>
            <h2>Partner Distribution</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <label>Total Reward(WAN):</label>
              <input type="text" style={{ border: 'none', borderBottom: '1px solid black', outline: 'none', padding: '4px', textAlign: 'center' }} value={totalReward} onChange={(e) => { setTotalReward(e.target.value); calcReward(e.target.value) }} />
              <a style={{ cursor: 'pointer' }} onClick={() => { const v = fmtEther(info.incentive); setTotalReward(v); calcReward(v) }}>&#8593;</a>
            </div>
            <Table>
              <TableHead>
                <TableRow><TableCell>Partner/Staker</TableCell><TableCell>Deposit</TableCell><TableCell>Reward</TableCell><TableCell>Action</TableCell></TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{String(info.sender).slice(0, 6) + '...' + String(info.sender).slice(-4)}</TableCell>
                  <TableCell>{formatEther(BigInt(String(info.deposit || 0)))}</TableCell>
                  <TableCell>{rewards['staker']}</TableCell>
                  <TableCell>
                    <Button onClick={async () => {
                      if (!walletClient || !window.confirm(`Send ${rewards['staker']} WAN to ${info.sender}?`)) return
                      await walletClient.sendTransaction({ to: info.sender as Address, value: parseEther(String(rewards['staker'])) })
                    }}>Send</Button>
                  </TableCell>
                </TableRow>
                {partners.map((partner) => (
                  <TableRow key={partner.sender}>
                    <TableCell>{partner.sender.slice(0, 6) + '...' + partner.sender.slice(-4)}</TableCell>
                    <TableCell>{formatEther(partner.deposit)}</TableCell>
                    <TableCell>{rewards[partner.sender]} <a style={{ cursor: 'pointer' }} onClick={() => calcReward(totalReward, partner.sender)}>&#10062;</a></TableCell>
                    <TableCell>
                      <Button onClick={async () => {
                        if (!walletClient || !window.confirm(`Send ${rewards[partner.sender]} WAN to ${partner.sender}?`)) return
                        await walletClient.sendTransaction({ to: partner.sender as Address, value: parseEther(String(rewards[partner.sender])) })
                      }}>Send</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Paper>

      <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)}>
        <DialogTitle>{depositType === 'delegate' ? 'Delegation' : 'Partner'} Deposit</DialogTitle>
        <DialogContent>
          <p>Balance: {balance} WAN. Min {depositType === 'delegate' ? '100' : '10000'} WAN for first time.</p>
          <TextField fullWidth label="Amount in WAN" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeposit} variant="contained">Deposit</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
