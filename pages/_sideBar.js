import { Autocomplete, Button, Divider, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, styled, TextField, Tooltip, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List as MUIList, ListItemSecondaryAction, Checkbox, DialogContentText } from "@mui/material"
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Wallet from "../utils/Wallet";
import useWallet from "./hooks/useWallet";
import { lighten } from '@mui/material/styles';

// Import React Icons
import { FaHome, FaFileContract, FaPaperPlane, FaFileAlt, FaSignature, FaCoins, FaCode, FaKey, FaUserFriends, FaMoon, FaSun, FaTwitter, FaGithub, FaEnvelope, FaHeart, FaLink, FaChevronLeft, FaBars, FaWallet, FaRocket, FaCubes } from 'react-icons/fa';

let DarkReader;
if (typeof window !== 'undefined') {
  DarkReader = require('darkreader');
}

const Bar = styled(Paper)`
  height: 100vh;
  width: ${props => props.open ? '225px' : '60px'}; // Reduced from 300px to 225px, and from 60px to 45px
  transition: width 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`

const ScrollableSection = styled('div')`
  flex-grow: 1;
  overflow-y: auto;
`

const CompactListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
}));

const CompactListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 1), // Reduced horizontal padding
  minHeight: 40,
}));

const CompactListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  marginRight: theme.spacing(0), // Reduce space between icon and text
  marginLeft: theme.spacing(2), // Reduce space between icon and text
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: '-20px',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  boxShadow: theme.shadows[2],
}));

