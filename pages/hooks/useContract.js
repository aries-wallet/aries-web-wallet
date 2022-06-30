import { createModel } from "hox";
import { useEffect, useState } from "react";
import { getDb } from "../../utils/db";

function useContract() {
  const [contract, setContract] = useState({});
  const [contractList, setContractList] = useState([]);

  useEffect(()=>{
    setTimeout(()=>{
      if (!getDb() || !getDb().data) {
        return;
      }
      if (getDb().data.current && getDb().data.current.contract && getDb().data.current.contract.name) {
        setContract(getDb().data.current.contract)
      } else {
        setContract(getDb().data.contractList[0]);
      }
  
      setContractList(getDb().data.contractList);
    }, 1000);
  },[]);

  const addContract = async (contract) => {
    getDb().data.contractList.push(contract);
    await getDb().write();
    setContractList(getDb().data.contractList);
  }

  const setCurrentContract = async (contractName) => {
    let found = getDb().data.contractList.find(v=>v.name === contractName);
    getDb().data.current.contract = found;
    await getDb().write();
    setContract(found);
  }

  const deleteContract = async (scName) => {
    if (!getDb().data || !getDb().data.contractList || getDb().data.contractList.length <= 1) {
      console.log("You should left one contract")
      return false;
    }
    let index = getDb().data.contractList.findIndex(v=>v.name === scName);
    getDb().data.contractList.splice(index, 1);
    getDb().write();
    setContractList(getDb().data.contractList);
    setContract(getDb().data.contractList[0]);
    return true;
  }

  return { contract, contractList, setContract: setCurrentContract, deleteContract, addContract };
}

export default createModel(useContract);
