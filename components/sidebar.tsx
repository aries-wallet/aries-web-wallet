'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, LinearProgress, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, ListItemSecondaryAction, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import { useAccount, useBalance } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  FaHome, FaFileContract, FaPaperPlane, FaFileAlt, FaSignature, FaCoins, FaCode,
  FaKey, FaUserFriends, FaMoon, FaSun, FaTwitter, FaGithub, FaEnvelope, FaHeart,
  FaLink, FaChevronLeft, FaBars, FaWallet, FaRocket, FaCubes, FaCog,
} from 'react-icons/fa'
import { useThemeStore } from '@/lib/store/theme-store'
import { dbGetAllContracts, dbDeleteContract } from '@/lib/db'

const navItems = [
  { path: '/', label: 'Home', icon: FaHome },
  { path: '/smart-contract', label: 'Smart Contract', icon: FaFileContract },
  { path: '/transaction', label: 'Transaction', icon: FaPaperPlane },
  { path: '/raw-transaction', label: 'Raw Transaction', icon: FaFileAlt },
  { path: '/sign-message', label: 'Sign Message', icon: FaSignature },
  { path: '/token-tools', label: 'Token Tools', icon: FaCoins },
  { path: '/script', label: 'Script', icon: FaCode },
  { path: '/keystore', label: 'Keystore', icon: FaKey },
  { path: '/storeman', label: 'Wanchain Storeman', icon: FaUserFriends },
  { path: '/meme', label: 'MEME Coin Creation', icon: FaRocket },
  { path: '/create2', label: 'Create2 Deployer', icon: FaCubes },
]

