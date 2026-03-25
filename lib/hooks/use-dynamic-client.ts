'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPublicClient, custom, formatUnits, type Chain, type PublicClient } from 'viem'
import { useAccount } from 'wagmi'

/**
 * Returns a PublicClient that always follows the wallet's current chain,
 * even if the chain is not in wagmi's configured chain list.
 * Uses the wallet provider (e.g. MetaMask) as transport so all RPC
 * calls are routed through the wallet on whatever chain it's on.
 */
export function useDynamicPublicClient(): PublicClient | undefined {
  const { connector, isConnected, chainId, chain } = useAccount()
  const [provider, setProvider] = useState<unknown>(null)

  useEffect(() => {
    if (!connector || !isConnected) {
      setProvider(null)
      return
    }
    let cancelled = false
    connector.getProvider().then((p) => {
      if (!cancelled) setProvider(p)
    }).catch(() => {
      if (!cancelled) setProvider(null)
    })
    return () => { cancelled = true }
  }, [connector, isConnected, chainId])

  return useMemo(() => {
    if (!provider) return undefined
    // Use wagmi's chain definition if available (configured chain),
    // otherwise construct a minimal chain object for unknown chains
    const chainDef: Chain = chain || {
      id: chainId || 1,
      name: `Chain ${chainId}`,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [] } },
    }
    return createPublicClient({
      chain: chainDef,
      transport: custom(provider as Parameters<typeof custom>[0]),
    })
  }, [provider, chain, chainId]) as PublicClient | undefined
}

/**
 * Fetches the native balance + symbol for the connected wallet,
 * working on any chain (not limited to wagmi-configured chains).
 */
export function useDynamicBalance() {
  const { address, isConnected } = useAccount()
  const publicClient = useDynamicPublicClient()
  const [balance, setBalance] = useState<{ formatted: string; symbol: string } | null>(null)

  useEffect(() => {
    if (!publicClient || !address || !isConnected) {
      setBalance(null)
      return
    }
    let cancelled = false
    const fetchBalance = async () => {
      try {
        const raw = await publicClient.getBalance({ address })
        const symbol = publicClient.chain?.nativeCurrency?.symbol || 'ETH'
        const decimals = publicClient.chain?.nativeCurrency?.decimals || 18
        if (!cancelled) {
          setBalance({ formatted: formatUnits(raw, decimals), symbol })
        }
      } catch {
        if (!cancelled) setBalance(null)
      }
    }
    fetchBalance()
    const timer = setInterval(fetchBalance, 15000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [publicClient, address, isConnected])

  return balance
}
