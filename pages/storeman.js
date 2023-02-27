import {
  Button,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useLocalStorageState } from "ahooks";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import useWallet from "./hooks/useWallet";
const storermanABI = require("./storeman.abi.json");

const storemanSC = "0x1E7450D5d17338a348C5438546f0b4D0A5fbeaB6";

export default function Storeman() {
  const { wallet } = useWallet();
  const [workAddress, setWorkAddress] = useLocalStorageState("workAddress", "");
  const [info, setInfo] = useState({});
  const [updater, setUpdater] = useState(0);
  useEffect(() => {
    const func = async () => {
      try {
        console.log("workAddress", ethers.utils.getAddress(workAddress));
        const provider = new ethers.providers.Web3Provider(
          wallet.web3.currentProvider
        );
        const sc = new ethers.Contract(storemanSC, storermanABI, provider);
        const result = await sc.getStoremanInfo(
          ethers.utils.getAddress(workAddress)
        );
        console.log("info", result);
        setInfo(result);
      } catch (error) {
        console.log(error.message);
      }
    };

    func();
  }, [wallet, workAddress, updater]);
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper elevation={10} sx={{ width: "800px", padding: "20px" }}>
        <h1>Wanchain Storeman Monitor</h1>
        <TextField
          fullWidth
          label="Work Address"
          value={workAddress}
          onChange={(e) => setWorkAddress(e.target.value)}
        />
        <Divider sx={{ margin: "20px" }} />
        {
          !wallet.connected && <h1>Please connect wallet and switch to Wanchain.</h1>
        }
        {
          wallet.connected && <Paper elevation={4} sx={{ padding: "10px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Deposit</TableCell>
                  <TableCell>
                    {info.deposit &&
                      ethers.utils.formatEther(info.deposit.toString())}{" "}
                    WAN
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" fullWidth disabled={true}>
                      Exit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Incentive</TableCell>
                  <TableCell>
                    {info.incentive &&
                      ethers.utils.formatEther(info.incentive.toString())}{" "}
                    WAN
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.stakeIncentiveClaim(ethers.utils.getAddress(workAddress)).send({from: wallet.address});
                      setUpdater(Date.now());
                    }} >
                      Claim
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DelegateDeposit</TableCell>
                  <TableCell>
                    {info.delegateDeposit &&
                      ethers.utils.formatEther(
                        info.delegateDeposit.toString()
                      )}{" "}
                    WAN
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      let balance = await web3.eth.getBalance(wallet.address);
                      let amount = prompt("Please enter the amount of WAN to deposit. \nBalance: " + ethers.utils.formatEther(balance) +" WAN", "100");
                      if (!amount) {
                        return;
                      }
                      amount = ethers.utils.parseEther(amount);
                      console.log('amount', amount);
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.delegateIn(ethers.utils.getAddress(workAddress)).send({from: wallet.address, value: amount});
                      setUpdater(Date.now());
                    }} >
                      Deposit
                    </Button>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.delegateIncentiveClaim(ethers.utils.getAddress(workAddress)).send({from: wallet.address});
                      setUpdater(Date.now());
                    }} >
                      Claim
                    </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DelegatorCount</TableCell>
                  <TableCell>
                    {info.delegatorCount && info.delegatorCount.toString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PartnerDeposit</TableCell>
                  <TableCell>
                    {info.partnerDeposit &&
                      ethers.utils.formatEther(
                        info.partnerDeposit.toString()
                      )}{" "}
                    WAN
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PartnerCount</TableCell>
                  <TableCell>
                    {info.partnerCount && info.partnerCount.toString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>
                    {info.sender && ethers.utils.getAddress(info.sender)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        }
      </Paper>
    </div>
  );
}
