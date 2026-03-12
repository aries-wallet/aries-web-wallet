const STORAGE_KEY = 'aries-web-wallet'

export interface StorageData {
  current: {
    rpc: { name: string; rpcUrl: string; explorer: string }
    wallet: Record<string, unknown>
    contract: ContractItem
  }
  rpcList: { name: string; rpcUrl: string; explorer: string }[]
  walletList: { name: string; address: string; pk: string }[]
  contractList: ContractItem[]
}

export interface ContractItem {
  name: string
  contract: string
  abi: string
}

function readStorage(): StorageData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StorageData
  } catch {
    return null
  }
}

function writeStorage(data: StorageData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getStorageData(): StorageData | null {
  return readStorage()
}

export function setStorageData(data: StorageData): void {
  writeStorage(data)
}

export function updateStorageField<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
): void {
  const data = readStorage()
  if (!data) return
  data[key] = value
  writeStorage(data)
}
