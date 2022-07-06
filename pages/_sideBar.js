import { Autocomplete, Button, Divider, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, styled, TextField, Tooltip } from "@mui/material"
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AbcIcon from '@mui/icons-material/Abc';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import JavascriptIcon from '@mui/icons-material/Javascript';
import LinkIcon from '@mui/icons-material/Link';
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Wallet from "../utils/Wallet";
import useWallet from "./hooks/useWallet";
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';

let DarkReader;
if (typeof window !== 'undefined') {
  DarkReader = require('darkreader');
}

const Bar = styled("div")`
  height: 100vh;
  width: 300px;
`


export default function SideBar() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [balance, setBalance] = useState('0');
  const { wallet, setWallet } = useWallet();
  const [storagePercent, setStoragePercent] = useState(0);
  const router = useRouter();

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
        // console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
      };
      // console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
      // console.log('Percent', _lsTotal * 100 / (1024 * 1024) / 5);
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

  return <Bar>
    <Head>
      <title>Aries Web Wallet</title>
      <meta name="description" content="Multi-chain EVM Web Wallet. [Ethereum] [Myetherwallet] [Wallet] [EVM]" />
      <link rel="icon" href="/favicon.png" />
      <meta itemProp="name" content={'Aries Web Wallet'} />
      <meta itemProp="description" content={'Multi-chain EVM Web Wallet. [Ethereum] [Myetherwallet] [Wallet] [EVM]'} />
      <meta itemProp="image" content={'/smart_contract.png'} />
    </Head>
    <Paper elevation={12} sx={{height: "100vh"}}>
      <Stack spacing={0}>
      <Stack spacing={2} sx={{padding: '20px 15px'}}>
        <Stack spacing={1} direction='row' sx={{padding: '10px 0 10px 25px'}}>
        <Image alt="logo" src="/logo.png" width={180} height={58} style={{cursor:'pointer'}} onClick={()=>{
          window.location.href = '/';
        }}/>
        <Tooltip title="Toggle Dark Mode">
        {
          isDarkMode ? <WbSunnyIcon onClick={handleDarkMode} style={{cursor:'pointer'}} /> : <DarkModeIcon onClick={handleDarkMode} style={{cursor:'pointer'}} />
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
      <Divider direction="horizontal" />
        <List>
          <ListItem disablePadding>
            <ListItemButton selected={router.pathname === '/'} onClick={() => router.push('/')} >
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={router.pathname === '/smart_contract'} onClick={() => router.push('/smart_contract')} >
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
              <ListItemText primary="Smart Contract" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 1} onClick={() => router.push('/transaction')} >
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Transaction" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 2} onClick={() => router.push('/raw_transaction')}>
              <ListItemIcon>
                <AbcIcon />
              </ListItemIcon>
              <ListItemText primary="Raw Transaction" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 3} onClick={() => router.push('/token_tools')} >
            <ListItemIcon>
                <CurrencyBitcoinIcon />
              </ListItemIcon>
              <ListItemText primary="Token Tools" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 3} onClick={() => router.push('/script')} >
            <ListItemIcon>
                <JavascriptIcon />
              </ListItemIcon>
              <ListItemText primary="Script" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton component="a" target="_blank" rel="noreferrer" href="https://chainlist.org">
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText primary="chainlist.org" />
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>
      
    </Paper>
    <Stack spacing={2} direction='row' sx={{marginTop:'-50px', marginLeft:'20px'}}>
      <Tooltip title="GitHub">
        <a target="_blank" rel="noreferrer" href="https://github.com/aries-wallet/aries-web-wallet"><GitHubIcon /></a>
      </Tooltip>
      <Tooltip title="Email">
        <a target="_blank" rel="noreferrer" href="mailto:lolieatapple@gmail.com"><MailOutlineIcon /></a>
      </Tooltip>
      <Tooltip title="Donate">
        <FavoriteBorderIcon onClick={()=>{
          window.alert("Welcome donate any amount of ETH to 0x7521EDa00E2Ce05aC4a9d8353d096CCB970d5188");
        }} sx={{cursor: 'pointer'}} />
      </Tooltip>
      <div>
        LocalStorage
        <LinearProgress variant="determinate" value={storagePercent} />
      </div>
    </Stack>
  </Bar>
}