export default function SideBar() {
  const [balance, setBalance] = useState('0');
  const { wallet, setWallet } = useWallet();
  const [storagePercent, setStoragePercent] = useState(0);
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [contractList, setContractList] = useState([]);
  const [selectedContracts, setSelectedContracts] = useState([]);

  useEffect(() => {
    async function getBalance() {
      if (wallet && wallet.address && wallet.web3) {
        const balance = await wallet.web3.eth.getBalance(wallet.address);
        setBalance(wallet.web3.utils.fromWei(balance));
      }
    }
    getBalance();
    let timer = setInterval(getBalance, 10000);
    return () => clearInterval(timer);
  }, [wallet, wallet.address, wallet.networkId, wallet.web3]);

  useEffect(()=>{
    const checkFree = () => {
      var _lsTotal = 0, _xLen, _x;
      for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
      };
      setStoragePercent(_lsTotal * 100 / (1024 * 1024) / 5);
    }
    checkFree();
    let timer = setInterval(checkFree, 10000);
    return () => clearInterval(timer);
  }, []);

  const [updateDark, setUpdateDark] = useState(0);

  const isDarkMode = useMemo(() => {
    return DarkReader ? DarkReader.isEnabled() : false;
  }, [updateDark]);

  const handleDarkMode = () => {
    if (DarkReader) {
      const isEnabled = DarkReader.isEnabled();
      if (isEnabled) {
        DarkReader.disable();
        setUpdateDark(Date.now());
      } else {
        DarkReader.enable({
          brightness: 100,
          contrast: 90,
          sepia: 10
        });
        setUpdateDark(Date.now());
      }
    }
  }

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleStorageClick = () => {
    const ariesWalletData = JSON.parse(localStorage.getItem('aries-web-wallet') || '{}');
    const contracts = ariesWalletData.contractList || [];
    console.log('Loaded contracts:', contracts);
    setContractList(contracts);
    setSelectedContracts([]);
    setOpenDialog(true);
  };

  const handleToggleContract = (address) => {
    console.log('Toggling contract:', address);
    console.log('Current selectedContracts:', selectedContracts);
    
    setSelectedContracts(prev => {
      if (!address) {
        console.error('Invalid address:', address);
        return prev;
      }
      const newSelected = prev.includes(address)
        ? prev.filter(item => item !== address)
        : [...prev, address];
      
      console.log('New selectedContracts:', newSelected);
      return newSelected;
    });
  };

  const handleDeleteSelected = () => {
    const ariesWalletData = JSON.parse(localStorage.getItem('aries-web-wallet') || '{}');
    const updatedContractList = ariesWalletData.contractList.filter(
      contract => !selectedContracts.includes(contract.name)
    );
    ariesWalletData.contractList = updatedContractList;
    localStorage.setItem('aries-web-wallet', JSON.stringify(ariesWalletData));
    setContractList(updatedContractList);
    setSelectedContracts([]);
  };

  // Modify this function to return valid color values
  const getColorForPercentage = (percent) => {
    if (percent < 50) return '#4caf50'; // green
    if (percent < 75) return '#ff9800'; // orange
    return '#f44336'; // red
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Bar open={open} elevation={12}>
        {/* Top section */}
        <Stack spacing={2} sx={{ padding: '20px 15px' }}>
          <Stack 
            spacing={1} 
            direction='row' 
            sx={{
              padding: '10px 0 10px 25px', 
              justifyContent: open ? 'space-between' : 'center',
              height: '58px', // Set a fixed height to match the logo height
              alignItems: 'center'
            }}
          >
            {open ? (
              <Image 
                alt="logo" 
                src="/logo.png" 
                width={180} 
                height={58} 
                style={{cursor:'pointer'}} 
                onClick={() => {
                  window.location.href = '/';
                }}
              />
            ) : (
              <IconButton 
                onClick={handleDarkMode}
                sx={{ 
                  width: '40px', 
                  height: '40px', 
                  '& svg': { fontSize: '24px' } 
                }}
              >
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
            {open && (
              <IconButton onClick={handleDarkMode}>
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </IconButton>
            )}
          </Stack>
          
          {open && (
            <>
              {wallet.connected && (
                <Button 
                  variant="outlined" 
                  sx={{textTransform:'none'}} 
                  onClick={async () => {
                    wallet.resetApp().then(() => {
                      wallet.connect();
                    });
                  }} 
                >
                  {wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4)}
                </Button>
              )}
              {!wallet.connected && (
                <Button 
                  variant="outlined" 
                  onClick={async () => {
                    wallet.resetApp().then(() => {
                      wallet.connect();
                    });
                  }}
                >
                  Connect Wallet
                </Button>
              )}
              
              <TextField 
                size="small" 
                label="ChainId" 
                value={wallet.networkId ? wallet.networkId : 'N/A'} 
                sx={{textAlign:'center'}} 
                InputProps={{
                  readOnly: true,
                }} 
              />
              <TextField 
                size="small" 
                label="Balance" 
                value={balance} 
                InputProps={{
                  readOnly: true,
                }} 
              />
            </>
          )}
          <Wallet wallet={wallet} setWallet={setWallet} />
        </Stack>

        {/* Middle scrollable section */}
        <ScrollableSection>
          <Divider direction="horizontal" />
          <List>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/'} onClick={() => router.push('/')} >
                <CompactListItemIcon>
                  <FaHome />
                </CompactListItemIcon>
                {open && <ListItemText primary="Home" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/smart_contract'} onClick={() => router.push('/smart_contract')} >
                <CompactListItemIcon>
                  <FaFileContract />
                </CompactListItemIcon>
                {open && <ListItemText primary="Smart Contract" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/transaction'} onClick={() => router.push('/transaction')} >
                <CompactListItemIcon>
                  <FaPaperPlane />
                </CompactListItemIcon>
                {open && <ListItemText primary="Transaction" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/raw_transaction'} onClick={() => router.push('/raw_transaction')}>
                <CompactListItemIcon>
                  <FaFileAlt />
                </CompactListItemIcon>
                {open && <ListItemText primary="Raw Transaction" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/sign_message'} onClick={() => router.push('/sign_message')}>
                <CompactListItemIcon>
                  <FaSignature />
                </CompactListItemIcon>
                {open && <ListItemText primary="Sign Message" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/token_tools'} onClick={() => router.push('/token_tools')} >
              <CompactListItemIcon>
                  <FaCoins />
                </CompactListItemIcon>
                {open && <ListItemText primary="Token Tools" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/script'} onClick={() => router.push('/script')} >
              <CompactListItemIcon>
                  <FaCode />
                </CompactListItemIcon>
                {open && <ListItemText primary="Script" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/keystore'} onClick={() => router.push('/keystore')} >
              <CompactListItemIcon>
                  <FaKey />
                </CompactListItemIcon>
                {open && <ListItemText primary="Keystore" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/storeman'} onClick={() => router.push('/storeman')} >
              <CompactListItemIcon>
                  <FaUserFriends />
                </CompactListItemIcon>
                {open && <ListItemText primary="Wanchain Storeman" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/meme'} onClick={() => router.push('/meme')} >
              <CompactListItemIcon>
                  <FaRocket />
                </CompactListItemIcon>
                {open && <ListItemText primary="MEME Coin Creation" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton selected={router.pathname === '/create2'} onClick={() => router.push('/create2')} >
              <CompactListItemIcon>
                  <FaCubes />
                </CompactListItemIcon>
                {open && <ListItemText primary="Create2 Deployer" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton component="a" target="_blank" rel="noreferrer" href="https://analyzer.arieswallet.xyz">
                <CompactListItemIcon>
                  <FaLink />
                </CompactListItemIcon>
                {open && <ListItemText primary="Event Analyzer" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton component="a" target="_blank" rel="noreferrer" href="https://friend.arieswallet.xyz">
                <CompactListItemIcon>
                  <FaUserFriends />
                </CompactListItemIcon>
                {open && <ListItemText primary="FriendTech Analytics" />}
              </CompactListItemButton>
            </CompactListItem>
            <CompactListItem disablePadding>
              <CompactListItemButton component="a" target="_blank" rel="noreferrer" href="https://cryptodonations.xyz">
                <CompactListItemIcon>
                  <FaWallet />
                </CompactListItemIcon>
                {open && <ListItemText primary="Crypto Donations" />}
              </CompactListItemButton>
            </CompactListItem>
          </List>
        </ScrollableSection>

        {/* Bottom fixed section */}
        <Stack spacing={1} sx={{ padding: '10px' }}>
          <Tooltip title="Click to manage localStorage">
            <LinearProgress 
              variant="determinate" 
              value={storagePercent} 
              onClick={handleStorageClick}
              sx={{ 
                cursor: 'pointer',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getColorForPercentage(storagePercent),
                },
                backgroundColor: (theme) => lighten(getColorForPercentage(storagePercent), 0.5),
              }}
            />
          </Tooltip>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <IconButton>
              <FaTwitter onClick={() => window.open('https://x.com/aries_wallet', '_blank')} />
            </IconButton>
            <IconButton>
              <FaGithub onClick={() => window.open('https://github.com/aries-wallet/aries-web-wallet.git', '_blank')} />
            </IconButton>
            <IconButton>
              <FaEnvelope onClick={() => window.open('mailto:lolieatapple@gmail.com', '_blank')} />
            </IconButton>
            <IconButton>
              <FaHeart onClick={() => window.open('https://cryptodonations.xyz/donate/0x7521eda00e2ce05ac4a9d8353d096ccb970d5188?tag=arieswallet', '_blank')} />
            </IconButton>
          </Stack>
        </Stack>
      </Bar>
      <ToggleButton onClick={toggleDrawer} size="small">
        {open ? <FaChevronLeft /> : <FaBars />}
      </ToggleButton>

      {/* Updated Dialog for contractList management */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Contract List</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select contracts to delete. Current contracts: {contractList.length}
          </DialogContentText>
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <MUIList>
              {contractList.map((contract) => (
                <ListItem key={contract.name}>
                  <ListItemText 
                    primary={contract.name || 'Unnamed Contract'} 
                    secondary={contract.contract || 'No address'}
                  />
                  <ListItemSecondaryAction>
                    <Checkbox
                      edge="end"
                      onChange={() => handleToggleContract(contract.name)}
                      checked={selectedContracts.includes(contract.name)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </MUIList>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteSelected} 
            disabled={selectedContracts.length === 0}
            color="error"
          >
            Delete Selected ({selectedContracts.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}