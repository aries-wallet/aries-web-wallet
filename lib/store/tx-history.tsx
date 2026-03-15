'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { dbAddTxHistory, dbGetTxHistory, dbClearTxHistory, type TxHistoryItem } from '../db'

interface TxHistoryStore {
  history: TxHistoryItem[]
  addTx: (item: Omit<TxHistoryItem, 'id' | 'timestamp'>) => Promise<void>
  clearHistory: () => Promise<void>
  refreshHistory: () => Promise<void>
}

const TxHistoryContext = createContext<TxHistoryStore>({
  history: [],
  addTx: async () => {},
  clearHistory: async () => {},
  refreshHistory: async () => {},
})

export function TxHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TxHistoryItem[]>([])

  const refreshHistory = useCallback(async () => {
    try {
      const items = await dbGetTxHistory(100)
      setHistory(items)
    } catch (err) {
      console.error('Failed to load tx history:', err)
    }
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  const addTx = useCallback(async (item: Omit<TxHistoryItem, 'id' | 'timestamp'>) => {
    const full: TxHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    }
    await dbAddTxHistory(full)
    setHistory((prev) => [full, ...prev])
  }, [])

  const clearHistory = useCallback(async () => {
    await dbClearTxHistory()
    setHistory([])
  }, [])

  return (
    <TxHistoryContext.Provider value={{ history, addTx, clearHistory, refreshHistory }}>
      {children}
    </TxHistoryContext.Provider>
  )
}

export function useTxHistory() {
  return useContext(TxHistoryContext)
}
