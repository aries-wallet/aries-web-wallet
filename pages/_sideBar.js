import { Autocomplete, Button, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, styled, TextField, Tooltip } from "@mui/material"
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AbcIcon from '@mui/icons-material/Abc';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import GitHubIcon from '@mui/icons-material/GitHub';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import JavascriptIcon from '@mui/icons-material/Javascript';
import LinkIcon from '@mui/icons-material/Link';
import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import Wallet from "../utils/Wallet";
import useWallet from "./hooks/useWallet";

const Bar = styled("div")`
  height: 100vh;
  width: 300px;
`


export default function SideBar() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [balance, setBalance] = useState('0');
  const { wallet, setWallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    async function getBalance() {
      if (wallet && wallet.address && wallet.web3) {
        const balance = await wallet.web3.eth.getBalance(wallet.address);
        setBalance(wallet.web3.utils.fromWei(balance));
      }
    }
    getBalance();
  }, [wallet, wallet.address, wallet.networkId, wallet.web3]);

  return <Bar>
    <Head>
      <title>Aries Web Wallet</title>
      <meta name="description" content="Multi-chain EVM Web Wallet" />
      <link rel="icon" href="/favicon.png" />
    </Head>
    <Paper elevation={12} sx={{height: "100vh"}}>
      <Stack spacing={0}>
      <Stack spacing={2} sx={{padding: '20px 15px'}}>
        <Stack spacing={1} direction='row' sx={{padding: '15px'}}>
        {/* <AccountBalanceWalletIcon sx={{marginTop:'-3px'}} /> */}
        <Image alt="logo" src="/favicon.png" width={48} height={48}/>
        <i style={{marginTop:'12px', marginLeft: '15px'}} >Aries Web Wallet</i>
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
            <ListItemButton component="a" href="https://chainlist.org">
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
      <Tooltip title="Donate">
        <FavoriteBorderIcon onClick={()=>{console.log('donate')}} sx={{cursor: 'pointer'}} />
      </Tooltip>
    </Stack>
  </Bar>
}