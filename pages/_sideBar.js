import { Autocomplete, Button, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, styled, TextField } from "@mui/material"
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AbcIcon from '@mui/icons-material/Abc';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import LinkIcon from '@mui/icons-material/Link';
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";

const Bar = styled("div")`
  height: 100vh;
  width: 300px;
`


export default function SideBar() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [balance, setBalance] = useState('0');
  const router = useRouter();
  
  return <Bar>
    <Head>
      <title>Aries Web Wallet</title>
      <meta name="description" content="Multi-chain EVM Web Wallet" />
      <link rel="icon" href="/favicon.png" />
    </Head>
    <Paper elevation={0} sx={{height: "100vh"}}>
      <Stack spacing={0}>
      <Stack spacing={2} sx={{padding: '20px 15px'}}>
        <Stack spacing={1} direction='row' sx={{padding: '15px'}}>
        {/* <AccountBalanceWalletIcon sx={{marginTop:'-3px'}} /> */}
        <Image src="/favicon.png" width={48} height={48}/>
        <i style={{marginTop:'12px', marginLeft: '15px'}} >Aries Web Wallet</i>
        </Stack>
        <Button variant="outlined">Connect Wallet</Button>
        <TextField size="small" label="Balance" value={balance} />
      </Stack>
      <Divider direction="horizontal" />
        <List>
          <ListItem disablePadding>
            <ListItemButton selected={router.pathname === '/'} onClick={() => setSelectedIndex(-1)} component="a" href="/" >
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={router.pathname === '/smart_contract'} onClick={() => setSelectedIndex(0)} component="a" href="/smart_contract" >
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
              <ListItemText primary="Smart Contract" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 1} onClick={() => setSelectedIndex(1)} component="a" href="/">
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Transaction" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 2} onClick={() => setSelectedIndex(2)} component="a" href="/">
              <ListItemIcon>
                <AbcIcon />
              </ListItemIcon>
              <ListItemText primary="Raw Transaction" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 3} onClick={() => setSelectedIndex(3)} component="a" href="/">
            <ListItemIcon>
                <CurrencyBitcoinIcon />
              </ListItemIcon>
              <ListItemText primary="ERC20" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 4} onClick={() => setSelectedIndex(4)} component="a" href="/">
            <ListItemIcon>
                <CurrencyBitcoinIcon />
              </ListItemIcon>
              <ListItemText primary="ERC721" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={selectedIndex === 5} onClick={() => setSelectedIndex(5)} component="a" href="/">
            <ListItemIcon>
                <CurrencyBitcoinIcon />
              </ListItemIcon>
              <ListItemText primary="ERC1155" />
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
  </Bar>
}