const externalLinks = [
  { href: 'https://analyzer.arieswallet.xyz', label: 'Event Analyzer', icon: FaLink },
  { href: 'https://friend.arieswallet.xyz', label: 'FriendTech Analytics', icon: FaUserFriends },
  { href: 'https://cryptodonations.xyz', label: 'Crypto Donations', icon: FaWallet },
]

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { mode, toggleMode, etherscanApiKey, setEtherscanApiKey } = useThemeStore()
  const isDark = mode === 'dark'

  const [open, setOpen] = useState(true)
  const [storagePercent, setStoragePercent] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [contractList, setContractList] = useState<{ name: string; contract: string }[]>([])
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [storageLabel, setStorageLabel] = useState('')

  useEffect(() => {
    const checkStorage = async () => {
      // Estimate total storage usage (localStorage + IndexedDB + caches)
      if (navigator.storage?.estimate) {
        try {
          const est = await navigator.storage.estimate()
          const used = est.usage || 0
          const quota = est.quota || 1
          const pct = (used / quota) * 100
          setStoragePercent(pct)
          const usedMB = (used / (1024 * 1024)).toFixed(2)
          const quotaMB = (quota / (1024 * 1024)).toFixed(0)
          setStorageLabel(`${usedMB} MB / ${quotaMB} MB`)
          return
        } catch { /* fallback below */ }
      }
      // Fallback: localStorage only
      let total = 0
      for (const x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) continue
        total += (localStorage[x].length + x.length) * 2
      }
      const pct = (total * 100) / (1024 * 1024) / 5
      setStoragePercent(pct)
      setStorageLabel(`${(total / 1024).toFixed(1)} KB (localStorage only)`)
    }
    checkStorage()
    const timer = setInterval(checkStorage, 15000)
    return () => clearInterval(timer)
  }, [])

  const handleStorageClick = async () => {
    try {
      const list = await dbGetAllContracts()
      setContractList(list.map((c) => ({ name: c.name, contract: c.contract })))
    } catch {
      const data = JSON.parse(localStorage.getItem('aries-web-wallet') || '{}')
      setContractList(data.contractList || [])
    }
    setSelectedContracts([])
    setOpenDialog(true)
  }

  const handleDeleteSelected = async () => {
    for (const name of selectedContracts) {
      await dbDeleteContract(name)
    }
    const list = await dbGetAllContracts()
    setContractList(list.map((c) => ({ name: c.name, contract: c.contract })))
    setSelectedContracts([])
  }

  const navigate = (path: string) => {
    router.push(path)
    onNavigate?.()
  }

  const balance = balanceData ? Number(balanceData.formatted).toFixed(6) : '0'

  // Theme-aware colors
  const colors = {
    bg: isDark ? '#1a1d27' : '#fff',
    border: isDark ? '#2d3748' : '#eef0f4',
    navActive: isDark ? '#1e2a4a' : '#eef2ff',
    navHover: isDark ? '#232838' : '#f5f7fb',
    textPrimary: isDark ? '#e2e8f0' : '#2d3748',
    textSecondary: isDark ? '#a0aec0' : '#4a5568',
    textMuted: isDark ? '#718096' : '#8a94a6',
    textFaint: isDark ? '#4a5568' : '#b0b8c9',
    cardBg: isDark ? '#232838' : '#f5f7fb',
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{
        height: '100vh',
        width: open ? 225 : 60,
        transition: 'width 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        bgcolor: colors.bg,
        borderRight: `1px solid ${colors.border}`,
      }}>
        <Stack spacing={1.5} sx={{ p: '16px 12px' }}>
          <Stack direction="row" sx={{
            justifyContent: open ? 'space-between' : 'center',
            alignItems: 'center', minHeight: 48,
          }}>
            {open ? (
              <Image alt="logo" src="/logo.svg" width={130} height={60}
                style={{ cursor: 'pointer', flexShrink: 0, marginLeft: 16, filter: isDark ? 'invert(0.9)' : 'none' }}
                onClick={() => navigate('/')}
              />
            ) : (
              <IconButton onClick={toggleMode} size="small" sx={{ color: colors.textMuted }}>
                {isDark ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
            {open && (
              <Stack direction="column" spacing={0.5} alignItems="center">
                <Stack direction="row" spacing={0.5}>
                  <Box
                    onClick={() => window.open('https://v1.arieswallet.xyz', '_self')}
                    sx={{
                      fontSize: 11, fontWeight: 600, color: colors.textMuted, cursor: 'pointer',
                      px: 0.75, py: 0.25, borderRadius: '4px',
                      '&:hover': { color: '#5b7ff5', bgcolor: colors.navActive },
                    }}
                  >V1</Box>
                  <Box sx={{
                    fontSize: 11, fontWeight: 700, color: '#fff', bgcolor: '#5b7ff5',
                    px: 0.75, py: 0.25, borderRadius: '4px',
                  }}>V2</Box>
                </Stack>
                <Stack direction="row" spacing={0.25}>
                  <IconButton onClick={toggleMode} size="small" sx={{ color: colors.textMuted }}>
                    {isDark ? <FaSun size={12} /> : <FaMoon size={12} />}
                  </IconButton>
                  <IconButton onClick={() => { setApiKeyInput(etherscanApiKey); setSettingsOpen(true) }} size="small" sx={{ color: colors.textMuted }}>
                    <FaCog size={12} />
                  </IconButton>
                </Stack>
              </Stack>
            )}
          </Stack>

          {open && (
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain
                if (!connected) {
                  return (
                    <Button variant="contained" onClick={openConnectModal} fullWidth
                      sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
                    >
                      Connect Wallet
                    </Button>
                  )
                }
                return (
                  <Box sx={{
                    bgcolor: colors.cardBg, borderRadius: '10px', p: 1.5,
                    display: 'flex', flexDirection: 'column', gap: 1,
                  }}>
                    <Box
                      onClick={openChainModal}
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                        cursor: 'pointer', borderRadius: '6px', py: 0.5,
                        '&:hover': { bgcolor: colors.navActive },
                      }}
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img src={chain.iconUrl} alt="" width={14} height={14} style={{ borderRadius: 3 }} />
                      )}
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
                        {chain.name ?? 'Unknown'}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: colors.textMuted }}>
                        #{chain.id}
                      </Typography>
                    </Box>

                    <Box
                      onClick={openAccountModal}
                      sx={{
                        display: 'flex', justifyContent: 'center',
                        cursor: 'pointer', borderRadius: '6px', py: 0.25,
                        '&:hover': { bgcolor: colors.navActive },
                      }}
                    >
                      <Typography sx={{
                        fontSize: 11, fontFamily: 'monospace', color: colors.textSecondary,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {account.address.slice(0, 10) + '...' + account.address.slice(-8)}
                      </Typography>
                    </Box>

                    <Box sx={{
                      display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5,
                      borderTop: `1px solid ${colors.border}`, pt: 0.75,
                    }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: colors.textPrimary }}>
                        {balance}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: colors.textMuted, fontWeight: 500 }}>
                        {balanceData?.symbol ?? 'ETH'}
                      </Typography>
                    </Box>
                  </Box>
                )
              }}
            </ConnectButton.Custom>
          )}
        </Stack>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 0.5 }}>
          <List disablePadding>
            {navItems.map((item) => {
              const active = pathname === item.path
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    selected={active}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '8px', mx: 0.5, minHeight: 38,
                      py: 0.5, px: open ? 1.5 : 1,
                      '&.Mui-selected': { bgcolor: colors.navActive, color: '#5b7ff5', '&:hover': { bgcolor: isDark ? '#243156' : '#e5ebff' } },
                      '&:hover': { bgcolor: colors.navHover },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: active ? '#5b7ff5' : colors.textMuted, ml: open ? 0 : 0.5 }}>
                      <item.icon size={15} />
                    </ListItemIcon>
                    {open && (
                      <ListItemText primary={item.label}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#5b7ff5' : colors.textSecondary }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>

          <Box sx={{ px: 1.5, py: 1 }}>
            <Typography variant="caption" sx={{ color: colors.textFaint, fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
              {open ? 'External' : ''}
            </Typography>
          </Box>

          <List disablePadding>
            {externalLinks.map((item) => (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component="a" target="_blank" rel="noreferrer" href={item.href}
                  sx={{
                    borderRadius: '8px', mx: 0.5, minHeight: 38, py: 0.5, px: open ? 1.5 : 1,
                    '&:hover': { bgcolor: colors.navHover },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: colors.textMuted, ml: open ? 0 : 0.5 }}>
                    <item.icon size={15} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText primary={item.label}
                      primaryTypographyProps={{ fontSize: 13, color: colors.textSecondary }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Stack spacing={1} sx={{ p: '8px 12px' }}>
          <Tooltip title={storageLabel ? `Storage: ${storageLabel} — Click to manage contracts` : 'Click to manage contracts'} placement="top">
            <LinearProgress
              variant="determinate" value={storagePercent}
              onClick={handleStorageClick}
              sx={{
                cursor: 'pointer', borderRadius: 4, height: 4,
                bgcolor: isDark ? '#2d3748' : '#f0f2f5',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: storagePercent < 50 ? '#5b7ff5' : storagePercent < 75 ? '#f0a45d' : '#e85d5d',
                },
              }}
            />
          </Tooltip>
          <Stack direction="row" justifyContent="center" spacing={0.5}>
            {[
              { icon: FaTwitter, url: 'https://x.com/aries_wallet' },
              { icon: FaGithub, url: 'https://github.com/aries-wallet/aries-web-wallet.git' },
              { icon: FaEnvelope, url: 'mailto:lolieatapple@gmail.com' },
              { icon: FaHeart, url: 'https://cryptodonations.xyz/donate/0x7521eda00e2ce05ac4a9d8353d096ccb970d5188?tag=arieswallet' },
            ].map(({ icon: Icon, url }) => (
              <IconButton key={url} size="small" onClick={() => window.open(url, '_blank')}
                sx={{ color: colors.textFaint, '&:hover': { color: '#5b7ff5', bgcolor: colors.navActive } }}
              >
                <Icon size={13} />
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Box>

      <IconButton
        onClick={() => setOpen(!open)} size="small"
        sx={{
          position: 'absolute', top: '50%', right: -14,
          transform: 'translateY(-50%)',
          width: 28, height: 28,
          bgcolor: colors.bg, border: `1px solid ${colors.border}`,
          '&:hover': { bgcolor: colors.navHover },
          color: colors.textMuted, fontSize: 12,
        }}
      >
        {open ? <FaChevronLeft size={10} /> : <FaBars size={10} />}
      </IconButton>

      {/* Manage Contracts Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>Manage Contract List</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Contracts are stored in IndexedDB (no localStorage limit). Select contracts to delete.
            Current contracts: {contractList.length}
          </DialogContentText>
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {contractList.map((c) => (
                <ListItem key={c.name} sx={{ borderRadius: '8px', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemText
                    primary={c.name || 'Unnamed Contract'}
                    secondary={c.contract || 'No address'}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                    secondaryTypographyProps={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      onChange={() =>
                        setSelectedContracts((prev) =>
                          prev.includes(c.name) ? prev.filter((n) => n !== c.name) : [...prev, c.name]
                        )
                      }
                      checked={selectedContracts.includes(c.name)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleDeleteSelected} disabled={selectedContracts.length === 0}
            sx={{ bgcolor: '#e85d5d', color: '#fff', '&:hover': { bgcolor: '#d44d4d' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
          >
            Delete Selected ({selectedContracts.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Etherscan API Key"
              size="small"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="For auto-fetching contract ABIs"
              helperText="Used to fetch ABI from Etherscan, BscScan, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setEtherscanApiKey(apiKeyInput)
            setSettingsOpen(false)
          }} sx={{ bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
