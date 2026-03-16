'use client'

import { Box, Button, Stack, TextField, Typography, IconButton, Alert } from '@mui/material'
import { useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { neu, neuShadows } from '@/app/providers'
import { useThemeStore } from '@/lib/store/theme-store'

export default function KeyStore() {
  const [privateKey, setPrivateKey] = useState('')
  const [password, setPassword] = useState('')
  const [keystoreJson, setKeystoreJson] = useState('')
  const [decryptedAddress, setDecryptedAddress] = useState('')
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState('')
  const [decryptSuccess, setDecryptSuccess] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showDecryptedPrivateKey, setShowDecryptedPrivateKey] = useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const { mode } = useThemeStore()
  const t = neu[mode]
  const shadows = neuShadows(mode)

  const generateKeystore = async () => {
    try {
      if (!privateKey || !password) { window.alert('Please enter both private key and password'); return }
      const { ethers } = await import('ethers')
      const wallet = new ethers.Wallet(privateKey)
      const keystore = await wallet.encrypt(password)
      const fileName = `UTC--${new Date().toISOString().replace(/:/g, '-')}--${wallet.address}`
      const blob = new Blob([keystore], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()
    } catch (error: unknown) {
      console.error(error)
      window.alert((error as Error).message)
    }
  }

  const decryptKeystore = async () => {
    try {
      if (!keystoreJson || !password) { window.alert('Please upload a keystore file and enter the password'); return }
      const { ethers } = await import('ethers')
      const wallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password)
      setDecryptedAddress(wallet.address)
      setDecryptedPrivateKey(wallet.privateKey)
      setDecryptSuccess(true)
    } catch (error: unknown) {
      console.error(error)
      window.alert((error as Error).message)
      setDecryptSuccess(false)
    }
  }

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text) }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => { setKeystoreJson(event.target?.result as string); setFileUploaded(true) }
    reader.readAsText(file)
  }

  return (
    <Stack spacing={2.5} sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Keystore Management</Typography>

      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Generate Keystore</Typography>
          <TextField
            size="small" label="Private Key"
            type={showPrivateKey ? 'text' : 'password'}
            value={privateKey} onChange={(e) => setPrivateKey(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={() => setShowPrivateKey(!showPrivateKey)} sx={{ color: t.textSecondary }}>
                  {showPrivateKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              ),
            }}
          />
          <TextField size="small" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={generateKeystore}>
            Generate & Save
          </Button>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: t.bg, borderRadius: '24px', p: 3, boxShadow: shadows.extruded }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif', color: t.text }}>Decrypt Keystore</Typography>
          <Button variant="contained" component="label" sx={{ alignSelf: 'flex-start' }}>
            Upload Keystore File
            <input type="file" hidden onChange={handleFileUpload} />
          </Button>
          {fileUploaded && <Alert severity="success" sx={{ borderRadius: '16px' }}>Keystore file uploaded</Alert>}
          <TextField size="small" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={decryptKeystore}>
            Decrypt
          </Button>
          {decryptSuccess && <Alert severity="success" sx={{ borderRadius: '16px' }}>Decrypted successfully</Alert>}
          {decryptedAddress && (
            <TextField size="small" label="Address" value={decryptedAddress}
              InputProps={{ readOnly: true, endAdornment: (
                <IconButton size="small" onClick={() => copyToClipboard(decryptedAddress)} sx={{ color: t.textSecondary }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}}
            />
          )}
          {decryptedPrivateKey && (
            <TextField size="small" label="Private Key"
              type={showDecryptedPrivateKey ? 'text' : 'password'} value={decryptedPrivateKey}
              InputProps={{ readOnly: true, endAdornment: (
                <>
                  <IconButton size="small" onClick={() => setShowDecryptedPrivateKey(!showDecryptedPrivateKey)} sx={{ color: t.textSecondary }}>
                    {showDecryptedPrivateKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                  <IconButton size="small" onClick={() => copyToClipboard(decryptedPrivateKey)} sx={{ color: t.textSecondary }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </>
              )}}
            />
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
