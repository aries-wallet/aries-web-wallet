import { createConnector } from 'wagmi'
import { type Address, type Chain, custom, type EIP1193Provider } from 'viem'
import { wanchain } from '../chains'

// WAN Wallet Desktop injects window.web3 (old-style) and sets window.injectWeb3 = true
// This connector wraps that into an EIP-1193 compatible provider

declare global {
  interface Window {
    injectWeb3?: boolean
    web3?: {
      eth: {
        getAccounts: (cb: (err: unknown, accounts: string[]) => void) => void
        sendTransaction: (tx: Record<string, unknown>, cb: (err: unknown, hash: string) => void) => void
        sign: (data: string, address: string, cb: (err: unknown, sig: string) => void) => void
        getBalance: (address: string, cb: (err: unknown, balance: string) => void) => void
      }
      currentProvider?: unknown
    }
  }
}

function promisify<T>(fn: (cb: (err: unknown, result: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

function createWanWalletProvider(): EIP1193Provider {
  const provider: EIP1193Provider = {
    async request({ method, params }: { method: string; params?: unknown[] }) {
      const web3 = window.web3
      if (!web3) throw new Error('WAN Wallet not available')

      switch (method) {
        case 'eth_accounts':
        case 'eth_requestAccounts': {
          const accounts = await promisify<string[]>((cb) => web3.eth.getAccounts(cb))
          return accounts as Address[]
        }
        case 'eth_chainId': {
          return '0x378' // 888 = wanchain mainnet
        }
        case 'net_version': {
          return '888'
        }
        case 'eth_sendTransaction': {
          const tx = (params as Record<string, unknown>[])?.[0]
          if (!tx) throw new Error('Missing transaction params')
          const hash = await promisify<string>((cb) => web3.eth.sendTransaction(tx, cb))
          return hash
        }
        case 'personal_sign': {
          const [message, address] = params as [string, string]
          const sig = await promisify<string>((cb) => web3.eth.sign(message, address, cb))
          return sig
        }
        case 'wallet_switchEthereumChain':
        case 'wallet_addEthereumChain': {
          // WAN Wallet is single-chain, ignore
          return null
        }
        default: {
          // Fallback to HTTP RPC for read calls
          const rpcUrl = wanchain.rpcUrls.default.http[0]
          const res = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method,
              params: params || [],
            }),
          })
          const json = await res.json()
          if (json.error) throw new Error(json.error.message)
          return json.result
        }
      }
    },
    on() { return this },
    removeListener() { return this },
  } as EIP1193Provider

  return provider
}

export function wanWallet() {
  return createConnector((config) => ({
    id: 'wanWallet',
    name: 'WAN Wallet',
    type: 'wanWallet' as const,

    async setup() {},

    async connect() {
      const provider = createWanWalletProvider()
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as Address[]
      return {
        accounts,
        chainId: wanchain.id,
      }
    },

    async disconnect() {},

    async getAccounts() {
      const provider = createWanWalletProvider()
      return (await provider.request({ method: 'eth_accounts' })) as Address[]
    },

    async getChainId() {
      return wanchain.id
    },

    async getProvider() {
      return createWanWalletProvider()
    },

    async isAuthorized() {
      if (!window.injectWeb3 || !window.web3) return false
      try {
        const accounts = await promisify<string[]>((cb) => window.web3!.eth.getAccounts(cb))
        return accounts.length > 0
      } catch {
        return false
      }
    },

    async switchChain({ chainId }: { chainId: number }) {
      // WAN Wallet only supports Wanchain
      const chain = config.chains.find((c: Chain) => c.id === chainId)
      if (!chain) throw new Error(`Chain ${chainId} not supported`)
      return chain
    },

    onAccountsChanged() {},
    onChainChanged() {},
    onDisconnect() {},
  }))
}
