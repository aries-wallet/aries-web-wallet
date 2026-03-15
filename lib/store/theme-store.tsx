'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeStore {
  mode: ThemeMode
  toggleMode: () => void
  etherscanApiKey: string
  setEtherscanApiKey: (key: string) => void
}

const THEME_KEY = 'aries-theme-mode'
const ETHERSCAN_KEY = 'aries-etherscan-api-key'

const ThemeContext = createContext<ThemeStore>({
  mode: 'light',
  toggleMode: () => {},
  etherscanApiKey: '',
  setEtherscanApiKey: () => {},
})

export function ThemeStoreProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [etherscanApiKey, setEtherscanApiKeyState] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
    if (saved === 'dark' || saved === 'light') setMode(saved)
    const key = localStorage.getItem(ETHERSCAN_KEY)
    if (key) setEtherscanApiKeyState(key)
  }, [])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  const setEtherscanApiKey = useCallback((key: string) => {
    setEtherscanApiKeyState(key)
    localStorage.setItem(ETHERSCAN_KEY, key)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, etherscanApiKey, setEtherscanApiKey }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeStore() {
  return useContext(ThemeContext)
}
