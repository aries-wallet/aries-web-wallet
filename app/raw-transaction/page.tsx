'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useSnackbar } from '@/lib/hooks/use-snackbar'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

export default function RawTransaction() {
  const [data, setData] = useState('')
  const publicClient = usePublicClient()
  const { showSuccess, showError } = useSnackbar()
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Send Raw Transaction</Typography>
          <TextField size="small" label="Raw Transaction Hex" value={data} onChange={(e) => setData(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }}
            onClick={async () => {
              try {
                if (!publicClient) return
                const hash = await publicClient.sendRawTransaction({
                  serializedTransaction: data as `0x${string}`,
                })
                showSuccess(`Transaction Hash: ${hash}`)
              } catch (error: unknown) {
                console.error(error)
                showError((error as Error).message)
              }
            }}
          >
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
