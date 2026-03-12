'use client'

import { Button, Paper, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { usePublicClient } from 'wagmi'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

export default function RawTransaction() {
  const [data, setData] = useState('')
  const publicClient = usePublicClient()
  const { showSuccess, showError } = useSnackbar()

  return (
    <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
      <Stack spacing={2}>
        <h1>Send Raw Transaction</h1>
        <TextField label="Raw Transaction Hex" value={data} onChange={(e) => setData(e.target.value)} />
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              if (!publicClient) return
              console.log('start sending signed tx...', data)
              const hash = await publicClient.sendRawTransaction({
                serializedTransaction: data as `0x${string}`,
              })
              console.log('tx hash:', hash)
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
    </Paper>
  )
}
