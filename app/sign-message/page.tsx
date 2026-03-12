'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { verifyMessage } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

export default function SignMessagePage() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [verifiedAddr, setVerifiedAddr] = useState('')
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { showError } = useSnackbar()

  return (
    <Stack spacing={2} sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Sign Message</Typography>
          <TextField size="small" label="Message to Sign" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={async () => {
              try {
                if (!address) return
                const sig = await signMessageAsync({ message })
                setSignature(sig)
              } catch (error: unknown) {
                console.error(error)
                showError((error as Error).message)
              }
            }}
          >
            Sign
          </Button>
          {signature && (
            <Box sx={{ bgcolor: '#f5f7fb', borderRadius: '8px', p: 2 }}>
              <Typography variant="caption" sx={{ color: '#8a94a6', fontWeight: 600 }}>Signature</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', mt: 0.5, color: '#2d3748' }}>
                {signature}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Verify Message Signature</Typography>
          <TextField size="small" label="Message to Verify" value={message} onChange={(e) => setMessage(e.target.value)} />
          <TextField size="small" label="Signature to Verify" value={signature} onChange={(e) => setSignature(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
            onClick={async () => {
              try {
                const valid = await verifyMessage({ address: address!, message, signature: signature as `0x${string}` })
                if (valid) setVerifiedAddr(address!)
                else setVerifiedAddr('Signature verification failed')
              } catch (error: unknown) {
                console.error(error)
                showError((error as Error).message)
              }
            }}
          >
            Verify
          </Button>
          {verifiedAddr && (
            <Box sx={{ bgcolor: '#f5f7fb', borderRadius: '8px', p: 2 }}>
              <Typography variant="caption" sx={{ color: '#8a94a6', fontWeight: 600 }}>Verified Address</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', mt: 0.5, color: '#2d3748' }}>
                {verifiedAddr}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
