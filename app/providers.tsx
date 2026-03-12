'use client'

import { type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { config } from '@/lib/wagmi'
import { ContractStoreProvider } from '@/lib/store/contract-store'
import { SnackbarProvider } from '@/lib/hooks/use-snackbar'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ContractStoreProvider>
              <SnackbarProvider>
                {children}
              </SnackbarProvider>
            </ContractStoreProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
