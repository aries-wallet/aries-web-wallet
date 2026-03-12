'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'

interface SnackbarContextValue {
  showSuccess: (msg: string) => void
  showError: (msg: string) => void
}

const SnackbarContext = createContext<SnackbarContextValue>({
  showSuccess: () => {},
  showError: () => {},
})

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const showSuccess = useCallback((msg: string) => setSuccessMsg(msg), [])
  const showError = useCallback((msg: string) => setErrorMsg(msg), [])

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Snackbar open={successMsg !== ''} autoHideDuration={6000} onClose={() => setSuccessMsg('')}>
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={errorMsg !== ''} autoHideDuration={6000} onClose={() => setErrorMsg('')}>
        <Alert onClose={() => setErrorMsg('')} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  return useContext(SnackbarContext)
}
