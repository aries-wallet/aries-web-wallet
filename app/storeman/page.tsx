'use client'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useDynamicPublicClient, useDynamicWalletClient } from '@/lib/hooks/use-dynamic-client'
import { formatEther, parseEther, getAddress, type Address } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

const storemanSC = '0x1E7450D5d17338a348C5438546f0b4D0A5fbeaB6' as const

const storemanAbi = [
  {
    name: 'getStoremanInfo', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'wkAddr', type: 'address' }],
    outputs: [{
      name: 'si', type: 'tuple', components: [
        { name: 'sender', type: 'address' },
        { name: 'enodeID', type: 'bytes' },
        { name: 'PK', type: 'bytes' },
        { name: 'wkAddr', type: 'address' },
        { name: 'isWhite', type: 'bool' },
        { name: 'quited', type: 'bool' },
        { name: 'delegatorCount', type: 'uint256' },
        { name: 'delegateDeposit', type: 'uint256' },
        { name: 'partnerCount', type: 'uint256' },
        { name: 'partnerDeposit', type: 'uint256' },
        { name: 'crossIncoming', type: 'uint256' },
        { name: 'slashedCount', type: 'uint256' },
        { name: 'incentivedDelegator', type: 'uint256' },
        { name: 'incentivedDay', type: 'uint256' },
        { name: 'groupId', type: 'bytes32' },
        { name: 'nextGroupId', type: 'bytes32' },
        { name: 'deposit', type: 'uint256' },
        { name: 'incentive', type: 'uint256' },
      ],
    }],
  },
  {
    name: 'getSmDelegatorInfo', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'wkAddr', type: 'address' }, { name: 'delegator', type: 'address' }],
    outputs: [{ name: 'sender', type: 'address' }, { name: 'deposit', type: 'uint256' }, { name: 'incentive', type: 'uint256' }],
  },
  {
    name: 'getSmPartnerInfo', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'wkAddr', type: 'address' }, { name: 'partner', type: 'address' }],
    outputs: [{ name: 'sender', type: 'address' }, { name: 'deposit', type: 'uint256' }],
  },
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

const actionBtnSx = { fontSize: 12, py: 0.5, bgcolor: '#fff', color: '#5b7ff5', border: '1px solid #e2e6ef', '&:hover': { bgcolor: '#eef2ff', borderColor: '#5b7ff5' } }

