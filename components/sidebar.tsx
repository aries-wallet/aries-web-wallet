'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, LinearProgress, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, ListItemSecondaryAction, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  FaHome, FaFileContract, FaPaperPlane, FaFileAlt, FaSignature, FaCoins, FaCode,
  FaKey, FaUserFriends, FaMoon, FaSun, FaTwitter, FaGithub, FaEnvelope, FaHeart,
  FaLink, FaChevronLeft, FaBars, FaWallet, FaRocket, FaCubes,
} from 'react-icons/fa'

let DarkReader: typeof import('darkreader') | undefined
if (typeof window !== 'undefined') {
  DarkReader = require('darkreader')
}

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

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balanceData } = useBalance({ address })
  const [open, setOpen] = useState(true)
  const [storagePercent, setStoragePercent] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [contractList, setContractList] = useState<{ name: string; contract: string }[]>([])
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [updateDark, setUpdateDark] = useState(0)

  const isDarkMode = useMemo(() => {
    return DarkReader ? DarkReader.isEnabled() : false
  }, [updateDark])

  const handleDarkMode = () => {
    if (!DarkReader) return
    if (DarkReader.isEnabled()) DarkReader.disable()
    else DarkReader.enable({ brightness: 100, contrast: 90, sepia: 10 })
    setUpdateDark(Date.now())
  }

  useEffect(() => {
    const checkStorage = () => {
      let total = 0
      for (const x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) continue
        total += (localStorage[x].length + x.length) * 2
      }
      setStoragePercent((total * 100) / (1024 * 1024) / 5)
    }
    checkStorage()
    const timer = setInterval(checkStorage, 10000)
    return () => clearInterval(timer)
  }, [])

  const handleStorageClick = () => {
    const data = JSON.parse(localStorage.getItem('aries-web-wallet') || '{}')
    setContractList(data.contractList || [])
    setSelectedContracts([])
    setOpenDialog(true)
  }

  const handleDeleteSelected = () => {
    const data = JSON.parse(localStorage.getItem('aries-web-wallet') || '{}')
    data.contractList = data.contractList.filter(
      (c: { name: string }) => !selectedContracts.includes(c.name)
    )
    localStorage.setItem('aries-web-wallet', JSON.stringify(data))
    setContractList(data.contractList)
    setSelectedContracts([])
  }

  const balance = balanceData ? Number(balanceData.formatted).toFixed(4) : '0'

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{
        height: '100vh',
        width: open ? 225 : 60,
        transition: 'width 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        bgcolor: '#fff',
        borderRight: '1px solid #eef0f4',
      }}>
        <Stack spacing={1.5} sx={{ p: '16px 12px' }}>
          <Stack direction="row" sx={{
            justifyContent: open ? 'space-between' : 'center',
            alignItems: 'center', minHeight: 48,
          }}>
            {open ? (
              <Image alt="logo" src="/logo.svg" width={130} height={60}
                style={{ cursor: 'pointer', flexShrink: 0, marginLeft: 16 }}
                onClick={() => router.push('/')}
              />
            ) : (
              <IconButton onClick={handleDarkMode} size="small">
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
            {open && (
              <Stack direction="column" spacing={0.5} alignItems="center">
                <Stack direction="row" spacing={0.5}>
                  <Box
                    onClick={() => window.open('https://v1.arieswallet.xyz', '_self')}
                    sx={{
                      fontSize: 11, fontWeight: 600, color: '#8a94a6', cursor: 'pointer',
                      px: 0.75, py: 0.25, borderRadius: '4px',
                      '&:hover': { color: '#5b7ff5', bgcolor: '#eef2ff' },
                    }}
                  >V1</Box>
                  <Box sx={{
                    fontSize: 11, fontWeight: 700, color: '#fff', bgcolor: '#5b7ff5',
                    px: 0.75, py: 0.25, borderRadius: '4px',
                  }}>V2</Box>
                </Stack>
                <IconButton onClick={handleDarkMode} size="small" sx={{ color: '#8a94a6' }}>
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </IconButton>
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
                    bgcolor: '#f5f7fb', borderRadius: '10px', p: 1.5,
                    display: 'flex', flexDirection: 'column', gap: 1,
                  }}>
                    {/* Network */}
                    <Box
                      onClick={openChainModal}
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75,
                        cursor: 'pointer', borderRadius: '6px', py: 0.5,
                        '&:hover': { bgcolor: '#eef2ff' },
                      }}
                    >
                      {chain.hasIcon && chain.iconUrl && (
                        <img src={chain.iconUrl} alt="" width={14} height={14} style={{ borderRadius: 3 }} />
                      )}
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2d3748' }}>
                        {chain.name ?? 'Unknown'}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: '#8a94a6' }}>
                        #{chain.id}
                      </Typography>
                    </Box>

                    {/* Address */}
                    <Box
                      onClick={openAccountModal}
                      sx={{
                        display: 'flex', justifyContent: 'center',
                        cursor: 'pointer', borderRadius: '6px', py: 0.25,
                        '&:hover': { bgcolor: '#eef2ff' },
                      }}
                    >
                      <Typography sx={{
                        fontSize: 11, fontFamily: 'monospace', color: '#4a5568',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {account.address.slice(0, 10) + '...' + account.address.slice(-8)}
                      </Typography>
                    </Box>

                    {/* Balance divider + value */}
                    <Box sx={{
                      display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5,
                      borderTop: '1px solid #e8ebf0', pt: 0.75,
                    }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#2d3748' }}>
                        {balance}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: '#8a94a6', fontWeight: 500 }}>
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
                    onClick={() => router.push(item.path)}
                    sx={{
                      borderRadius: '8px', mx: 0.5, minHeight: 38,
                      py: 0.5, px: open ? 1.5 : 1,
                      '&.Mui-selected': { bgcolor: '#eef2ff', color: '#5b7ff5', '&:hover': { bgcolor: '#e5ebff' } },
                      '&:hover': { bgcolor: '#f5f7fb' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: active ? '#5b7ff5' : '#8a94a6', ml: open ? 0 : 0.5 }}>
                      <item.icon size={15} />
                    </ListItemIcon>
                    {open && (
                      <ListItemText primary={item.label}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#5b7ff5' : '#4a5568' }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>

          <Box sx={{ px: 1.5, py: 1 }}>
            <Typography variant="caption" sx={{ color: '#b0b8c9', fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
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
                    '&:hover': { bgcolor: '#f5f7fb' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: '#8a94a6', ml: open ? 0 : 0.5 }}>
                    <item.icon size={15} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText primary={item.label}
                      primaryTypographyProps={{ fontSize: 13, color: '#4a5568' }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Stack spacing={1} sx={{ p: '8px 12px' }}>
          <Tooltip title="Click to manage localStorage" placement="top">
            <LinearProgress
              variant="determinate" value={storagePercent}
              onClick={handleStorageClick}
              sx={{
                cursor: 'pointer', borderRadius: 4, height: 4,
                bgcolor: '#f0f2f5',
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
                sx={{ color: '#b0b8c9', '&:hover': { color: '#5b7ff5', bgcolor: '#eef2ff' } }}
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
          bgcolor: '#fff', border: '1px solid #eef0f4',
          '&:hover': { bgcolor: '#f5f7fb' },
          color: '#8a94a6', fontSize: 12,
        }}
      >
        {open ? <FaChevronLeft size={10} /> : <FaBars size={10} />}
      </IconButton>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#2d3748' }}>Manage Contract List</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#8a94a6' }}>
            Select contracts to delete. Current contracts: {contractList.length}
          </DialogContentText>
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {contractList.map((c) => (
                <ListItem key={c.name} sx={{ borderRadius: '8px', '&:hover': { bgcolor: '#f5f7fb' } }}>
                  <ListItemText
                    primary={c.name || 'Unnamed Contract'}
                    secondary={c.contract || 'No address'}
                    primaryTypographyProps={{ fontWeight: 600, color: '#2d3748', fontSize: 14 }}
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
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#8a94a6' }}>Cancel</Button>
          <Button onClick={handleDeleteSelected} disabled={selectedContracts.length === 0}
            sx={{ bgcolor: '#e85d5d', color: '#fff', '&:hover': { bgcolor: '#d44d4d' }, '&.Mui-disabled': { bgcolor: '#f0f2f5' } }}
          >
            Delete Selected ({selectedContracts.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
