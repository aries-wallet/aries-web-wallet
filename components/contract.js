import { JsonForms } from "@jsonforms/react";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { AddBox, ContentCopy, DeleteForever, Explore, FileCopy } from "@mui/icons-material";
import { MessageBox } from "./message";
import useContract from "../pages/hooks/useContract";
import { ContractRead } from "./ContractRead";
import { ContractWrite } from "./ContractWrite";
import copy from 'copy-to-clipboard';
import { Space } from "antd";
import useWallet from "../pages/hooks/useWallet";

const schemaSCAddress = {
  type: "string",
  title: "Contract Address",
}

export function Contract(props) {
  const [successInfo, setSuccessInfo] = useState('');
  const [errorInfo, setErrorInfo] = useState('');
  const [showAddContract, setShowAddContract] = useState(false);
  const { wallet } = useWallet();

  const {contract, setContract, addContract, contractList, deleteContract } = useContract();
  const [scAddr, setScAddr] = useState('0x');
  const {scName} = useMemo(()=>{
    if (contract && contract.name) {
      return { scName: contract.name };
    } else {
      return { scName: 'empty', scAddr: 'empty' };
    }
  },[contract]);

  useEffect(()=>{
    if (contract) {
      setScAddr(contract.contract);
    }
  }, [contract])

  const listLength = contractList.length;

  const schemaAbi = useMemo(()=>{
    if (contractList && contractList.length > 0) {
      return {
        type: "string",
        title: "Contract ABI",
        enum: contractList.map(v=>v.name),
        listLength
      }
    }
  }, [contractList, listLength]);

  const contractNames = useMemo(()=>{
    if (contractList && listLength > 0) {
      return contractList.map(v=>v.name);
    }
  }, [contractList, listLength])

  const [newContract, setNewContract] = useState({
    name: '',
    address: '0x',
    abi: ''
  });

  const [isRead, setIsRead] = useState(true);
  const [accessAddr, setAccessAddr] = useState('');
  const [accessAbi, setAccessAbi] = useState([]);

  const web3Reader = useMemo(()=>{
    if (wallet && wallet.web3) {
      return wallet.web3;
    }
    return null;
  }, [wallet]);

  const send = useCallback(()=>{
    return async (subAbi, params, payableValue) => {
      try {
        let confirm = await window.confirm("Do you want to send Transaction?", "Transaction Confirm");
        if (!confirm) {
          return;
        }

        try {
          console.log(`Sending Transaction call method: ${subAbi.name} with params: ${params}`);
          let web3 = wallet.web3;
          let sc = new web3.eth.Contract([subAbi], scAddr);
          let nonce = await web3.eth.getTransactionCount(wallet.address);
          console.log('params', params);
          let tx = await sc.methods[subAbi.name](...params).send({from: wallet.address, value: payableValue ? payableValue : 0, nonce: `0x${nonce.toString(16)}`});
          if (tx && tx.status) {
            console.log('Transaction Hash:', tx.transactionHash);
            setSuccessInfo("Send Tx successed");
          } else {
            console.log('tx', tx);
            setErrorInfo("Send Tx Failed");
          }
        } catch (error) {
          console.error(error);
          console.log(error.message);
          setErrorInfo("Send Tx Failed");
        }
      } catch (error) {
        console.error(error);
        console.log(error.message);
        setErrorInfo("Send Tx Failed");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, scAddr]);

  return <div style={{width:'100%', textAlign:'left'}}>
    {/* <Stack spacing={2} direction='row' sx={{height:'40px'}}> */}
    <Space style={{padding:'10px'}}>
      {/* <JsonForms
        renderers={materialRenderers}
        cells={materialCells}
        data={scName}
        onChange={v=>setContract(v.data)}
        schema={schemaAbi}
      /> */}

      <Autocomplete 
        disablePortal
        options={contractNames}
        sx={{width:'260px'}}
        renderInput={(params) => <TextField {...params} label="Contract Name" variant="standard" />}
        onChange={(event, value)=>{
          console.log('onChange', event, value);
          setContract(value);
        }}
        defaultValue={contractNames && contractNames[0]}
      />

     
      <JsonForms
        renderers={materialRenderers}
        cells={materialCells}
        data={scAddr}
        onChange={v=>setScAddr(v.data)}
        schema={schemaSCAddress}
      />
      
      <Divider orientation="vertical" flexItem />
      <Divider orientation="vertical" flexItem />
      <Button variant="contained" onClick={()=>{
        setAccessAddr(scAddr);
        setAccessAbi(JSON.parse(contract.abi));
      }} >Access</Button>
      <Tooltip title="Copy ABI">
        <IconButton size="small" onClick={async ()=>{
          copy(contract.abi);
          console.log('Copy Abi');
          setSuccessInfo("ABI copied");
        }}>
          <FileCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title="Copy Contract Address">
        <IconButton size="small" onClick={async ()=>{
          copy(scAddr);
          console.log('Copy Contract Address');
          setSuccessInfo("Contract Address copied");
        }}>
          <ContentCopy />
        </IconButton>
      </Tooltip>
      <Tooltip title="Add Contract">
        <IconButton size="small" onClick={()=>{
          setShowAddContract(true);
        }}>
          <AddBox />
        </IconButton>
      </Tooltip>
      <Tooltip title="Remove Contract">
        <IconButton size="small" onClick={async ()=>{
          if (! window.confirm("Are you sure to delete this Contract?")) {
            return;
          }
          let ret = await deleteContract(scName);
          if (ret) {
            setSuccessInfo("Contract Deleted");
          } else {
            setErrorInfo("Contract delete failed");
          }
        }} >
          <DeleteForever />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem />
      <Divider orientation="vertical" flexItem />
      <Button variant={isRead ? "outlined" : "text"} onClick={()=>{
        setIsRead(true);
      }} >Read Contract</Button>
      <Button variant={!isRead ? "outlined" : "text"} onClick={()=>{
        setIsRead(false);
      }}>Write Contract</Button>
    {/* </Stack> */}
    </Space>
    {
      console.log("isRead", isRead, accessAddr, accessAbi.length > 0, web3Reader)
    }
    {
      isRead && accessAddr && accessAbi.length > 0 && web3Reader && <ContractRead web3={web3Reader} scAddr={accessAddr} abi={accessAbi} />
    }
    {
      !isRead && accessAddr && accessAbi.length > 0 && web3Reader && <ContractWrite send={send()} scAddr={accessAddr} abi={accessAbi} />
    }
    <Dialog open={showAddContract} onClose={()=>setShowAddContract(false)} fullWidth>
      <DialogTitle color="white">Add Contract</DialogTitle>
      <DialogContent>
        <JsonForms
          renderers={materialRenderers}
          cells={materialCells}
          data={newContract}
          onChange={e=>setNewContract(e.data)}
          schema={{
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: 'Contract Name',
              },
              contract: {
                type: 'string',
                title: 'Contract Address'
              },
              abi: {
                type: 'string',
                title: 'Contract ABI',
              }
            }
          }}
          uischema={
            {
              type: 'VerticalLayout',
              elements: [
                {
                  type: "Control",
                  scope: "#/properties/name",
                },
                {
                  type: "Control",
                  scope: "#/properties/contract",
                },
                {
                  type: "Control",
                  scope: "#/properties/abi",
                  options: {
                    multi: true
                  }
                }
              ]
            }
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={async ()=>{
          await addContract(newContract);
          setShowAddContract(false);
          await setContract(newContract.name);
        }}>Ok</Button>
        <Button onClick={()=>setShowAddContract(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
    <MessageBox successInfo={successInfo} errorInfo={errorInfo} setSuccessInfo={setSuccessInfo} setErrorInfo={setErrorInfo} />
  </div>
  
}