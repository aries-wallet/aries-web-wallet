'use client'

import { createContext, forwardRef, useContext, useState, useCallback, type ReactNode } from 'react'
import { Alert, Button, Snackbar, Typography } from '@mui/material'

interface SnackbarContextValue {
  showSuccess: (msg: string) => void
  showError: (msg: string) => void
}

const SnackbarContext = createContext<SnackbarContextValue>({
  showSuccess: () => {},
  showError: () => {},
})

const ErrorAlert = forwardRef<HTMLDivElement, { msg: string; onClose: () => void }>(
  function ErrorAlert({ msg, onClose }, ref) {
    const [expanded, setExpanded] = useState(false)
    const isLong = msg.length > 120
    const short = isLong ? msg.slice(0, 120) + '...' : msg

    return (
      <Alert ref={ref} onClose={onClose} severity="error" sx={{ width: '100%', maxWidth: 500 }}>
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {isLong && !expanded ? short : msg}
        </Typography>
        {isLong && (
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: 'none', fontSize: 12, color: 'inherit' }}
          >
            {expanded ? 'Show less' : 'Show full error'}
          </Button>
        )}
      </Alert>
    )
  }
)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const showSuccess = useCallback((msg: string) => setSuccessMsg(msg), [])
  const showError = useCallback((msg: string) => setErrorMsg(msg), [])

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Snackbar open={successMsg !== ''} autoHideDuration={6000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {successMsg}
          </Typography>
        </Alert>
      </Snackbar>
      <Snackbar open={errorMsg !== ''} autoHideDuration={12000} onClose={() => setErrorMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <ErrorAlert msg={errorMsg} onClose={() => setErrorMsg('')} />
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  return useContext(SnackbarContext)
}
