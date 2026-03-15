'use client'

import { type ReactNode, useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { config } from '@/lib/wagmi'
import { ContractStoreProvider } from '@/lib/store/contract-store'
import { TxHistoryProvider } from '@/lib/store/tx-history'
import { ThemeStoreProvider, useThemeStore } from '@/lib/store/theme-store'
import { SnackbarProvider } from '@/lib/hooks/use-snackbar'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

const lightPalette = {
  mode: 'light' as const,
  background: { default: '#f0f2f5', paper: '#ffffff' },
  text: { primary: '#2d3748', secondary: '#4a5568' },
}

const darkPalette = {
  mode: 'dark' as const,
  background: { default: '#0f1117', paper: '#1a1d27' },
  text: { primary: '#e2e8f0', secondary: '#a0aec0' },
}

function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'
  return createTheme({
    palette: isDark ? darkPalette : lightPalette,
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${isDark ? '#2d3748' : '#f0f2f5'}` },
        },
      },
    },
  })
}

function InnerProviders({ children }: { children: ReactNode }) {
  const { mode } = useThemeStore()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RainbowKitProvider theme={mode === 'dark' ? darkTheme() : lightTheme()}>
        <ContractStoreProvider>
          <TxHistoryProvider>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </TxHistoryProvider>
        </ContractStoreProvider>
      </RainbowKitProvider>
    </ThemeProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeStoreProvider>
          <InnerProviders>
            {children}
          </InnerProviders>
        </ThemeStoreProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
