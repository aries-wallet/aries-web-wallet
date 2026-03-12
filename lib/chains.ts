import { defineChain } from 'viem'

export const wanchain = defineChain({
  id: 888,
  name: 'Wanchain',
  nativeCurrency: {
    decimals: 18,
    name: 'WAN',
    symbol: 'WAN',
  },
  rpcUrls: {
    default: { http: ['https://gwan-ssl.wandevs.org:56891'] },
  },
  blockExplorers: {
    default: { name: 'WanScan', url: 'https://wanscan.org' },
  },
})

export const wanchainTestnet = defineChain({
  id: 999,
  name: 'Wanchain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'WAN',
    symbol: 'WAN',
  },
  rpcUrls: {
    default: { http: ['https://gwan-ssl.wandevs.org:46891'] },
  },
  blockExplorers: {
    default: { name: 'WanScan Testnet', url: 'https://testnet.wanscan.org' },
  },
  testnet: true,
})
