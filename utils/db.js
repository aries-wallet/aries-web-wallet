import { Low } from './low';


const dbModal = {
  current: {
    rpc: {
      name: 'Wanchain Mainnet',
      rpcUrl: 'https://gwan-ssl.wandevs.org:56891',
      explorer: 'https://wanscan.org/'
    },
    wallet: {},
    contract: {}
  },
  rpcList: [
    {
      name: 'Wanchain Mainnet',
      rpcUrl: 'https://gwan-ssl.wandevs.org:56891',
      explorer: 'https://wanscan.org/'
    },
    {
      name: 'Wanchain Testnet',
      rpcUrl: 'https://gwan-ssl.wandevs.org:46891',
      explorer: 'https://testnet.wanscan.org/'
    },
    {
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://eth-rpc.gateway.pokt.network',
      explorer: 'https://etherscan.io/'
    },
    {
      name: 'Rinkeby Testnet',
      rpcUrl: 'https://nodes-testnet.wandevs.org/eth',
      explorer: 'https://rinkeby.etherscan.io/'
    },
    {
      name: 'Avalanche Mainnet',
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      explorer: 'https://snowtrace.io/'
    },
    {
      name: 'Avalanche Fuji Testnet',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      explorer: 'https://testnet.snowtrace.io/'
    },
    {
      name: 'Binance Smart Chain Mainnet',
      rpcUrl: 'https://bsc-dataseed1.binance.org',
      explorer: 'https://bscscan.com/'
    },
    {
      name: 'Binance Smart Chain Testnet',
      rpcUrl: 'https://data-seed-prebsc-1-s3.binance.org:8545',
      explorer: 'https://testnet.bscscan.com/'
    },
    {
      name: 'Moonriver',
      rpcUrl: 'https://rpc.api.moonriver.moonbeam.network',
      explorer: 'https://moonriver.moonscan.io/'
    },
    {
      name: 'Moonbase Alpha',
      rpcUrl: 'https://rpc.testnet.moonbeam.network',
      explorer: 'https://moonbase.moonscan.io/'
    },
    {
      name: 'Moonbeam',
      rpcUrl: 'https://rpc.api.moonbeam.network',
      explorer: 'https://moonbeam.moonscan.io/'
    },
  ],
  walletList: [
    // {
    //   name: 'Account 1',
    //   address: '0x4Cf0A877E906DEaD748A41aE7DA8c220E4247D9e',
    //   pk: 'xxxx', // encrypted private key
    // },
  ],
  contractList: [
    {
      name: 'ZooFarming@wanchain',
      contract: '0x4E4Cb1b0b4953EA657EAF29198eD79C22d1a74A2',
      abi: '[{"inputs":[{"internalType":"contract ZooToken","name":"_zoo","type":"address"},{"internalType":"address","name":"_devaddr","type":"address"},{"internalType":"address","name":"_boostingAddr","type":"address"},{"internalType":"uint256","name":"_zooPerBlock","type":"uint256"},{"internalType":"uint256","name":"_startBlock","type":"uint256"},{"internalType":"uint256","name":"_allEndBlock","type":"uint256"},{"internalType":"address","name":"_wanswapFarmingAddr","type":"address"},{"internalType":"address","name":"_waspAddr","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"PID_NOT_SET","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TEAM_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"allEndBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"boostingAddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"devaddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accZooPerShare","type":"uint256"},{"internalType":"uint256","name":"waspPid","type":"uint256"},{"internalType":"uint256","name":"accWaspPerShare","type":"uint256"},{"internalType":"bool","name":"dualFarmingEnable","type":"bool"},{"internalType":"bool","name":"emergencyMode","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalAllocPoint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"userInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"waspRewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wanswapFarming","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wasp","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"zoo","outputs":[{"internalType":"contract ZooToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"zooPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_waspPid","type":"uint256"},{"internalType":"bool","name":"_dualFarmingEnable","type":"bool"}],"name":"setWaspPid","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"withdrawAllFromWasp","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxMultiplier","type":"uint256"}],"name":"setMaxMultiplier","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"poolLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"contract IERC20","name":"_lpToken","type":"address"},{"internalType":"bool","name":"_withUpdate","type":"bool"},{"internalType":"uint256","name":"_waspPid","type":"uint256"},{"internalType":"bool","name":"_dualFarmingEnable","type":"bool"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_from","type":"uint256"},{"internalType":"uint256","name":"_to","type":"uint256"}],"name":"getMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"pendingZoo","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"pendingWasp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"massUpdatePools","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"updatePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"lockTime","type":"uint256"},{"internalType":"uint256","name":"nftTokenId","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"emergencyWithdrawEnable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_devaddr","type":"address"}],"name":"dev","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
    }
  ],
  unlock: '', // check decrypt tauri-wallet = U2FsdGVkX19ZqVilAVmROv4Bn0S2EBEtI1agRYMexpc=
}

class AriesAdapter {
  async read() {
    let str = window.localStorage.getItem('aries-web-wallet');
    return JSON.parse(str);
  }

  async write(obj) {
    window.localStorage.setItem('aries-web-wallet', JSON.stringify(obj));
  }
}

let db;

export const initDb = async () => {
  try {
    console.log('initDb', db);
    if (!db) {
      let adapter = new AriesAdapter();
      console.log('adapter', adapter);
      db = new Low(adapter);
      console.log('db', db);
    }
    await db.read();
    console.log('db2', db);
    if (!db.data) {
      db.data = dbModal;
      await db.write();
    } else {
      if (db.data.unlock !== '') {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.error('error', error);
  }
}

export const getDb = ()=>{
  console.log('db', db);
  return db;
}
