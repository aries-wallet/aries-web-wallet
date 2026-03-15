import type { ContractItem } from './store/types'

const DB_NAME = 'aries-web-wallet-db'
const DB_VERSION = 1
const CONTRACTS_STORE = 'contracts'
const SETTINGS_STORE = 'settings'
const TX_HISTORY_STORE = 'txHistory'

export interface TxHistoryItem {
  id: string
  hash: string
  from: string
  to: string
  value: string
  chainId: number
  chainName: string
  type: 'send' | 'contract-write' | 'token' | 'raw'
  description: string
  timestamp: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(CONTRACTS_STORE)) {
        db.createObjectStore(CONTRACTS_STORE, { keyPath: 'name' })
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(TX_HISTORY_STORE)) {
        const store = db.createObjectStore(TX_HISTORY_STORE, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('chainId', 'chainId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ── Contract CRUD ──

export async function dbGetAllContracts(): Promise<ContractItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTRACTS_STORE, 'readonly')
    const store = tx.objectStore(CONTRACTS_STORE)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbGetContract(name: string): Promise<ContractItem | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTRACTS_STORE, 'readonly')
    const store = tx.objectStore(CONTRACTS_STORE)
    const req = store.get(name)
    req.onsuccess = () => resolve(req.result ?? undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function dbPutContract(item: ContractItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTRACTS_STORE, 'readwrite')
    const store = tx.objectStore(CONTRACTS_STORE)
    store.put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbDeleteContract(name: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTRACTS_STORE, 'readwrite')
    const store = tx.objectStore(CONTRACTS_STORE)
    store.delete(name)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbPutContracts(items: ContractItem[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CONTRACTS_STORE, 'readwrite')
    const store = tx.objectStore(CONTRACTS_STORE)
    items.forEach((item) => store.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Settings ──

export async function dbGetSetting(key: string): Promise<string | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readonly')
    const store = tx.objectStore(SETTINGS_STORE)
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result?.value)
    req.onerror = () => reject(req.error)
  })
}

export async function dbSetSetting(key: string, value: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite')
    const store = tx.objectStore(SETTINGS_STORE)
    store.put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Tx History ──

export async function dbAddTxHistory(item: TxHistoryItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_HISTORY_STORE, 'readwrite')
    const store = tx.objectStore(TX_HISTORY_STORE)
    store.put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbGetTxHistory(limit = 50): Promise<TxHistoryItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_HISTORY_STORE, 'readonly')
    const store = tx.objectStore(TX_HISTORY_STORE)
    const index = store.index('timestamp')
    const req = index.openCursor(null, 'prev')
    const results: TxHistoryItem[] = []
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor && results.length < limit) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

export async function dbClearTxHistory(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TX_HISTORY_STORE, 'readwrite')
    const store = tx.objectStore(TX_HISTORY_STORE)
    store.clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Migration from localStorage ──

export async function migrateFromLocalStorage(): Promise<boolean> {
  const MIGRATION_KEY = 'aries-idb-migrated'
  if (typeof window === 'undefined') return false
  if (localStorage.getItem(MIGRATION_KEY) === '1') return false

  try {
    const raw = localStorage.getItem('aries-web-wallet')
    if (!raw) {
      localStorage.setItem(MIGRATION_KEY, '1')
      return false
    }

    const data = JSON.parse(raw)
    if (data.contractList && Array.isArray(data.contractList) && data.contractList.length > 0) {
      await dbPutContracts(data.contractList)

      // Remove ABI from localStorage to free space, keep metadata
      data.contractList = data.contractList.map((c: ContractItem) => ({
        name: c.name,
        contract: c.contract,
        abi: '', // cleared — now in IndexedDB
      }))
      localStorage.setItem('aries-web-wallet', JSON.stringify(data))
    }

    localStorage.setItem(MIGRATION_KEY, '1')
    return true
  } catch (err) {
    console.error('Migration failed:', err)
    return false
  }
}
