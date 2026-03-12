'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getStorageData, setStorageData } from '../storage'
import type { ContractItem } from './types'
import { defaultContracts } from '../constants'

interface ContractStore {
  contract: ContractItem
  contractList: ContractItem[]
  setContract: (name: string) => Promise<void>
  addContract: (item: ContractItem) => Promise<void>
  deleteContract: (name: string) => Promise<boolean>
  updateContract: (oldName: string, newItem: ContractItem) => Promise<boolean>
}

const emptyContract: ContractItem = { name: '', contract: '', abi: '' }

const ContractContext = createContext<ContractStore>({
  contract: emptyContract,
  contractList: [],
  setContract: async () => {},
  addContract: async () => {},
  deleteContract: async () => false,
  updateContract: async () => false,
})

export function ContractStoreProvider({ children }: { children: ReactNode }) {
  const [contract, setContractState] = useState<ContractItem>(emptyContract)
  const [contractList, setContractList] = useState<ContractItem[]>([])

  useEffect(() => {
    const data = getStorageData()
    if (!data) {
      // Initialize with defaults
      const initial = {
        current: {
          rpc: { name: 'Wanchain Mainnet', rpcUrl: 'https://gwan-ssl.wandevs.org:56891', explorer: 'https://wanscan.org/' },
          wallet: {},
          contract: defaultContracts[0],
        },
        rpcList: [],
        walletList: [],
        contractList: defaultContracts,
      }
      setStorageData(initial)
      setContractList(defaultContracts)
      setContractState(defaultContracts[0])
      return
    }

    if (data.contractList && data.contractList.length > 0) {
      setContractList(data.contractList)
      if (data.current?.contract?.name) {
        setContractState(data.current.contract)
      } else {
        setContractState(data.contractList[0])
      }
    }
  }, [])

  const setContract = useCallback(async (name: string) => {
    const data = getStorageData()
    if (!data) return
    const found = data.contractList.find((v) => v.name === name)
    if (!found) return
    data.current.contract = found
    setStorageData(data)
    setContractState(found)
  }, [])

  const addContract = useCallback(async (item: ContractItem) => {
    const data = getStorageData()
    if (!data) return
    data.contractList.push(item)
    setStorageData(data)
    setContractList([...data.contractList])
  }, [])

  const deleteContract = useCallback(async (name: string) => {
    const data = getStorageData()
    if (!data || !data.contractList || data.contractList.length <= 1) return false
    const index = data.contractList.findIndex((v) => v.name === name)
    if (index < 0) return false
    data.contractList.splice(index, 1)
    setStorageData(data)
    setContractList([...data.contractList])
    setContractState(data.contractList[0])
    return true
  }, [])

  const updateContract = useCallback(async (oldName: string, newItem: ContractItem) => {
    const data = getStorageData()
    if (!data || !data.contractList || data.contractList.length <= 0) return false
    const index = data.contractList.findIndex((v) => v.name === oldName)
    if (index < 0) return false
    if (newItem.name !== oldName) {
      const existed = data.contractList.find((v) => v.name === newItem.name)
      if (existed) return false
    }
    data.contractList[index] = newItem
    if (data.current?.contract?.name === oldName) {
      data.current.contract = newItem
    }
    setStorageData(data)
    setContractList([...data.contractList])
    setContractState(newItem)
    return true
  }, [])

  return (
    <ContractContext.Provider value={{ contract, contractList, setContract, addContract, deleteContract, updateContract }}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContractStore() {
  return useContext(ContractContext)
}
