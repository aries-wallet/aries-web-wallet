import { Button, Paper, Stack, TextField } from "@mui/material";
import { useState } from "react";
import useWallet from "./hooks/useWallet";
import copy from "copy-to-clipboard";
import { Divider, message } from "antd";

const create2Deployer = "0xB278cEa7C413600F14e7eD92600B7AA0B2A86Df5";

const supportedChains = [888, 999, 43114, 43113, 16180, 62831];

export default function Create2Deployer() {
  const [scAddr, setScAddr] = useState("");
  const [finalAddr, setFinalAddr] = useState("");
  const [bytecode, setBytecode] = useState("");
  const [seed, setSeed] = useState("");
  const { wallet } = useWallet();
  const web3 = wallet && wallet.web3;
  const address = wallet && wallet.address;
  const networkId = wallet && wallet.networkId;

  const create2DeployerAbi = [
    {
      inputs: [],
      name: "Create2EmptyBytecode",
      type: "error",
    },
    {
      inputs: [],
      name: "Create2FailedDeployment",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "balance",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "needed",
          type: "uint256",
        },
      ],
      name: "Create2InsufficientBalance",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "deployer",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "addr",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes32",
          name: "salt",
          type: "bytes32",
        },
      ],
      name: "Deployed",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "bytecode",
          type: "bytes",
        },
        {
          internalType: "string",
          name: "seed",
          type: "string",
        },
      ],
      name: "computeAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "bytecode",
          type: "bytes",
        },
        {
          internalType: "string",
          name: "seed",
          type: "string",
        },
      ],
      name: "deploy",
      outputs: [
        {
          internalType: "address",
          name: "addr",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const create2DeployerBytecode =
    "6080604052348015600f57600080fd5b506106bf8061001f6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063898176b61461003b578063d0c358731461006b575b600080fd5b610055600480360381019061005091906104a9565b61009b565b6040516100629190610562565b60405180910390f35b610085600480360381019061008091906104a9565b6100e1565b6040516100929190610562565b60405180910390f35b600080826040516020016100af91906105ee565b6040516020818303038152906040528051906020012090506100d8818580519060200120610172565b91505092915050565b600080826040516020016100f591906105ee565b60405160208183030381529060405280519060200120905061011960008286610187565b91503373ffffffffffffffffffffffffffffffffffffffff167f8a667a762c6b11836243ef58bb98850c7a4210d0226eb030bb2e03e3b7cc01e3838360405161016392919061061e565b60405180910390a25092915050565b600061017f838330610283565b905092915050565b6000834710156101d05747846040517fe4bbecac0000000000000000000000000000000000000000000000000000000081526004016101c7929190610660565b60405180910390fd5b600082510361020b576040517f4ca249dc00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8282516020840186f59050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361027c576040517f741752c200000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b9392505050565b6000604051836040820152846020820152828152600b810160ff815360558120925050509392505050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610315826102cc565b810181811067ffffffffffffffff82111715610334576103336102dd565b5b80604052505050565b60006103476102ae565b9050610353828261030c565b919050565b600067ffffffffffffffff821115610373576103726102dd565b5b61037c826102cc565b9050602081019050919050565b82818337600083830152505050565b60006103ab6103a684610358565b61033d565b9050828152602081018484840111156103c7576103c66102c7565b5b6103d2848285610389565b509392505050565b600082601f8301126103ef576103ee6102c2565b5b81356103ff848260208601610398565b91505092915050565b600067ffffffffffffffff821115610423576104226102dd565b5b61042c826102cc565b9050602081019050919050565b600061044c61044784610408565b61033d565b905082815260208101848484011115610468576104676102c7565b5b610473848285610389565b509392505050565b600082601f8301126104905761048f6102c2565b5b81356104a0848260208601610439565b91505092915050565b600080604083850312156104c0576104bf6102b8565b5b600083013567ffffffffffffffff8111156104de576104dd6102bd565b5b6104ea858286016103da565b925050602083013567ffffffffffffffff81111561050b5761050a6102bd565b5b6105178582860161047b565b9150509250929050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061054c82610521565b9050919050565b61055c81610541565b82525050565b60006020820190506105776000830184610553565b92915050565b600081519050919050565b600081905092915050565b60005b838110156105b1578082015181840152602081019050610596565b60008484015250505050565b60006105c88261057d565b6105d28185610588565b93506105e2818560208601610593565b80840191505092915050565b60006105fa82846105bd565b915081905092915050565b6000819050919050565b61061881610605565b82525050565b60006040820190506106336000830185610553565b610640602083018461060f565b9392505050565b6000819050919050565b61065a81610647565b82525050565b60006040820190506106756000830185610651565b6106826020830184610651565b939250505056fea2646970667358221220e20abd331fca25ab4a6dc5765d2c80361067e2f87393f9aa2cc58431e96f96d064736f6c634300081a0033"; // Add the bytecode of the ERC20 contract here

  return (
    <Paper sx={{ padding: "30px", margin: "50px", overflow: "auto" }}>
      <Stack spacing={2}>
        <h1>Create2 Deployer</h1>
        <h2>
          Deploy contracts with the same address across multiple blockchains
          using CREATE2.
        </h2>
        <h2>
          We are using Create2Deployer contract:
          https://github.com/lolieatapple/create2-same-address.git
        </h2>
        <h2>
          Step1. Input Your contract bytecode and seeds to query deploy address;
        </h2>
        <h2>Step2. Click deploy button to finish the deployment;</h2>
        {/* <Button variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={async () => {
            try {
              if (!web3 || !address) return;
              const contract = new web3.eth.Contract(create2DeployerAbi);
              const deploy = contract.deploy({
                data: create2DeployerBytecode,
              });
              const gas = await deploy.estimateGas({ from: address });
              const tx = await deploy.send({ from: address, gas });
              console.log('Contract deployed at address:', tx.options.address);
              message.success('Contract deployed Create2Deployer at address: ' + tx.options.address, 60);
            } catch (error) {
              console.error(error);
              window.alert(error.message);
            }
          }}
        >Step1. Deploy Create2Deployer Contract</Button> */}
        {supportedChains.includes(networkId) && (
          <Stack spacing={2}>
            <TextField
              label="Bytecode start with 0x"
              placeholder="0x66331231231234..."
              value={bytecode}
              onChange={(e) => setBytecode(e.target.value)}
            />
            <TextField
              label="Seed"
              placeholder="hello world 123"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={async () => {
                try {
                  if (!web3 || !address) return;
                  const contract = new web3.eth.Contract(
                    create2DeployerAbi,
                    create2Deployer
                  );
                  const addr = await contract.methods
                    .computeAddress(bytecode, seed)
                    .call({ from: address });
                  console.log("Deploy address:", addr);
                  setScAddr(addr);
                } catch (error) {
                  console.error(error);
                  window.alert(error.message);
                }
              }}
            >
              Step1. Query Deploy Contract Address
            </Button>
            {scAddr && (
              <TextField label="Contract Address" value={scAddr} readOnly />
            )}
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={async () => {
                try {
                  if (!web3 || !address) return;
                  const contract = new web3.eth.Contract(
                    create2DeployerAbi,
                    create2Deployer
                  );
                  const tx = await contract.methods
                    .deploy(bytecode, seed)
                    .send({ from: address });
                  console.log(
                    "Deploy tx:",
                    tx,
                    tx.events.Deployed.returnValues.addr
                  );
                  setFinalAddr(tx.events.Deployed.returnValues.addr);
                } catch (error) {
                  console.error(error);
                  window.alert(error.message);
                }
              }}
            >
              Step2. Finish Deploy
            </Button>
            {finalAddr && (
              <TextField label="Final Address" value={finalAddr} readOnly />
            )}
          </Stack>
        )}
        {
          !supportedChains.includes(networkId) && <Stack spacing={2}>
            <Divider />
            <h2>Unsupported chain id: {networkId}</h2>
            <h2>Currently only support: {supportedChains.toString()}</h2>
            <h2>If you want more chains, please contact us.</h2>
          </Stack>
        }
      </Stack>
    </Paper>
  );
}

let sourceCode = `
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IERC20Errors {
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
    error ERC20InvalidSender(address sender);
    error ERC20InvalidReceiver(address receiver);
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
    error ERC20InvalidApprover(address approver);
    error ERC20InvalidSpender(address spender);
}

interface IERC721Errors {
    error ERC721InvalidOwner(address owner);
    error ERC721NonexistentToken(uint256 tokenId);
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);
    error ERC721InvalidSender(address sender);
    error ERC721InvalidReceiver(address receiver);
    error ERC721InsufficientApproval(address operator, uint256 tokenId);
    error ERC721InvalidApprover(address approver);
    error ERC721InvalidOperator(address operator);
}

interface IERC1155Errors {
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);
    error ERC1155InvalidSender(address sender);
    error ERC1155InvalidReceiver(address receiver);
    error ERC1155MissingApprovalForAll(address operator, address owner);
    error ERC1155InvalidApprover(address approver);
    error ERC1155InvalidOperator(address operator);
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                _balances[from] = fromBalance - value;
            }
        }
        if (to == address(0)) {
            unchecked {
                _totalSupply -= value;
            }
        } else {
            unchecked {
                _balances[to] += value;
            }
        }
        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }
}

contract ERC20Token is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 totalSupplyInEther,
        address receiver
    ) ERC20(_name, _symbol) {
         _mint(receiver, totalSupplyInEther * 1 ether);
    }
}


`;
