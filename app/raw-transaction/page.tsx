'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

export default function RawTransaction() {
  const [data, setData] = useState('')
  const publicClient = usePublicClient()
  const { showSuccess, showError } = useSnackbar()

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>Send Raw Transaction</Typography>
          <TextField size="small" label="Raw Transaction Hex" value={data} onChange={(e) => setData(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: '#5b7ff5', '&:hover': { bgcolor: '#4a6de0' } }}
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
