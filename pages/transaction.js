import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import useWallet from "./hooks/useWallet";
import { ethers } from "ethers";

export default function SendTransaction() {
  const [toAddr, setToAddr] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  const { wallet } = useWallet();
  const [txHash, setTxHash] = useState('');
  const [txJson, setTxJson] = useState('');
  const [txReceipt, setTxReceipt] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [gasPrice, setGasPrice] = useState('');
  const web3 = wallet && wallet.web3;
  return <div>
    <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={2}>
      <h1>Send Normal Transaction</h1>
      <TextField label="To Address" value={toAddr} onChange={e=>setToAddr(e.target.value)} />
      <TextField label="Value in Ether" value={value} onChange={e=>setValue(e.target.value)} />
      <TextField label="Data" value={data} onChange={e=>setData(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          // if (!toAddr) return;
          // if (!value) return;
          const tx = await web3.eth.sendTransaction({
            from: wallet.address,
            to: toAddr ? toAddr : undefined,
            value: value ? web3.utils.toWei(value) : '0',
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
  <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={2}>
      <h1>Get Transaction Status</h1>
      <TextField label="Transacton Hash" value={txHash} onChange={e=>setTxHash(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          // if (!toAddr) return;
          // if (!value) return;
          const tx = await web3.eth.getTransaction(txHash);
          console.log(tx);
          setTxJson(JSON.stringify(tx, null, 2));

          const _receipt = await web3.eth.getTransactionReceipt(txHash);
          console.log(_receipt);
          setTxReceipt(JSON.stringify(_receipt, null, 2));
        } catch (error) {
          console.error(error);
          window.alert(error.message);
        }
      }}>Get Tx & Receipt</Button>
      <h4>Tx JSON</h4>
      <pre>{txJson}</pre>
      <h4>Tx Receipt</h4>
      <pre>{txReceipt}</pre>
    </Stack>
  </Paper>
  <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
    <Stack spacing={2}>
      <h1>Send Normal Transaction From Private Key</h1>
      <TextField label="Private Key" type="password" value={privateKey} onChange={e=>setPrivateKey(e.target.value)} />
      <TextField label="To Address" value={toAddr} onChange={e=>setToAddr(e.target.value)} />
      <TextField label="Value in Ether" value={value} onChange={e=>setValue(e.target.value)} />
      <TextField label="GasPrice in Gwei" value={gasPrice} onChange={e=>setGasPrice(e.target.value)} />
      <TextField label="Data" value={data} onChange={e=>setData(e.target.value)} />
      <Button variant="contained" color="primary" onClick={async ()=>{
        try {
          if (!web3) return;
          const provider = new ethers.providers.Web3Provider(web3.currentProvider);
          const wallet = new ethers.Wallet(privateKey, provider);
          const tx = await wallet.sendTransaction({
            from: wallet.address,
            to: toAddr ? toAddr : undefined,
            value: value ? ethers.utils.parseEther(value) : '0',
            gasPrice: gasPrice ? gasPrice * 1e9 : undefined,
            data: data
          });
          
          console.log(tx);
          window.alert(`Transaction Hash: ${tx.hash}`);
        } catch (error) {
          console.error(error);
          window.alert(error.message);
        }
      }}>Send</Button>
    </Stack>
  </Paper>
    </div>
}

