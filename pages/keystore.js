import { Button, Paper, Stack, TextField, Typography, IconButton, Grid, Alert } from "@mui/material";
import { useState } from "react";
import { ethers } from "ethers";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function KeyStore() {
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [keystoreJson, setKeystoreJson] = useState('');
  const [decryptedAddress, setDecryptedAddress] = useState('');
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState('');
  const [decryptSuccess, setDecryptSuccess] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showDecryptedPrivateKey, setShowDecryptedPrivateKey] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const generateKeystore = async () => {
    try {
      if (!privateKey || !password) {
        window.alert('Please enter both private key and password');
        return;
      }
      const wallet = new ethers.Wallet(privateKey);
      const keystore = await wallet.encrypt(password);
      const fileName = `UTC--${new Date().toISOString().replace(/:/g, '-')}--${wallet.address}`;
      const blob = new Blob([keystore], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error(error);
      window.alert(error.message);
    }
  };

  const decryptKeystore = async () => {
    try {
      if (!keystoreJson || !password) {
        window.alert('Please upload a keystore file and enter the password');
        return;
      }
      const wallet = await ethers.Wallet.fromEncryptedJson(keystoreJson, password);
      setDecryptedAddress(wallet.address);
      setDecryptedPrivateKey(wallet.privateKey);
      setDecryptSuccess(true);
    } catch (error) {
      console.error(error);
      window.alert(error.message);
      setDecryptSuccess(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setKeystoreJson(event.target.result);
      setFileUploaded(true);
    };
    reader.readAsText(e.target.files[0]);
  };

  return (
    <Paper sx={{padding: '30px', margin: '50px', overflow:'auto'}}>
      <Typography variant="h4" gutterBottom>Keystore Management Tool</Typography>
      
      <Stack spacing={4}>
        <Paper elevation={3} sx={{padding: '20px'}}>
          <Typography variant="h5" gutterBottom>Generate Keystore</Typography>
          <Stack spacing={2}>
            <TextField 
              label="Private Key" 
              type={showPrivateKey ? "text" : "password"}
              value={privateKey} 
              onChange={e => setPrivateKey(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPrivateKey(!showPrivateKey)}>
                    {showPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={generateKeystore}
            >
              Generate and Save Keystore
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{padding: '20px'}}>
          <Typography variant="h5" gutterBottom>Decrypt Keystore</Typography>
          <Stack spacing={2}>
            <Button variant="contained" component="label">
              Upload Keystore File
              <input 
                type="file" 
                hidden 
                onChange={handleFileUpload}
              />
            </Button>
            {fileUploaded && (
              <Alert severity="success">Keystore file uploaded successfully!</Alert>
            )}
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={decryptKeystore}
            >
              Decrypt Keystore
            </Button>

            {decryptSuccess && (
              <Alert severity="success">Keystore decrypted successfully!</Alert>
            )}

            {decryptedAddress && (
              <TextField 
                label="Decrypted Address" 
                value={decryptedAddress} 
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => copyToClipboard(decryptedAddress)}>
                      <ContentCopyIcon />
                    </IconButton>
                  ),
                }}
              />
            )}
            {decryptedPrivateKey && (
              <TextField 
                label="Decrypted Private Key" 
                type={showDecryptedPrivateKey ? "text" : "password"}
                value={decryptedPrivateKey} 
                InputProps={{
                  endAdornment: (
                    <>
                      <IconButton onClick={() => setShowDecryptedPrivateKey(!showDecryptedPrivateKey)}>
                        {showDecryptedPrivateKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton onClick={() => copyToClipboard(decryptedPrivateKey)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </>
                  ),
                }}
              />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}