export default function Storeman() {
  const { address, isConnected } = useAccount()
  const publicClient = useDynamicPublicClient()
  const walletClient = useDynamicWalletClient()
  const { showError } = useSnackbar()

  const [workAddress, setWorkAddress] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('workAddress') || ''
    return ''
  })
  const [info, setInfo] = useState<Record<string, unknown>>({})
  const [delegateInfo, setDelegateInfo] = useState<{ deposit?: bigint; incentive?: bigint }>({})
  const [partnerInfo, setPartnerInfo] = useState<{ deposit?: bigint; claimable?: boolean }>({})
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
        const result = await publicClient.readContract({
          address: storemanSC, abi: storemanAbi, functionName: 'getStoremanInfo', args: [wkAddr],
        })
        setInfo(result)
        if (address) {
          const [, dDeposit, dIncentive] = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmDelegatorInfo', args: [wkAddr, address] })
          setDelegateInfo({ deposit: dDeposit, incentive: dIncentive })
          const [, pDeposit] = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmPartnerInfo', args: [wkAddr, address] })
          const claimable = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'checkCanPartnerClaim', args: [wkAddr, address] })
          setPartnerInfo({ deposit: pDeposit, claimable })
          const partnerCount = Number(result.partnerCount || 0)
          const _partners: Array<{ sender: string; deposit: bigint }> = []
          for (let i = 0; i < partnerCount; i++) {
            const partnerAddr = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmPartnerAddr', args: [wkAddr, BigInt(i)] })
            const [pSender, pDep] = await publicClient.readContract({ address: storemanSC, abi: storemanAbi, functionName: 'getSmPartnerInfo', args: [wkAddr, partnerAddr] })
            _partners.push({ sender: pSender, deposit: pDep })
          }
          setPartners(_partners)
        }
      } catch (e: unknown) { console.log((e as Error).message) }
    }
    func()
  }, [publicClient, workAddress, updater, address, isConnected])

  const fmtEther = (v: unknown) => {
    if (!v) return '0'
    return Number(formatEther(BigInt(String(v)))).toFixed(2)
  }

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
      await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: fn, args: [wkAddr], value: amount })
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
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Wanchain Storeman Monitor</Typography>

        <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
          <TextField fullWidth size="small" label="Work Address" value={workAddress}
            onChange={(e) => { setWorkAddress(e.target.value); localStorage.setItem('workAddress', e.target.value) }}
          />
        </Box>

        {!isConnected && (
          <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#8a94a6' }}>Please connect wallet and switch to Wanchain.</Typography>
          </Box>
        )}

        {isConnected && (
          <Box sx={{ bgcolor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fb' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Deposit</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{fmtEther(info.deposit)} WAN</TableCell>
                  <TableCell><Button size="small" disabled sx={actionBtnSx}>Exit</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Incentive</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{fmtEther(info.incentive)} WAN</TableCell>
                  <TableCell>
                    <Button size="small" sx={actionBtnSx} onClick={async () => {
                      if (!walletClient) return
                      await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'stakeIncentiveClaim', args: [getAddress(workAddress)] })
                      setUpdater(Date.now())
                    }}>Claim</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Delegation</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#8a94a6' }}>All: </Typography><span style={{ fontFamily: 'monospace' }}>{fmtEther(info.delegateDeposit)} WAN</span><br />
                    <Typography variant="caption" sx={{ color: '#8a94a6' }}>My: </Typography><span style={{ fontFamily: 'monospace' }}>{fmtEther(delegateInfo.deposit)} WAN</span><br />
                    <Typography variant="caption" sx={{ color: '#8a94a6' }}>Claimable: </Typography><span style={{ fontFamily: 'monospace' }}>{fmtEther(delegateInfo.incentive)} WAN</span>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Button size="small" sx={actionBtnSx} onClick={() => openDepositDialog('delegate')}>Deposit</Button>
                      <Button size="small" sx={actionBtnSx} onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'delegateIncentiveClaim', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Claim</Button>
                      <Button size="small" sx={actionBtnSx} onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'delegateOut', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Exit</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Delegators</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{String(info.delegatorCount ?? 0)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Partner</TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: '#8a94a6' }}>All: </Typography><span style={{ fontFamily: 'monospace' }}>{fmtEther(info.partnerDeposit)} WAN</span><br />
                    <Typography variant="caption" sx={{ color: '#8a94a6' }}>My: </Typography><span style={{ fontFamily: 'monospace' }}>{fmtEther(partnerInfo.deposit)} WAN</span>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Button size="small" sx={actionBtnSx} onClick={() => openDepositDialog('partner')}>Deposit</Button>
                      <Button size="small" sx={actionBtnSx} disabled={!partnerInfo.claimable} onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'partClaim', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Claim</Button>
                      <Button size="small" sx={actionBtnSx} onClick={async () => {
                        if (!walletClient) return
                        await walletClient.writeContract({ address: storemanSC, abi: storemanAbi, functionName: 'partOut', args: [getAddress(workAddress)] })
                        setUpdater(Date.now())
                      }}>Exit</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Partners</TableCell>
                  <TableCell>
                    <span style={{ fontFamily: 'monospace' }}>{String(info.partnerCount ?? 0)}</span>
                    <Typography component="span" variant="caption" sx={{ ml: 1, color: '#5b7ff5', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => setShowDistribution(!showDistribution)}>
                      Distribution
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Owner</TableCell>
                  <TableCell>
                    {info.sender ? (
                      <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace', color: '#5b7ff5', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => window.open('https://www.wanscan.org/address/' + info.sender)}>
                        {String(info.sender).slice(0, 6) + '...' + String(info.sender).slice(-4)}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {showDistribution && Boolean(info.sender) && (
          <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3, overflow: 'hidden' }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2d3748' }}>Partner Distribution</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ color: '#8a94a6' }}>Total Reward (WAN):</Typography>
                <TextField size="small" variant="standard" value={totalReward}
                  onChange={(e) => { setTotalReward(e.target.value); calcReward(e.target.value) }}
                  sx={{ width: 120 }}
                />
                <Typography component="span" variant="caption" sx={{ color: '#5b7ff5', cursor: 'pointer' }}
                  onClick={() => { const v = fmtEther(info.incentive); setTotalReward(v); calcReward(v) }}>
                  &#8593; use incentive
                </Typography>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fb' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Partner/Staker</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Deposit</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Reward</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#8a94a6', fontSize: 12 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{String(info.sender || '').slice(0, 6) + '...' + String(info.sender || '').slice(-4)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{fmtEther(info.deposit)}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{rewards['staker']}</TableCell>
                    <TableCell>
                      <Button size="small" sx={actionBtnSx} onClick={async () => {
                        if (!walletClient || !window.confirm(`Send ${rewards['staker']} WAN to ${info.sender}?`)) return
                        await walletClient.sendTransaction({ to: info.sender as Address, value: parseEther(String(rewards['staker'])) })
                      }}>Send</Button>
                    </TableCell>
                  </TableRow>
                  {partners.map((partner) => (
                    <TableRow key={partner.sender}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{partner.sender.slice(0, 6) + '...' + partner.sender.slice(-4)}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{formatEther(partner.deposit)}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {rewards[partner.sender]}
                        <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#e85d5d', cursor: 'pointer' }}
                          onClick={() => calcReward(totalReward, partner.sender)}>&#10062;</Typography>
                      </TableCell>
                      <TableCell>
                        <Button size="small" sx={actionBtnSx} onClick={async () => {
                          if (!walletClient || !window.confirm(`Send ${rewards[partner.sender]} WAN to ${partner.sender}?`)) return
                          await walletClient.sendTransaction({ to: partner.sender as Address, value: parseEther(String(rewards[partner.sender])) })
                        }}>Send</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Box>
        )}
      </Stack>

      <Dialog open={depositDialogOpen} onClose={() => setDepositDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3748' }}>
          {depositType === 'delegate' ? 'Delegation' : 'Partner'} Deposit
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8a94a6', mb: 2 }}>
            Balance: {balance} WAN. Min {depositType === 'delegate' ? '100' : '10000'} WAN for first time.
          </Typography>
          <TextField fullWidth size="small" label="Amount in WAN" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDepositDialogOpen(false)} sx={{ color: '#8a94a6' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeposit} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>Deposit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
