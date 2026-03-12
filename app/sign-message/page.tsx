'use client'

import { Button, Paper, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { verifyMessage } from 'viem'
import { usePublicClient } from 'wagmi'
import { useSnackbar } from '@/lib/hooks/use-snackbar'

export default function SignMessagePage() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [verifiedAddr, setVerifiedAddr] = useState('')
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { signMessageAsync } = useSignMessage()
  const { showError } = useSnackbar()

  return (
    <Paper sx={{ padding: '30px', margin: '50px', overflow: 'auto' }}>
      <Stack spacing={2}>
        <h1>Sign Message</h1>
        <TextField label="Message to Sign" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button
          variant="contained"
          color="primary"
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
        {signature && <TextField multiline label="Signature Result" value={signature} />}
      </Stack>

      <div style={{ marginTop: '40px', marginBottom: '40px', border: '1px solid gray' }} />

      <Stack spacing={2}>
        <h1>Verify Message Signature</h1>
        <TextField label="Message to Verify" value={message} onChange={(e) => setMessage(e.target.value)} />
        <TextField label="Signature to Verify" value={signature} onChange={(e) => setSignature(e.target.value)} />
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              const valid = await verifyMessage({
                address: address!,
                message,
                signature: signature as `0x${string}`,
              })
              if (valid) {
                setVerifiedAddr(address!)
              } else {
                // Try ecRecover approach for non-EIP191 signatures
                setVerifiedAddr('Signature verification failed')
              }
            } catch (error: unknown) {
              console.error(error)
              showError((error as Error).message)
            }
          }}
        >
          Verify
        </Button>
        {verifiedAddr && <TextField multiline label="Verified Signature Address" value={verifiedAddr} />}
      </Stack>
    </Paper>
  )
}
