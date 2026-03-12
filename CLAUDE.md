# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aries Web Wallet — a multi-chain EVM wallet web app for smart contract interaction, token management, transactions, and Wanchain private transactions. Does not store private keys; relies on RainbowKit/wagmi provider-based signing.

## Commands

```bash
yarn dev          # Development server (localhost:3000)
yarn build        # Production build (also generates sitemap via postbuild)
yarn start        # Start production server
yarn lint         # ESLint (next/core-web-vitals)
```

No test framework is configured.

## Tech Stack

- **Next.js 14** (App Router) with **React 18**, **TypeScript**
- **UI**: MUI 5, Emotion CSS-in-JS
- **Web3**: viem 2.21, wagmi 2.12, RainbowKit 2.2, ethers 6 (keystore page only)
- **State**: React Context (`lib/store/contract-store.tsx`)
- **Storage**: Typed localStorage wrapper (`lib/storage.ts`) using `aries-web-wallet` key
- **Package Manager**: Yarn
- **Deploy**: Vercel

## Architecture

### Project Structure

```
app/                          # Next.js App Router pages
  layout.tsx                  # Root layout (server component, Metadata API)
  providers.tsx               # Client: WagmiProvider, RainbowKit, MUI Theme, Context providers
  template.tsx                # Client: Sidebar + content layout
  page.tsx                    # Home page
  smart-contract/             # Contract read/write interaction
  transaction/                # Send TX, check status
  raw-transaction/            # Send signed raw transactions
  sign-message/               # Sign & verify messages
  token-tools/                # ERC20/721 tools
  script/                     # JS execution with wallet context
  keystore/                   # Keystore generate/decrypt (uses ethers v6)
  private-tx/                 # Wanchain OTA private transactions
  create2/                    # CREATE2 deployer
  meme/                       # ERC20 token creation
  storeman/                   # Wanchain cross-chain bridge (Storeman)
lib/
  wagmi.ts                    # wagmi config: chains, connectors, transports
  chains.ts                   # Wanchain mainnet (888) + testnet (999) chain definitions
  storage.ts                  # Typed localStorage wrapper
  constants.ts                # Default contracts, RPC list
  connectors/wan-wallet.ts    # Custom wagmi connector for WAN Wallet Desktop
  store/contract-store.tsx    # React Context for contract CRUD
  store/types.ts              # ContractItem interface
  hooks/use-snackbar.tsx      # MUI Snackbar context (showSuccess/showError)
components/
  sidebar.tsx                 # Collapsible sidebar with nav, wallet info, dark mode
  contract/index.tsx          # Contract selector, add/edit/delete dialogs
  contract/read.tsx           # Read-only contract calls with unit conversion
  contract/write.tsx          # State-modifying contract calls
```

### Wallet Connection

wagmi v2 with RainbowKit for wallet connection UI. Supports MetaMask, WalletConnect, and WAN Wallet Desktop (custom connector at `lib/connectors/wan-wallet.ts` wrapping `window.web3` callback API into EIP-1193).

### Contract Interaction

- `components/contract/index.tsx` — Contract selector, ABI parsing, add/edit/delete via MUI dialogs
- `components/contract/read.tsx` — Read calls via `publicClient.readContract`, MUI Accordion panels
- `components/contract/write.tsx` — Write calls via `walletClient.writeContract`, with payable/unit conversion

### State & Storage

- **Contract Store** (`lib/store/contract-store.tsx`): React Context providing `useContractStore()` hook with `contract`, `contractList`, `setContract`, `addContract`, `deleteContract`, `updateContract`
- **localStorage**: All data stored under `aries-web-wallet` key, backward compatible with original format

### Supported Chains

Wanchain (888), Wanchain Testnet (999), Ethereum, Avalanche, Avalanche Fuji, BSC, BSC Testnet, Moonriver, Moonbeam, Moonbase Alpha

## Key Patterns

- All pages are `'use client'` components; root layout uses `force-dynamic` to prevent SSR prerendering issues
- Default contracts and RPC endpoints are in `lib/constants.ts`
- Contract ABIs are stored as JSON strings in localStorage, parsed at runtime
- Wanchain-specific features (private TX, storeman) use `wanchain-util` and check for chainId 888/999
- WAN Wallet Desktop connector detects via `window.injectWeb3` flag
- Script page passes `{ address, chainId, publicClient, walletClient, viem }` to user scripts
