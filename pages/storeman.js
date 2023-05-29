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
import Swal from 'sweetalert2';

const storermanABI = require("./storeman.abi.json");

const storemanSC = "0x1E7450D5d17338a348C5438546f0b4D0A5fbeaB6";

export default function Storeman() {
  const { wallet } = useWallet();
  const [workAddress, setWorkAddress] = useLocalStorageState("workAddress", "");
  const [info, setInfo] = useState({});
  const [delegateInfo, setDelegateInfo] = useState({});
  const [partnerInfo, setPartnerInfo] = useState({});
  const [updater, setUpdater] = useState(0);
  const [showDistribution, setShowDistribution] = useState(false);
  const [partners, setPartners] = useState([]);
  const [rewards, setRewards] = useState({});
  const [totalReward, setTotalReward] = useState(0);
  const [noRewardAddr, setNoRewardAddr] = useState(-1);
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

        if (wallet.address) {
          const delegateInfo = await sc.getSmDelegatorInfo(
            ethers.utils.getAddress(workAddress),
            wallet.address
          );
          console.log("delegateInfo", delegateInfo);
          setDelegateInfo(delegateInfo);
        }
        if (wallet.address) {
          let partnerInfo = await sc.getSmPartnerInfo(
            ethers.utils.getAddress(workAddress),
            wallet.address
          );
          let claimable = await sc.checkCanPartnerClaim(
            ethers.utils.getAddress(workAddress),
            wallet.address
          );
          console.log("getSmPartnerInfo", partnerInfo);
          setPartnerInfo({
            ...partnerInfo,
            claimable,
          });

          let _partners = [];
          for (let i = 0; i < result.partnerCount; i++) {
            let partner = await sc.getSmPartnerAddr(
              ethers.utils.getAddress(workAddress),
              i
            );
            partnerInfo = await sc.getSmPartnerInfo(
              ethers.utils.getAddress(workAddress),
              partner
            );
            _partners.push(partnerInfo);
          }
          console.log('partners', _partners);
          setPartners(_partners);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    func();
  }, [wallet, workAddress, updater, wallet.address]);

  const calcReward = (value) => {
    let total = Number(ethers.utils.formatEther(info.deposit.toString()));
    for (let i=0; i<partners.length; i++) {
      if (partners[i].sender === noRewardAddr) {
        continue;
      }
      total += Number(ethers.utils.formatEther(partners[i].deposit.toString()));
    }
    console.log('total deposit', total);
    let _rewards = {};
    _rewards['staker'] = Number(value) * Number(ethers.utils.formatEther(info.deposit.toString())) / total;
    for (let i=0; i<partners.length; i++) {
      if (partners[i].sender === noRewardAddr) {
        _rewards[partners[i].sender] = 0;
        continue;
      }
      _rewards[partners[i].sender] = Number(value) * Number(ethers.utils.formatEther(partners[i].deposit.toString())) / total;
    }
    setRewards(_rewards);
  }

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
                      Number(ethers.utils.formatEther(info.incentive.toString())).toFixed(2)}{" "}
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
                  <TableCell>Delegation Amount</TableCell>
                  <TableCell>
                    <Stack direction="column" spacing={1}>
                      <div>
                      All Delegation: {info.delegateDeposit &&
                      Number(ethers.utils.formatEther(
                        info.delegateDeposit.toString()
                      )).toFixed(2)}{" "}
                    WAN
                      </div>
                    <div>
                    My Delegation: {delegateInfo.deposit &&
                      Number(ethers.utils.formatEther(
                        delegateInfo.deposit.toString()
                      )).toFixed(0)}{" "}
                    WAN
                    </div>
                    <div>
                    Claimable Amount: {delegateInfo.incentive &&
                      Number(ethers.utils.formatEther(
                        delegateInfo.incentive.toString()
                      )).toFixed(1)}{" WAN"}
                    </div>
                    
                    </Stack>
                    
                    
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      let balance = await web3.eth.getBalance(wallet.address);
                      let amount = await Swal.fire({
                        title: "Delegation deposit",
                        html: "Please enter the amount of WAN to deposit. <br>Balance: " + Number(ethers.utils.formatEther(balance)).toFixed(2) +" WAN <br> Min 100 WAN for first time.",
                        input: 'text',
                        inputAttributes: {
                          autocapitalize: 'off'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Deposit'
                      })

                      console.log('amount', amount);

                      if (!amount.isConfirmed) {
                        return;
                      }
                      amount = ethers.utils.parseEther(amount.value);
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
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.delegateOut(ethers.utils.getAddress(workAddress)).send({from: wallet.address});
                      setUpdater(Date.now());
                    }} >
                      Exit
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
                  <TableCell>Partner Amount</TableCell>
                  <TableCell>
                  <Stack direction="column" spacing={1}>
                  <div>
                      All Partners Deposit: {info.partnerDeposit &&
                      Number(ethers.utils.formatEther(
                        info.partnerDeposit.toString()
                      )).toFixed(2)}{" "}
                    WAN
                      </div>
                    <div>
                    My Partner Deposit: {partnerInfo.deposit &&
                      Number(ethers.utils.formatEther(
                        partnerInfo.deposit.toString()
                      )).toFixed(0)}{" "}
                    WAN
                    </div>
                    </Stack>
                    
                  </TableCell>
                  <TableCell>
                  <Stack direction="row" spacing={2}>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      let balance = await web3.eth.getBalance(wallet.address);
                      let amount = await Swal.fire({
                        title: "Partner deposit",
                        html: "Please enter the amount of WAN to deposit. <br>Balance: " + Number(ethers.utils.formatEther(balance)).toFixed(2) +" WAN <br> Min 10000 WAN for first time.",
                        input: 'text',
                        inputAttributes: {
                          autocapitalize: 'off'
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Deposit'
                      })

                      console.log('amount', amount);

                      if (!amount.isConfirmed) {
                        return;
                      }
                      amount = ethers.utils.parseEther(amount.value);
                      console.log('amount', amount);
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.partIn(ethers.utils.getAddress(workAddress)).send({from: wallet.address, value: amount});
                      setUpdater(Date.now());
                    }} >
                      Deposit
                    </Button>
                    <Button disabled={!partnerInfo.claimable} variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.partClaim(ethers.utils.getAddress(workAddress)).send({from: wallet.address});
                      setUpdater(Date.now());
                    }} >
                      Claim
                    </Button>
                    <Button variant="outlined" fullWidth onClick={async () => {
                      const web3 = wallet.web3;
                      const sc = new web3.eth.Contract(storermanABI, storemanSC);
                      await sc.methods.partOut(ethers.utils.getAddress(workAddress)).send({from: wallet.address});
                      setUpdater(Date.now());
                    }} >
                      Exit
                    </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PartnerCount</TableCell>
                  <TableCell>
                    {info.partnerCount && info.partnerCount.toString()}
                    &nbsp;&nbsp;<a onClick={()=>{
                      setShowDistribution(!showDistribution);
                    }}><i><u>Distribution</u></i></a>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell>
                    <a onClick={()=>{
                      window.open("https://www.wanscan.org/address/" + info.sender);
                    }}>{info.sender && ethers.utils.getAddress(info.sender).slice(0, 6) + "..." + ethers.utils.getAddress(info.sender).slice(-4)}</a>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        }
        {
          showDistribution && <Divider sx={{ margin: "20px" }} />
        }
        {
          showDistribution && <Paper  elevation={4} sx={{ padding: "10px", textAlign: 'center' }}>
            <h2>Partner Distribution</h2>
            <div style={{display:'flex', alignItems: 'center',justifyContent:'center'}}>
              <label htmlFor="reward">Total Reward(WAN):</label>
              <input type="text" id="reward" placeholder="Enter Reward" style={{
                border: 'none', 
                borderBottom: '1px solid black', 
                outline: 'none', 
                padding: '4px',
                textAlign: 'center'
              }} value={totalReward} onChange={(e) => {
                setTotalReward(e.target.value);
                calcReward(e.target.value);
              }} />
              <a onClick={()=>{
                setTotalReward(Number(ethers.utils.formatEther(info.incentive.toString())).toFixed(2));
                calcReward(Number(ethers.utils.formatEther(info.incentive.toString())).toFixed(2));
              }}>↑</a>
            </div>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Partner/Staker</TableCell>
                  <TableCell>Deposit</TableCell>
                  <TableCell>Reward</TableCell>
                  <TableCell>Operation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{info.sender.slice(0,6)+'...'+info.sender.slice(-4)}</TableCell>
                  <TableCell>{ethers.utils.formatEther(info.deposit.toString())}</TableCell>
                  <TableCell>
                    {rewards['staker']}
                  </TableCell>
                  <TableCell>
                    <Button onClick={async ()=>{
                      if (window.confirm(`Are you sure to send ${rewards['staker']} WAN to ${info.sender} ?`)) {
                        console.log('send to', info.sender);
                        const web3 = wallet.web3;
                        let tx = await web3.eth.sendTransaction({
                          from: wallet.address,
                          to: info.sender,
                          value: ethers.utils.parseEther(rewards['staker'].toString()),
                        });
                        console.log('tx', tx);
                      } else {
                        console.log('cancel');
                      }
                    }}>Send</Button>
                  </TableCell>
                </TableRow>
                {
                  partners.map((partner, index) => {
                    return <TableRow key={partner.sender}>
                      <TableCell>{partner.sender.slice(0,6)+'...'+partner.sender.slice(-4)}</TableCell>
                      <TableCell>{ethers.utils.formatEther(partner.deposit.toString())}</TableCell>
                      <TableCell>
                        {rewards[partner.sender]}
                        &nbsp;&nbsp;<a onClick={()=>{
                          setNoRewardAddr(partner.sender);
                          calcReward(totalReward);
                        }}>❎</a>
                      </TableCell>
                      <TableCell>
                        <Button onClick={async ()=>{
                          if (window.confirm(`Are you sure to send ${rewards[partner.sender]} WAN to ${partner.sender} ?`)) {
                            console.log('send to', partner.sender);
                            const web3 = wallet.web3;
                            let tx = await web3.eth.sendTransaction({
                              from: wallet.address,
                              to: partner.sender,
                              value: ethers.utils.parseEther(rewards[partner.sender].toString()),
                            });
                            console.log('tx', tx);
                          } else {
                            console.log('cancel');
                          }
                        }}>Send</Button>
                      </TableCell>
                    </TableRow>
                  })
                }
              </TableBody>
            </Table>
          </Paper>
        }
      </Paper>
    </div>
  );
}
