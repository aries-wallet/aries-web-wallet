import {
  Alert,
  Button,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextareaAutosize,
  TextField,
} from "@mui/material";
import { toChecksumOTAddress, generateOTAWaddress } from 'wanchain-util';
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import useWallet from "./hooks/useWallet";
import { LoadingButton } from "@mui/lab";
import { useLocalStorageState } from "ahooks";

const storermanABI = require("./storeman.abi.json");

const multiPrivateTxSC = {
  888: '0x7D02Ec17f20cA4Bf43FD50410aC52a4038a48365',
  999: '0xD8D7fdab0d3ffD305b7ee4b4249405C9F82892A7'
}

const multiPrivateAbi = [
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "otas",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			}
		],
		"name": "send",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
]

function splitAmount(amount) {
  const denominations = [50000, 5000, 1000, 500, 200, 100, 50, 20, 10];
  const result = [];
  let remainingAmount = amount;

  for (const denomination of denominations) {
    const count = Math.floor(remainingAmount / denomination);
    if (count > 0) {
      result.push({ denomination, count });
      remainingAmount -= denomination * count;
    }
  }

  return result;
}

export default function PrivateTx() {
  const { wallet } = useWallet();
  const [updater, setUpdater] = useState(0);
  const [text, setText] = useLocalStorageState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lines, setLines] = useState([]);
  const [total, setTotal] = useState(0);
  const [otas, setOtas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if (!text) {
      setLines([]);
      setError('');
      return;
    }

    try {
      let _lines = text.split('\n');
      _lines = _lines.map(v=>v.trim());
      _lines = _lines.filter(v=>v);
      let total = 0;
      _lines = _lines.map(v=>{
        let two = v.split(',').map(v=>v.trim());
        if (two.length !== 2) {
          throw new Error('FORMAT ERROR: Each line should contain a private address and the amount to be sent, separated by a comma.');
        }
        if (toChecksumOTAddress(two[0]) !== two[0]) {
          throw new Error('FORMAT ERROR: Invalid private address.');
        }
        if (isNaN(two[1])) {
          throw new Error('FORMAT ERROR: Invalid amount.');
        }
        if (two[1] % 10 !== 0) {
          throw new Error('FORMAT ERROR: The amount must be a multiple of 10 WAN.');
        }
        total += parseInt(two[1]);
        return {
          pk: two[0],
          value: two[1],
        }
      });
      console.log('lines', _lines);
      setLines(_lines);
      setTotal(total);
      setError('');
    } catch (error) {
      console.log('error', error);
      setError(error.message);
    }
  }, [text]);

  useEffect(()=>{
    if (lines.length === 0) {
      setOtas([]);
      return;
    }
    let _ota = [];
    setSuccess('');
    try {
      lines.forEach(v=>{
        let values = splitAmount(v.value);
        console.log('split', v.value, values);
        values.forEach(m=>{
          for (let i = 0; i < m.count; i++) {
            console.log('ota push', generateOTAWaddress(v.pk), ethers.utils.parseEther(m.denomination.toString()).toString());
            _ota.push({ota: generateOTAWaddress(v.pk), value: ethers.utils.parseEther(m.denomination.toString())});
          }
        });
      });
      console.log('otas', _ota);
      setOtas(_ota);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  }, [lines]);

  return (
    <Paper elevation={10} sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
      <Stack spacing={3}>

      <h1>Multiple Private Transaction</h1>
      <h4>* Support batch sending of private transactions on Wanchain mainnet and testnet. Each line should contain a private address and the amount to be sent, separated by a comma. The amount must be a multiple of 10 WAN.</h4>
      <h4>* Only Wan Wallet Desktop v1.5.10 or above can receive the file. Please ensure the recipient has upgraded to the corresponding version before sending. If not, the wanOTA_mainnet.json file needs to be manually deleted to trigger a new OTA address scan.</h4>
      <TextareaAutosize
        fullwidth="true"
        aria-label="minimum height"
        minRows={10}
        style={{ color: 'black', backgroundColor: 'white' }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"For example:\n0x03473d7f927e1f17A4D883fc0930FD907cB591EE49e63c0062329F6829928A4714034845729EF3A096ead5Fc5bc4D26CbbAC5209127dBEA2AddaD4184841Db3960B0,100\n0x0387a8Fd94c8Db51BC6741A2f5746FB8aAB6A433117a5d7BA45586aDe5f40ad3Bb02c57a1EF93aD09E8C9AeEeFa61c0cdEB95277BFB7E32A0747F9c778A27E528cd0,200\n0x03473d7f927e1f17A4D883fc0930FD907cB591EE49e63c0062329F6829928A4714034845729EF3A096ead5Fc5bc4D26CbbAC5209127dBEA2AddaD4184841Db3960B0,300"}
      />
      <p>Address Count: {lines.length}, Total WAN: {total}, OTA Count: {otas.length}</p>
      {
        error && <Alert severity="error">{error}</Alert>
      }
      {
        success && <Alert severity="success">{success}</Alert>
      }
      </Stack>
      <LoadingButton disabled={error.length > 0} loading={loading} sx={{marginTop: '40px', width: '120px'}} variant="contained" onClick={async () => {
        try {
          setSuccess('');
          if (otas.length === 0) {
            throw new Error('No valid data.');
          }

          if (!wallet || !wallet.address || !wallet.web3) {
            throw new Error('Please connect to a wallet.');
          }

          let web3 = wallet.web3;
          let chainId = wallet.networkId;

          if ([888, 999].indexOf(Number(chainId)) === -1) {
            throw new Error('Please connect to Wanchain mainnet or testnet.');
          }

          setLoading(true);
          
          let contract = new web3.eth.Contract(multiPrivateAbi, multiPrivateTxSC[Number(chainId)]);
          let tx = await contract.methods.send(otas.map(v=>v.ota), otas.map(v=>v.value)).send({from: wallet.address, value: ethers.utils.parseEther(total.toString())});

          setSuccess('Success! Tx Hash: ' + tx.transactionHash);
          setError('');
        } catch (error) {
          setError(error.message)
        }
        setLoading(false);

      }}>Send</LoadingButton>
    </Paper>
  );
}
