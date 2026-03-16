'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { verifyMessage } from 'viem'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

export default function SignMessagePage() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [verifiedAddr, setVerifiedAddr] = useState('')
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { showError } = useSnackbar()
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return (
    <Stack spacing={2.5} sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Sign Message</Typography>
          <TextField size="small" label="Message to Sign" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }}
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
            <Box sx={{ boxShadow: shadows.inset, borderRadius: '16px', p: 2 }}>
              <Typography variant="caption" sx={{ color: t.textSecondary, fontWeight: 600 }}>Signature</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', mt: 0.5, color: t.text }}>
                {signature}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Verify Message Signature</Typography>
          <TextField size="small" label="Message to Verify" value={message} onChange={(e) => setMessage(e.target.value)} />
          <TextField size="small" label="Signature to Verify" value={signature} onChange={(e) => setSignature(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }}
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
            <Box sx={{ boxShadow: shadows.inset, borderRadius: '16px', p: 2 }}>
              <Typography variant="caption" sx={{ color: t.textSecondary, fontWeight: 600 }}>Verified Address</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', mt: 0.5, color: t.text }}>
                {verifiedAddr}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
