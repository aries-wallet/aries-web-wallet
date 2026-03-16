'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Box, Button, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import {
  FaFileContract, FaPaperPlane, FaCoins, FaCode, FaKey, FaRocket, FaTrash, FaExternalLinkAlt,
} from 'react-icons/fa'
import { useTxHistory } from '@/lib/store/tx-history'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'
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
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 6, px: 3 }}>
      <Stack spacing={1} alignItems="center" sx={{ mb: 5 }}>
        <Image alt="Banner" width={800} height={230} src="/banner.svg" style={{ maxWidth: '100%', height: 'auto' }} />
        <Typography variant="h4" sx={{
          fontWeight: 800, mt: 3,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          letterSpacing: '-0.02em',
        }}>
          Welcome to Aries Wallet
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="center" sx={{ mt: 1.5, gap: 0.75 }}>
          {tags.map((tag) => (
            <Box key={tag} sx={{
              px: 1.5, py: 0.5, borderRadius: '12px', fontSize: 12, fontWeight: 600,
              color: t.accent,
              boxShadow: shadows.extrudedSmall,
              bgcolor: t.bg,
              transition: 'all 300ms ease-out',
              '&:hover': {
                boxShadow: shadows.extruded,
                transform: 'translateY(-1px)',
              },
            }}>
              {tag}
            </Box>
          ))}
        </Stack>
      </Stack>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{
        fontWeight: 700, mb: 2.5,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
      }}>Quick Actions</Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2.5, mb: 5,
      }}>
        {quickActions.map((item) => (
          <Box
            key={item.path}
            onClick={() => router.push(item.path)}
            sx={{
              bgcolor: t.bg, borderRadius: '24px', p: 3,
              cursor: 'pointer', transition: 'all 300ms ease-out',
              boxShadow: shadows.extruded,
              '&:hover': {
                boxShadow: shadows.extrudedHover,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                width: 44, height: 44, borderRadius: '14px',
                boxShadow: shadows.insetDeep,
                color: t.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={18} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: t.text }}>{item.label}</Typography>
                <Typography variant="caption" sx={{ color: t.textSecondary }}>{item.desc}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Transaction History */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{
          fontWeight: 700,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        }}>Recent Transactions</Typography>
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
        <Box sx={{
          bgcolor: t.bg, borderRadius: '24px', p: 4, textAlign: 'center',
          boxShadow: shadows.inset,
        }}>
          <Typography sx={{ color: t.textSecondary }}>No transactions yet</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {history.slice(0, 20).map((tx) => (
            <Box key={tx.id} sx={{
              bgcolor: t.bg, borderRadius: '16px', px: 2.5, py: 2,
              display: 'flex', alignItems: 'center', gap: 2,
              boxShadow: shadows.extrudedSmall,
              transition: 'all 300ms ease-out',
              '&:hover': {
                boxShadow: shadows.extruded,
                transform: 'translateY(-1px)',
              },
            }}>
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                boxShadow: `inset 2px 2px 4px ${t.shadowDark}, inset -2px -2px 4px ${t.shadowLight}`,
                bgcolor: tx.type === 'send' ? t.accent : tx.type === 'contract-write' ? '#e8853d' : '#38B2AC',
              }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13, color: t.text }}>
                  {tx.description}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title="Click to copy full hash">
                    <Typography variant="caption" sx={{
                      fontFamily: 'monospace', color: t.textSecondary, cursor: 'pointer',
                      transition: 'color 300ms',
                      '&:hover': { color: t.accent },
                    }} onClick={() => copy(tx.hash)}>
                      {shortenHash(tx.hash)}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" sx={{ color: t.textSecondary, opacity: 0.6 }}>
                    {tx.chainName}
                  </Typography>
                </Stack>
              </Box>
              <Typography variant="caption" sx={{ color: t.textSecondary, opacity: 0.6, whiteSpace: 'nowrap' }}>
                {formatTime(tx.timestamp)}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      <Typography variant="body2" sx={{ color: t.textSecondary, textAlign: 'center', mt: 6, opacity: 0.6 }}>
        Welcome to make any Github Pull Request to this open source web wallet
      </Typography>
    </Box>
  )
}
