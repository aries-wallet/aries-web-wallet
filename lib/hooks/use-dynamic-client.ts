'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPublicClient, createWalletClient, custom, formatUnits, type Chain, type PublicClient, type WalletClient } from 'viem'
import { useAccount } from 'wagmi'

/** Shared hook: wallet provider + chain definition that follows the wallet */
function useWalletProvider() {
  const { connector, isConnected, chainId, chain, address } = useAccount()
  const [provider, setProvider] = useState<unknown>(null)

  useEffect(() => {
    if (!connector || !isConnected || typeof connector.getProvider !== 'function') {
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

  const chainDef: Chain | undefined = useMemo(() => {
    if (!provider) return undefined
    return chain || {
      id: chainId || 1,
      name: `Chain ${chainId}`,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [] } },
    }
  }, [provider, chain, chainId])

  return { provider, chainDef, address }
}

/**
 * Returns a PublicClient that always follows the wallet's current chain,
 * even if the chain is not in wagmi's configured chain list.
 * Uses the wallet provider (e.g. MetaMask) as transport so all RPC
 * calls are routed through the wallet on whatever chain it's on.
 */
export function useDynamicPublicClient(): PublicClient | undefined {
  const { provider, chainDef } = useWalletProvider()

  return useMemo(() => {
    if (!provider || !chainDef) return undefined
    return createPublicClient({
      chain: chainDef,
      transport: custom(provider as Parameters<typeof custom>[0]),
    })
  }, [provider, chainDef]) as PublicClient | undefined
}

/**
 * Returns a WalletClient that always follows the wallet's current chain,
 * even if the chain is not in wagmi's configured chain list.
 * The client always has a chain set, so writeContract/sendTransaction
 * never fail with "No chain was provided".
 */
export function useDynamicWalletClient() {
  const { provider, chainDef, address } = useWalletProvider()

  return useMemo(() => {
    if (!provider || !chainDef || !address) return undefined
    return createWalletClient({
      account: address,
      chain: chainDef,
      transport: custom(provider as Parameters<typeof custom>[0]),
    })
  }, [provider, chainDef, address])
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
