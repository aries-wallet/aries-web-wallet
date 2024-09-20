import { Autocomplete, Button, Divider, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, styled, TextField, Tooltip } from "@mui/material"
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Wallet from "../utils/Wallet";
import useWallet from "./hooks/useWallet";
import IconButton from '@mui/material/IconButton';

// Import React Icons
import { FaHome, FaFileContract, FaPaperPlane, FaFileAlt, FaSignature, FaCoins, FaCode, FaKey, FaUserFriends, FaMoon, FaSun, FaTwitter, FaGithub, FaEnvelope, FaHeart, FaLink, FaChevronLeft, FaBars, FaWallet, FaRocket, FaCubes } from 'react-icons/fa';

let DarkReader;
if (typeof window !== 'undefined') {
  DarkReader = require('darkreader');
}

const Bar = styled(Paper)`
  height: 100vh;
  width: ${props => props.open ? '300px' : '60px'};
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

export default function SideBar() {
  const [balance, setBalance] = useState('0');
  const { wallet, setWallet } = useWallet();
  const [storagePercent, setStoragePercent] = useState(0);
  const router = useRouter();
  const [open, setOpen] = useState(true);

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

  return (
    <Bar open={open} elevation={12}>
      {/* Top section */}
      <Stack spacing={2} sx={{ padding: '20px 15px' }}>
        <Stack spacing={1} direction='row' sx={{padding: '10px 0 10px 25px'}}>
          {open && (
            <Image alt="logo" src="/logo.png" width={180} height={58} style={{cursor:'pointer'}} onClick={()=>{
              window.location.href = '/';
            }}/>
          )}
          <Tooltip title={open ? "Collapse Sidebar" : "Expand Sidebar"}>
            <Button onClick={toggleDrawer}>
              {open ? <FaChevronLeft /> : <FaBars />}
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Dark Mode">
          {
            isDarkMode ? <FaSun onClick={handleDarkMode} style={{cursor:'pointer'}} /> : <FaMoon onClick={handleDarkMode} style={{cursor:'pointer'}} />
          }
          </Tooltip>
          
          </Stack>
          
          {
            wallet.connected && <Button variant="outlined" sx={{textTransform:'none'}} onClick={async ()=>{
              wallet.resetApp().then(()=>{
                wallet.connect();
              });
            }} >{wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4)}</Button>
          }
          {
            !wallet.connected && <Button variant="outlined" onClick={async ()=>{
              wallet.resetApp().then(()=>{
                wallet.connect();
              });
            }}>Connect Wallet</Button>
          }
          
          <TextField size="small" label="ChainId" value={wallet.networkId ? wallet.networkId : 'N/A'} sx={{textAlign:'center'}} InputProps={{
            readOnly: true,
          }} />
          <TextField size="small" label="Balance" value={balance} InputProps={{
            readOnly: true,
          }} />
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
        <LinearProgress variant="determinate" value={storagePercent} />
        <Stack direction="row" justifyContent="center" spacing={2}>
          <IconButton>
            <FaTwitter />
          </IconButton>
          <IconButton>
            <FaGithub />
          </IconButton>
          <IconButton>
            <FaEnvelope />
          </IconButton>
          <IconButton>
            <FaHeart />
          </IconButton>
        </Stack>
      </Stack>
    </Bar>
  )
}