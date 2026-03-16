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

// Neumorphic shadow tokens
export const neu = {
  // Light mode
  light: {
    bg: '#E0E5EC',
    text: '#3D4852',
    textSecondary: '#6B7280',
    accent: '#6C63FF',
    accentHover: '#8B84FF',
    accentSecondary: '#38B2AC',
    shadowDark: 'rgb(163, 177, 198, 0.6)',
    shadowDarkStrong: 'rgb(163, 177, 198, 0.7)',
    shadowLight: 'rgba(255, 255, 255, 0.5)',
    shadowLightStrong: 'rgba(255, 255, 255, 0.6)',
  },
  // Dark mode — adapted neumorphism
  dark: {
    bg: '#2D3748',
    text: '#E2E8F0',
    textSecondary: '#A0AEC0',
    accent: '#8B84FF',
    accentHover: '#A39DFF',
    accentSecondary: '#4FD1C5',
    shadowDark: 'rgba(0, 0, 0, 0.4)',
    shadowDarkStrong: 'rgba(0, 0, 0, 0.5)',
    shadowLight: 'rgba(255, 255, 255, 0.05)',
    shadowLightStrong: 'rgba(255, 255, 255, 0.07)',
  },
  // Shadow presets (parameterized)
  extruded: (dark: string, light: string) =>
    `9px 9px 16px ${dark}, -9px -9px 16px ${light}`,
  extrudedHover: (dark: string, light: string) =>
    `12px 12px 20px ${dark}, -12px -12px 20px ${light}`,
  extrudedSmall: (dark: string, light: string) =>
    `5px 5px 10px ${dark}, -5px -5px 10px ${light}`,
  inset: (dark: string, light: string) =>
    `inset 6px 6px 10px ${dark}, inset -6px -6px 10px ${light}`,
  insetDeep: (dark: string, light: string) =>
    `inset 10px 10px 20px ${dark}, inset -10px -10px 20px ${light}`,
  insetSmall: (dark: string, light: string) =>
    `inset 3px 3px 6px ${dark}, inset -3px -3px 6px ${light}`,
}

// Helper to get shadow presets for a mode
export function neuShadows(mode: 'light' | 'dark') {
  const t = neu[mode]
  return {
    extruded: neu.extruded(t.shadowDark, t.shadowLight),
    extrudedHover: neu.extrudedHover(t.shadowDarkStrong, t.shadowLightStrong),
    extrudedSmall: neu.extrudedSmall(t.shadowDark, t.shadowLight),
    inset: neu.inset(t.shadowDark, t.shadowLight),
    insetDeep: neu.insetDeep(t.shadowDarkStrong, t.shadowLightStrong),
    insetSmall: neu.insetSmall(t.shadowDark, t.shadowLight),
  }
}

function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return createTheme({
    palette: {
      mode,
      background: { default: t.bg, paper: t.bg },
      text: { primary: t.text, secondary: t.textSecondary },
      primary: { main: t.accent },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
      h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: t.bg },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 16,
            fontWeight: 600,
            transition: 'all 300ms ease-out',
            boxShadow: shadows.extrudedSmall,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: shadows.extruded,
            },
            '&:active': {
              transform: 'translateY(0.5px)',
              boxShadow: shadows.insetSmall,
            },
          },
          contained: {
            backgroundColor: t.accent,
            color: '#fff',
            '&:hover': {
              backgroundColor: t.accentHover,
              transform: 'translateY(-1px)',
              boxShadow: shadows.extruded,
            },
            '&:active': {
              boxShadow: `inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(255,255,255,0.1)`,
            },
          },
          outlined: {
            borderColor: 'transparent',
            backgroundColor: t.bg,
            boxShadow: shadows.extrudedSmall,
            '&:hover': {
              borderColor: 'transparent',
              backgroundColor: t.bg,
              transform: 'translateY(-1px)',
              boxShadow: shadows.extruded,
            },
          },
          text: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: 'transparent',
              color: t.accent,
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: t.bg,
            backgroundImage: 'none',
            borderRadius: 24,
            boxShadow: shadows.extruded,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 16,
              backgroundColor: t.bg,
              boxShadow: shadows.inset,
              transition: 'box-shadow 300ms ease-out',
              '& fieldset': { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'transparent' },
              '&.Mui-focused': {
                boxShadow: shadows.insetDeep,
                '& fieldset': {
                  borderColor: t.accent,
                  borderWidth: 2,
                },
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            backgroundColor: t.bg,
            boxShadow: shadows.extrudedHover,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(163,177,198,0.3)'}`,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            height: 6,
            backgroundColor: 'transparent',
            boxShadow: shadows.insetSmall,
          },
        },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: t.bg,
            borderRadius: '16px !important',
            boxShadow: shadows.extrudedSmall,
            marginBottom: 8,
            '&:before': { display: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: shadows.extrudedSmall,
            backgroundColor: t.bg,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 12,
            backgroundColor: isDark ? '#1A202C' : '#3D4852',
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: t.textSecondary,
            '&.Mui-checked': { color: t.accent },
          },
        },
      },
    },
  })
}

function InnerProviders({ children }: { children: ReactNode }) {
  const { mode } = useThemeStore()
  const theme = useMemo(() => createAppTheme(mode), [mode])

  const rkTheme = useMemo(() => {
    const base = mode === 'dark' ? darkTheme() : lightTheme()
    return {
      ...base,
      colors: {
        ...base.colors,
        accentColor: neu[mode].accent,
        modalBackground: neu[mode].bg,
      },
      radii: {
        ...base.radii,
        modal: '24px',
        modalMobile: '24px',
      },
    }
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RainbowKitProvider theme={rkTheme}>
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
