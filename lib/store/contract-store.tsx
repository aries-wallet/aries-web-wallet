'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getStorageData, setStorageData } from '../storage'
import type { ContractItem } from './types'
import { defaultContracts } from '../constants'
import {
  dbGetAllContracts, dbPutContract, dbDeleteContract, dbPutContracts,
  migrateFromLocalStorage,
} from '../db'

interface ContractStore {
  contract: ContractItem
  contractList: ContractItem[]
  loading: boolean
  setContract: (name: string) => Promise<void>
  addContract: (item: ContractItem) => Promise<void>
  deleteContract: (name: string) => Promise<boolean>
  updateContract: (oldName: string, newItem: ContractItem) => Promise<boolean>
  refreshList: () => Promise<void>
}

const emptyContract: ContractItem = { name: '', contract: '', abi: '' }

const ContractContext = createContext<ContractStore>({
  contract: emptyContract,
  contractList: [],
  loading: true,
  setContract: async () => {},
  addContract: async () => {},
  deleteContract: async () => false,
  updateContract: async () => false,
  refreshList: async () => {},
})

export function ContractStoreProvider({ children }: { children: ReactNode }) {
  const [contract, setContractState] = useState<ContractItem>(emptyContract)
  const [contractList, setContractList] = useState<ContractItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadContracts = useCallback(async () => {
    try {
      // Run migration first (no-op if already done)
      await migrateFromLocalStorage()

      let list = await dbGetAllContracts()

      if (list.length === 0) {
        // Initialize with defaults
        await dbPutContracts(defaultContracts)
        list = defaultContracts
      }

      setContractList(list)

      // Restore current selection from localStorage
      const data = getStorageData()
      if (data?.current?.contract?.name) {
        const found = list.find((v) => v.name === data.current.contract.name)
        if (found) {
          setContractState(found)
          setLoading(false)
          return
        }
      }
      setContractState(list[0])
    } catch (err) {
      console.error('Failed to load contracts from IndexedDB:', err)
      // Fallback to localStorage
      const data = getStorageData()
      if (data?.contractList?.length) {
        setContractList(data.contractList)
        setContractState(data.current?.contract || data.contractList[0])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContracts()
  }, [loadContracts])

  const persistCurrentSelection = useCallback((item: ContractItem) => {
    // Save current selection (without ABI) to localStorage for quick restore
    const data = getStorageData()
    if (data) {
      data.current.contract = { name: item.name, contract: item.contract, abi: '' }
      setStorageData(data)
    } else {
      setStorageData({
        current: {
          rpc: { name: 'Wanchain Mainnet', rpcUrl: 'https://gwan-ssl.wandevs.org:56891', explorer: 'https://wanscan.org/' },
          wallet: {},
          contract: { name: item.name, contract: item.contract, abi: '' },
        },
        rpcList: [],
        walletList: [],
        contractList: [],
      })
    }
  }, [])

  const setContract = useCallback(async (name: string) => {
    const found = contractList.find((v) => v.name === name)
    if (!found) return
    setContractState(found)
    persistCurrentSelection(found)
  }, [contractList, persistCurrentSelection])

  const addContract = useCallback(async (item: ContractItem) => {
    await dbPutContract(item)
    setContractList((prev) => [...prev, item])
    setContractState(item)
    persistCurrentSelection(item)
  }, [persistCurrentSelection])

  const deleteContract = useCallback(async (name: string) => {
    if (contractList.length <= 1) return false
    await dbDeleteContract(name)
    const newList = contractList.filter((v) => v.name !== name)
    setContractList(newList)
    setContractState(newList[0])
    persistCurrentSelection(newList[0])
    return true
  }, [contractList, persistCurrentSelection])

  const updateContract = useCallback(async (oldName: string, newItem: ContractItem) => {
    const index = contractList.findIndex((v) => v.name === oldName)
    if (index < 0) return false
    if (newItem.name !== oldName) {
      const existed = contractList.find((v) => v.name === newItem.name)
      if (existed) return false
      // Delete old entry if name changed
      await dbDeleteContract(oldName)
    }
    await dbPutContract(newItem)
    const newList = [...contractList]
    newList[index] = newItem
    setContractList(newList)
    setContractState(newItem)
    persistCurrentSelection(newItem)
    return true
  }, [contractList, persistCurrentSelection])

  const refreshList = useCallback(async () => {
    const list = await dbGetAllContracts()
    setContractList(list)
  }, [])

  return (
    <ContractContext.Provider value={{ contract, contractList, loading, setContract, addContract, deleteContract, updateContract, refreshList }}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContractStore() {
  return useContext(ContractContext)
}
