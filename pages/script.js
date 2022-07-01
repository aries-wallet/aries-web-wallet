import { Button, Divider, Paper, Stack, TextareaAutosize } from "@mui/material";
import { useState } from "react";
import useWallet from './hooks/useWallet';

const template = `
// You can direct use the wallet object to get address and web3 
const func = async () => {
    const address = wallet.address;
    const chainId = wallet.networkId;
    const web3 = wallet.web3;
    const balance = await web3.eth.getBalance(address);
    console.log('Address and chainId', address, chainId);
}

// Run the function above
func();
`

export default function Script() {
  const [code, setCode] = useState(template);
  const { wallet } = useWallet();
  return <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={3}>
    <Button variant="contained" onClick={() => {
      console.log('start run script.');
      const myFunc = new Function('wallet', code);
      myFunc(wallet);
      console.log('finish run script.');
    }}>Run</Button>
    <TextareaAutosize
      fullwidth="true"
      aria-label="minimum height"
      minRows={20}
      style={{ color: '#00cdae', backgroundColor: '#1e1e1e' }}
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />
    <p>* Please check the console output in F12 console window.</p>
    </Stack>
  </Paper>
}

