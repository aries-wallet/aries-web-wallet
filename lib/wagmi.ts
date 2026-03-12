import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import {
  mainnet,
  avalanche,
  avalancheFuji,
  bsc,
  bscTestnet,
  moonriver,
  moonbeam,
  moonbaseAlpha,
} from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { wanchain, wanchainTestnet } from './chains'
import { wanWallet } from './connectors/wan-wallet'

export const config = createConfig({
  chains: [
    wanchain,
    wanchainTestnet,
    mainnet,
    avalanche,
    avalancheFuji,
    bsc,
    bscTestnet,
    moonriver,
    moonbeam,
    moonbaseAlpha,
  ],
  connectors: [
    injected(),
    wanWallet(),
  ],
  transports: {
    [wanchain.id]: http('https://gwan-ssl.wandevs.org:56891'),
    [wanchainTestnet.id]: http('https://gwan-ssl.wandevs.org:46891'),
    [mainnet.id]: http(),
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [moonriver.id]: http(),
    [moonbeam.id]: http(),
    [moonbaseAlpha.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})
