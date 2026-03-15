'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import {
  FaFileContract, FaPaperPlane, FaCoins, FaCode, FaKey, FaRocket, FaTrash, FaExternalLinkAlt,
} from 'react-icons/fa'
import { useTxHistory } from '@/lib/store/tx-history'
import copy from 'copy-to-clipboard'

const quickActions = [
  { path: '/smart-contract', label: 'Smart Contract', icon: FaFileContract, desc: 'Read & write contracts' },
  { path: '/transaction', label: 'Transaction', icon: FaPaperPlane, desc: 'Send transactions' },
  { path: '/token-tools', label: 'Token Tools', icon: FaCoins, desc: 'ERC20/721 operations' },
  { path: '/script', label: 'Script', icon: FaCode, desc: 'Run custom scripts' },
  { path: '/keystore', label: 'Keystore', icon: FaKey, desc: 'Generate & decrypt' },
  { path: '/meme', label: 'MEME Coin', icon: FaRocket, desc: 'Create ERC20 tokens' },
]

const tags = ['EVM', 'Smart Contract', 'ERC20', 'ERC721', 'MetaMask', 'Ledger', 'Trezor', 'Script']

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString()
}

function shortenHash(hash: string) {
  return hash.slice(0, 10) + '...' + hash.slice(-6)
}

export default function Home() {
  const router = useRouter()
  const { history, clearHistory } = useTxHistory()

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 6, px: 3 }}>
      <Stack spacing={1} alignItems="center" sx={{ mb: 5 }}>
        <Image alt="Banner" width={800} height={230} src="/banner.svg" style={{ maxWidth: '100%', height: 'auto' }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 3 }}>
          Welcome to Aries Wallet
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center" sx={{ mt: 1.5 }}>
          {tags.map((tag) => (
            <Box key={tag} sx={{
              px: 1.5, py: 0.4, borderRadius: '20px', fontSize: 12, fontWeight: 600,
              bgcolor: '#eef2ff', color: '#5b7ff5',
            }}>
              {tag}
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2, mb: 5,
      }}>
        {quickActions.map((item) => (
          <Box
            key={item.path}
            onClick={() => router.push(item.path)}
            sx={{
              bgcolor: 'background.paper', borderRadius: '12px', p: 2.5,
              cursor: 'pointer', transition: 'all 0.2s',
              '&:hover': { boxShadow: '0 4px 16px rgba(91,127,245,0.12)', transform: 'translateY(-2px)' },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                width: 40, height: 40, borderRadius: '10px',
                bgcolor: '#eef2ff', color: '#5b7ff5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={18} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Transaction History */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Transactions</Typography>
        {history.length > 0 && (
          <Button size="small" startIcon={<FaTrash size={12} />}
            onClick={() => { if (window.confirm('Clear all transaction history?')) clearHistory() }}
            sx={{ color: 'text.secondary', textTransform: 'none' }}
          >
            Clear
          </Button>
        )}
      </Stack>

      {history.length === 0 ? (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '12px', p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>No transactions yet</Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {history.slice(0, 20).map((tx) => (
            <Box key={tx.id} sx={{
              bgcolor: 'background.paper', borderRadius: '10px', px: 2, py: 1.5,
              display: 'flex', alignItems: 'center', gap: 2,
              '&:hover': { boxShadow: '0 1px 8px rgba(0,0,0,0.04)' },
            }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                bgcolor: tx.type === 'send' ? '#5b7ff5' : tx.type === 'contract-write' ? '#e8853d' : '#48bb78',
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                  {tx.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title="Click to copy full hash">
                    <Typography variant="caption" sx={{
                      fontFamily: 'monospace', color: 'text.secondary', cursor: 'pointer',
                      '&:hover': { color: '#5b7ff5' },
                    }} onClick={() => copy(tx.hash)}>
                      {shortenHash(tx.hash)}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {tx.chainName}
                  </Typography>
                </Stack>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>
                {formatTime(tx.timestamp)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mt: 6 }}>
        Welcome to make any Github Pull Request to this open source web wallet
      </Typography>
    </Box>
  )
}
