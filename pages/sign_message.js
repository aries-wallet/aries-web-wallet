import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import useWallet from "./hooks/useWallet";

export default function RawTransaction() {
  const [data, setData] = useState('');
  const [output, setOutput] = useState('');
  const [addr, setAddr] = useState('');
  const { wallet } = useWallet();
  const web3 = wallet && wallet.web3;
  const address = wallet && wallet.address;
  return <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={2}>
      <h1>Sign Message</h1>
      <TextField  label="Message to Sign" value={data} onChange={e=>setData(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          console.log('start sending signed tx...', data);
          const tx = await web3.eth.personal.sign(web3.utils.utf8ToHex(data), address);
          console.log(tx);
          setOutput(tx);
        } catch (error) {
          console.error(error);
          window.alert(error.message);
        }
      }}>Sign</Button>
      {
        output && <TextField multiline label="Signature Result" value={output} />
      }
    </Stack>
    <div style={{marginTop: '40px', marginBottom: '40px', border: '1px solid gray'}} />
    <Stack spacing={2}>
      <h1>Verify Message Signature</h1>
      <TextField  label="Message to Verify" value={data} onChange={e=>setData(e.target.value)} />
      <TextField  label="Signature to Verify" value={output} onChange={e=>setOutput(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          console.log('start sending signed tx...', data);
          const signerAddress = await web3.eth.personal.ecRecover(web3.utils.utf8ToHex(data), output);
          console.log(signerAddress);
          setAddr(signerAddress);
        } catch (error) {
          console.error(error);
          window.alert(error.message);
        }
      }}>Verify</Button>
      {
        output && <TextField multiline label="Verified Signature Address" value={addr} />
      }
    </Stack>
  </Paper>
}

