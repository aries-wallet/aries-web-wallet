import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import useWallet from "./hooks/useWallet";

export default function RawTransaction() {
  const [data, setData] = useState('');
  const { wallet } = useWallet();
  const web3 = wallet && wallet.web3;
  return <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={2}>
      <h1>Send Raw Transaction</h1>
      <TextField label="Raw Transaction Hex" value={data} onChange={e=>setData(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          console.log('start sending signed tx...', data);
          const tx = await web3.eth.sendSignedTransaction(data);
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

