import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import useWallet from "./hooks/useWallet";

export default function SendTransaction() {
  const [toAddr, setToAddr] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  const { wallet } = useWallet();
  const web3 = wallet && wallet.web3;
  return <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={2}>
      <h1>Send Normal Transaction</h1>
      <TextField label="To Address" value={toAddr} onChange={e=>setToAddr(e.target.value)} />
      <TextField label="Value in Ether" value={value} onChange={e=>setValue(e.target.value)} />
      <TextField label="Data" value={data} onChange={e=>setData(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          if (!toAddr) return;
          if (!value) return;
          const tx = await web3.eth.sendTransaction({
            from: wallet.address,
            to: toAddr,
            value: web3.utils.toWei(value),
            data: data
          });
          console.log(tx);
          window.alert(`Transaction Hash: ${tx.transactionHash}`);
        } catch (error) {
          console.error(error);
          window.alert(error.message);
        }
      }}>Send</Button>
    </Stack>
  </Paper>
}

