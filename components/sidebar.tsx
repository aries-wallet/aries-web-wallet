'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Divider, IconButton, LinearProgress, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, ListItemSecondaryAction, Paper, Stack, TextField, Tooltip, styled,
} from '@mui/material'
import { lighten } from '@mui/material/styles'
import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi'
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

const Bar = styled(Paper)<{ open: boolean }>`
  height: 100vh;
  width: ${(props) => (props.open ? '225px' : '60px')};
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`

const ScrollableSection = styled('div')`
  flex-grow: 1;
  overflow-y: auto;
`

const CompactListItem = styled(ListItem)({ padding: 0 })
const CompactListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  minHeight: 40,
}))
const CompactListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  marginRight: 0,
  marginLeft: theme.spacing(2),
}))

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: '-20px',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  '&:hover': { backgroundColor: theme.palette.action.hover },
  boxShadow: theme.shadows[2],
}))

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
    if (DarkReader.isEnabled()) {
      DarkReader.disable()
    } else {
      DarkReader.enable({ brightness: 100, contrast: 90, sepia: 10 })
    }
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

  const getColorForPercentage = (percent: number) => {
    if (percent < 50) return '#4caf50'
    if (percent < 75) return '#ff9800'
    return '#f44336'
  }

  const balance = balanceData ? Number(balanceData.formatted).toFixed(4) : '0'

  return (
    <Box sx={{ position: 'relative' }}>
      <Bar open={open} elevation={12}>
        <Stack spacing={2} sx={{ padding: '20px 15px' }}>
          <Stack
            spacing={1}
            direction="row"
            sx={{
              justifyContent: open ? 'space-between' : 'center',
              height: '58px',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {open ? (
              <Image
                alt="logo"
                src="/logo.png"
                width={150}
                height={48}
                style={{ cursor: 'pointer', flexShrink: 0 }}
                onClick={() => router.push('/')}
              />
            ) : (
              <IconButton onClick={handleDarkMode} sx={{ width: 40, height: 40, '& svg': { fontSize: 24 } }}>
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
            {open && (
              <IconButton onClick={handleDarkMode} sx={{ flexShrink: 0 }}>
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
          </Stack>

          {open && (
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain
                return (
                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    {!connected ? (
                      <Button
                        variant="contained"
                        onClick={openConnectModal}
                        fullWidth
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Connect Wallet
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={openChainModal}
                          fullWidth
                          size="small"
                          sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                          startIcon={chain.hasIcon && chain.iconUrl ? (
                            <img src={chain.iconUrl} alt={chain.name ?? ''} width={18} height={18} style={{ borderRadius: 4 }} />
                          ) : undefined}
                        >
                          {chain.name ?? 'Unknown'} ({chain.id})
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={openAccountModal}
                          fullWidth
                          size="small"
                          sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                        >
                          {account.displayName}
                        </Button>
                        <TextField
                          size="small"
                          fullWidth
                          label="Balance"
                          value={balance}
                          InputProps={{ readOnly: true }}
                        />
                      </>
                    )}
                  </Stack>
                )
              }}
            </ConnectButton.Custom>
          )}
        </Stack>

        <ScrollableSection>
          <Divider />
          <List>
            {navItems.map((item) => (
              <CompactListItem key={item.path} disablePadding>
                <CompactListItemButton
                  selected={pathname === item.path}
                  onClick={() => router.push(item.path)}
                >
                  <CompactListItemIcon>
                    <item.icon />
                  </CompactListItemIcon>
                  {open && <ListItemText primary={item.label} />}
                </CompactListItemButton>
              </CompactListItem>
            ))}
            {externalLinks.map((item) => (
              <CompactListItem key={item.href} disablePadding>
                <ListItemButton
                  component="a"
                  target="_blank"
                  rel="noreferrer"
                  href={item.href}
                  sx={{ padding: (theme) => theme.spacing(0.5, 1), minHeight: 40 }}
                >
                  <CompactListItemIcon>
                    <item.icon />
                  </CompactListItemIcon>
                  {open && <ListItemText primary={item.label} />}
                </ListItemButton>
              </CompactListItem>
            ))}
          </List>
        </ScrollableSection>

        <Stack spacing={1} sx={{ padding: '10px' }}>
          <Tooltip title="Click to manage localStorage">
            <LinearProgress
              variant="determinate"
              value={storagePercent}
              onClick={handleStorageClick}
              sx={{
                cursor: 'pointer',
                '& .MuiLinearProgress-bar': { backgroundColor: getColorForPercentage(storagePercent) },
                backgroundColor: lighten(getColorForPercentage(storagePercent), 0.5),
              }}
            />
          </Tooltip>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <IconButton onClick={() => window.open('https://x.com/aries_wallet', '_blank')}>
              <FaTwitter />
            </IconButton>
            <IconButton onClick={() => window.open('https://github.com/aries-wallet/aries-web-wallet.git', '_blank')}>
              <FaGithub />
            </IconButton>
            <IconButton onClick={() => window.open('mailto:lolieatapple@gmail.com', '_blank')}>
              <FaEnvelope />
            </IconButton>
            <IconButton onClick={() => window.open('https://cryptodonations.xyz/donate/0x7521eda00e2ce05ac4a9d8353d096ccb970d5188?tag=arieswallet', '_blank')}>
              <FaHeart />
            </IconButton>
          </Stack>
        </Stack>
      </Bar>
      <ToggleButton onClick={() => setOpen(!open)} size="small">
        {open ? <FaChevronLeft /> : <FaBars />}
      </ToggleButton>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Contract List</DialogTitle>
        <DialogContent>
          <DialogContentText>Select contracts to delete. Current contracts: {contractList.length}</DialogContentText>
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <List>
              {contractList.map((c) => (
                <ListItem key={c.name}>
                  <ListItemText primary={c.name || 'Unnamed Contract'} secondary={c.contract || 'No address'} />
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
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSelected} disabled={selectedContracts.length === 0} color="error">
            Delete Selected ({selectedContracts.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
